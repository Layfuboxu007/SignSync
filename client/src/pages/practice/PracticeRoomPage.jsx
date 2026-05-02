import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGestureTracker } from "../../hooks/useGestureTracker";
import { evaluateGestureMatch } from "../../utils/gestureMath";
import WebcamCanvas from "../../components/tracker/WebcamCanvas";
import { DemoLoop } from "../../components/tutorials/DemoLoop";
import { TutorialModal } from "../../components/tutorials/TutorialModal";
import InterventionPanel from "../../components/tutorials/InterventionPanel";
import { PrivacyDisclosureModal } from "../../components/modals/PrivacyDisclosureModal";
import { EnvironmentCheckWarning } from "../../components/tracker/EnvironmentCheckWarning";
import { useAnalytics } from "../../hooks/useAnalytics";
import { API } from "../../api";

export default function PracticeRoomPage() {
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  
  const flatCurriculum = useMemo(() => {
    const raw = location.state?.curriculum;
    if (!raw || !raw.length) return [{ module: 'Demo Lesson', sign: 'Thumbs Up Demo' }];
    
    if (typeof raw[0] === 'string') {
       return raw.map(sign => ({ module: 'General Practice', sign }));
    }

    const flattened = [];
    raw.forEach(mod => {
      (mod.signs || []).forEach(sign => {
         flattened.push({ 
           module: mod.module, 
           introVideoUrl: mod.introVideoUrl,
           name: sign.name || sign,
           demoUrl: sign.demoUrl,
           correctionUrl: sign.correctionUrl
         });
      });
    });
    return flattened.length > 0 ? flattened : [{ module: 'Demo Lesson', sign: 'Thumbs Up Demo' }];
  }, [location.state]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const targetItem = flatCurriculum[currentIndex] || flatCurriculum[0];
  const targetSign = targetItem.name || targetItem.sign;
  const targetModule = targetItem.module;
  
  const { workerRef, loading } = useGestureTracker();
  
  const [gestureStatus, setGestureStatus] = useState(`Waiting for action...`);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Tutorial System State
  const [showIntro, setShowIntro] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const failureStartTimeRef = useRef(null);
  const [lastErrorCode, setLastErrorCode] = useState(null);

  // Phase 2 State
  const [privacyAccepted, setPrivacyAccepted] = useState(localStorage.getItem('signsync_privacy_accepted') === 'true');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  const [envWarning, setEnvWarning] = useState(null);
  const envCheckedRef = useRef(false);

  // Performance Tracking
  const lastFrameTimeRef = useRef(null);
  const lowFpsStartTimeRef = useRef(null);

  // Track Session Start
  useEffect(() => {
    if (targetModule) {
      trackEvent('session_start', { module: targetModule });
    }
  }, [targetModule, trackEvent]);

  // Initialize Module Intro check
  useEffect(() => {
    const cacheKey = `signsync_intro_seen_${targetModule.replace(/\s+/g, '_')}`;
    const hasSeen = localStorage.getItem(cacheKey);
    if (!hasSeen && targetItem.introVideoUrl) {
      setShowIntro(true);
    }
  }, [targetModule, targetItem.introVideoUrl, showIntro]);

  const handleIntroComplete = () => {
    const cacheKey = `signsync_intro_seen_${targetModule.replace(/\s+/g, '_')}`;
    localStorage.setItem(cacheKey, 'true');
    setShowIntro(false);
  };

  const handleResumeFromIntervention = () => {
    setShowIntervention(false);
    failureStartTimeRef.current = null; // Reset failure timer
  };

  // Progression Safelock
  useEffect(() => {
    if (score >= 100 && !completed && !isAdvancing) {
      setIsAdvancing(true);
      failureStartTimeRef.current = null; // Reset failure timer
      
      const currentModule = flatCurriculum[currentIndex].module;
      
      if (currentIndex < flatCurriculum.length - 1) {
        const nextModule = flatCurriculum[currentIndex + 1].module;
        
        // Did we just finish a module boundary?
        if (currentModule !== nextModule) {
           trackEvent('module_complete', { module: currentModule });
           const courseId = location.state?.courseId;
           if (courseId) {
             API.post(`/api/courses/${courseId}/progress`, { module_name: currentModule })
               .catch(err => console.error("Failed to save course progress", err));
           }
        }

        setGestureStatus(`Detected! Loading ${flatCurriculum[currentIndex + 1].name || flatCurriculum[currentIndex + 1].sign}...`);
        setTimeout(() => {
          setScore(0);
          setCurrentIndex(c => c + 1);
          setIsAdvancing(false);
        }, 1200);
      } else {
        setCompleted(true);
        setGestureStatus("COURSE COMPLETE");
        trackEvent('module_complete', { module: currentModule });
        
        // Save progress to DB permanently
        const courseId = location.state?.courseId;
        if (courseId) {
          API.post(`/api/courses/${courseId}/progress`, { module_name: currentModule })
            .catch(err => console.error("Failed to save course progress", err));
        }
      }
    }
  }, [score, completed, isAdvancing, currentIndex, flatCurriculum, trackEvent, location.state]);

  // A ref to prevent sending too many frames if worker is busy
  const isProcessingRef = useRef(false);

  const processFrameResult = useCallback((hand, poses, refs) => {
    isProcessingRef.current = false;
    if (!refs || flashcardMode) return;

    // Performance Monitoring (FPS calculation)
    const now = Date.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    // Roughly if frameTime > 150ms it's < 7 FPS
    if (frameTime > 150) {
      if (!lowFpsStartTimeRef.current) lowFpsStartTimeRef.current = now;
      else if (now - lowFpsStartTimeRef.current > 5000 && !showPerformanceWarning) {
        setShowPerformanceWarning(true);
        trackEvent('performance_degraded');
      }
    } else {
      lowFpsStartTimeRef.current = null; // Reset if it recovers
    }

    if (hand.length > 0 || poses.length > 0) {
      const handConfidence = hand[0]?.score || hand[0]?.handInViewConfidence || 0;

      // Environment Pre-check (runs once)
      if (!envCheckedRef.current && refs.canvasRef.current) {
         envCheckedRef.current = true;
         // Check lighting via a crude canvas sample
         const ctx = refs.canvasRef.current.getContext("2d");
         try {
           const imageData = ctx.getImageData(0, 0, refs.canvasRef.current.width, refs.canvasRef.current.height);
           const data = imageData.data;
           let sum = 0;
           // Sample every 10th pixel for performance
           for (let i = 0; i < data.length; i += 40) {
             const r = data[i], g = data[i+1], b = data[i+2];
             sum += (0.299*r + 0.587*g + 0.114*b); 
           }
           const avgLuminance = sum / (data.length / 40);
           
           if (avgLuminance < 40) {
             setEnvWarning("Your room appears too dark. Please turn on a light for better AI tracking.");
           } else if (handConfidence > 0 && handConfidence < 0.6) {
             setEnvWarning("Your background may be too cluttered. The AI is struggling to lock onto your hand.");
           }
         } catch (e) {
           // Ignore canvas taint errors
         }
      }

      // Confidence Gating
      if (hand.length > 0 && handConfidence < 0.6) {
        if (!isAdvancing) setGestureStatus(`Low visibility... adjust camera`);
        return;
      }

      refs.drawMesh(hand, poses, refs.canvasRef.current.getContext("2d"));
      if (hand.length > 0 && !completed && !isAdvancing) {
        const { isMatch, errorCode } = evaluateGestureMatch(hand[0].landmarks, targetSign);
        if (isMatch) {
          setGestureStatus(`MATCHED: '${targetSign}'`);
          setScore(prev => Math.min(prev + 10, 100));
          failureStartTimeRef.current = null;
        } else {
           setGestureStatus(`Tracking active... Make sign: '${targetSign}'`);
           
           if (errorCode) setLastErrorCode(errorCode);

           if (!failureStartTimeRef.current) {
             failureStartTimeRef.current = Date.now();
           } else if (Date.now() - failureStartTimeRef.current > 3000 && targetItem.correctionUrl) { 
             setShowIntervention(true);
             trackEvent('ai_failure', { sign: targetSign, module: targetModule, error: errorCode });
             failureStartTimeRef.current = null;
           }
        }
      }
    } else {
      if (!isAdvancing) setGestureStatus(`Tracking active... Make sign: '${targetSign}'`);
    }
  }, [completed, isAdvancing, targetSign, targetItem, trackEvent, targetModule, flashcardMode, showPerformanceWarning]);

  const detect = useCallback(async (webcamRef, canvasRef) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      workerRef.current &&
      !loading &&
      !showIntro && 
      !showIntervention &&
      privacyAccepted &&
      !flashcardMode &&
      !showPerformanceWarning
    ) {
      if (isProcessingRef.current) return;

      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      isProcessingRef.current = true;
      try {
        const bitmap = await createImageBitmap(video);
        workerRef.current.postMessage({ type: 'EVALUATE_FRAME', payload: bitmap }, [bitmap]);
      } catch (err) {
        console.error("Bitmap creation failed:", err);
        isProcessingRef.current = false;
      }
    }
  }, [workerRef, loading, showIntro, showIntervention, privacyAccepted, flashcardMode, showPerformanceWarning]);

  const [refs, setRefs] = useState(null);
  const handleFrameProcessed = useCallback((webcamRef, canvasRef, drawMesh) => {
    setRefs({ webcamRef, canvasRef, drawMesh });
  }, []);

  const savedDetect = useRef(detect);
  useEffect(() => {
    savedDetect.current = detect;
  });

  // Listener for worker messages
  useEffect(() => {
    if (!workerRef.current) return;
    const worker = workerRef.current;
    
    const handleMessage = (e) => {
      if (e.data.type === 'FRAME_RESULT') {
        const { hand, poses } = e.data.payload;
        if (refs) processFrameResult(hand, poses, refs);
      }
    };
    
    worker.addEventListener('message', handleMessage);
    return () => worker.removeEventListener('message', handleMessage);
  }, [workerRef, refs, processFrameResult]);

  useEffect(() => {
    let interval;
    if (refs && workerRef.current && !flashcardMode) {
      interval = setInterval(() => {
        savedDetect.current(refs.webcamRef, refs.canvasRef, refs.drawMesh);
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [refs, workerRef]);

  return (
    <div className="container relative" style={{ padding: "var(--space-6) var(--space-5)", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
      
      {showIntro && targetItem.introVideoUrl && (
        <TutorialModal 
          videoUrl={targetItem.introVideoUrl} 
          title={targetModule} 
          onComplete={handleIntroComplete} 
        />
      )}

      <div style={{ marginBottom: "var(--space-6)" }}>
        <div className="badge" style={{ marginBottom: "var(--space-2)" }}>PRACTICE ROOM</div>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-1)" }}>{targetModule}</h1>
            <p className="text-muted text-sm">AI Video Tracker &middot; Hands-On Practice</p>
          </div>
          {targetItem.introVideoUrl && (
             <button className="secondary" style={{ padding: "var(--space-2) var(--space-4)" }} onClick={() => setShowIntro(true)}>
               Replay Intro
             </button>
          )}
        </div>
      </div>

      {!privacyAccepted && (
        <PrivacyDisclosureModal onAccept={() => {
          localStorage.setItem('signsync_privacy_accepted', 'true');
          setPrivacyAccepted(true);
        }} />
      )}

      {showPerformanceWarning && !flashcardMode && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
           <div className="card-outer animate-fade-in" style={{ maxWidth: "400px", textAlign: "center", padding: "var(--space-6)", background: "#fff" }}>
              <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>Performance Issue Detected</h2>
              <p className="text-muted text-sm mb-4">Your device is struggling to run the AI model smoothly. Would you like to switch to Flashcard Mode? This disables the camera and lets you practice at your own pace.</p>
              <div className="flex gap-2">
                <button className="secondary" style={{ flex: 1 }} onClick={() => setShowPerformanceWarning(false)}>Keep Trying</button>
                <button style={{ flex: 1 }} onClick={() => { setFlashcardMode(true); setShowPerformanceWarning(false); }}>Enable Flashcards</button>
              </div>
           </div>
        </div>
      )}

      <section className="tracker-layout relative">
         <div style={{ position: "relative" }}>
           <EnvironmentCheckWarning message={envWarning} onDismiss={() => setEnvWarning(null)} />
           
           {!flashcardMode ? (
             <>
               {privacyAccepted && <WebcamCanvas loading={loading} onFrameProcessed={handleFrameProcessed} />}
               {showIntervention && targetItem.correctionUrl && (
                 <InterventionPanel 
                    videoUrl={targetItem.correctionUrl}
                    signName={targetSign}
                    onResume={handleResumeFromIntervention}
                    errorCode={lastErrorCode}
                 />
               )}
             </>
           ) : (
             <div className="card-outer flex items-center justify-center" style={{ minHeight: "600px", background: "var(--color-surface)", flexDirection: "column" }}>
                <h2 style={{ marginBottom: "var(--space-2)" }}>Flashcard Mode</h2>
                <p className="text-muted text-sm mb-4">Watch the reference video and try to copy it.</p>
                {!flashcardMode && <DemoLoop videoUrl={targetItem.demoUrl} signName={targetSign} />}
             </div>
           )}
         </div>

         <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {completed ? (
             <div className="card-outer" style={{ background: "var(--color-brand-light)", borderColor: "var(--color-brand-dark)", textAlign: "center" }}>
               <div style={{ width: "64px", height: "64px", margin: "0 auto var(--space-4)", borderRadius: "50%", background: "var(--color-brand)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
               </div>
               <h2 style={{ color: "var(--color-brand-dark)", fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>Lesson Completed</h2>
               <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>You successfully passed the AI accuracy check for all signs in this lesson.</p>
               <Link to="/dashboard">
                 <button style={{ width: "100%" }}>Return to Dashboard</button>
               </Link>
             </div>
           ) : (
             <>
               <div className="card-outer flex flex-col items-center justify-center text-center">
                 <p className="text-muted font-semibold text-xs mb-2">TARGET SIGN</p>
                 <div style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: "var(--color-text-primary)", margin: "var(--space-4) 0" }}>{targetSign}</div>
                 <h3 aria-live="polite" aria-atomic="true" style={{ fontSize: "var(--text-sm)", color: gestureStatus.includes("MATCHED") ? "var(--color-brand)" : "var(--color-text-secondary)" }}>{gestureStatus}</h3>
               </div>

               {!flashcardMode && <DemoLoop videoUrl={targetItem.demoUrl} signName={targetSign} />}

               <div className="card-outer">
                 {flashcardMode ? (
                   <button style={{ padding: "var(--space-4)", fontSize: "var(--text-lg)", background: "var(--color-brand)", color: "#fff", width: "100%", marginBottom: "var(--space-4)" }} onClick={() => setScore(100)}>
                     I Did It Correctly
                   </button>
                 ) : (
                  <>
                    <p className="text-muted font-semibold text-xs mb-4">ACCURACY</p>
                    <div style={{ height: "6px", background: "var(--color-overlay)", borderRadius: "var(--radius-full)", marginBottom: "var(--space-3)", overflow: "hidden" }}>
                       <div style={{ background: "var(--color-brand)", width: `${score}%`, height: "100%", transition: "width 0.2s ease-out" }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{score}% Matched</span>
                      <span className="text-muted">Hold Form</span>
                    </div>
                  </>
                 )}
               </div>

               <div className="card-inner" style={{ marginTop: "auto" }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-4)" }}>
                     <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-primary)", fontWeight: "700" }}>PROGRESS</p>
                     <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{currentIndex + 1} of {flatCurriculum.length}</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {flatCurriculum.map((item, idx) => (
                      <div key={idx} style={{ flex: 1, height: "4px", background: idx < currentIndex ? "var(--color-brand)" : "var(--color-border)", borderRadius: "var(--radius-full)" }}></div>
                    ))}
                  </div>
               </div>
             </>
           )}
         </aside>
      </section>
    </div>
  );
}
