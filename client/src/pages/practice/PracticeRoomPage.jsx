import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { usePracticeSession } from "../../hooks/usePracticeSession";
import WebcamCanvas from "../../components/tracker/WebcamCanvas";
import { DemoLoop } from "../../components/tutorials/DemoLoop";
import { TutorialModal } from "../../components/tutorials/TutorialModal";
import InterventionPanel from "../../components/tutorials/InterventionPanel";
import { PrivacyDisclosureModal } from "../../components/modals/PrivacyDisclosureModal";
import { EnvironmentCheckWarning } from "../../components/tracker/EnvironmentCheckWarning";
import { useAnalytics } from "../../hooks/useAnalytics";

// ── Sub-components ──────────────────────────────────────────

function CompletionCard() {
  return (
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
  );
}

function TargetSignCard({ targetSign, gestureStatus }) {
  return (
    <div className="card-outer flex flex-col items-center justify-center text-center">
      <p className="text-muted font-semibold text-xs mb-2">TARGET SIGN</p>
      <div style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: "var(--color-text-primary)", margin: "var(--space-4) 0" }}>{targetSign}</div>
      <h3 aria-live="polite" aria-atomic="true" style={{ fontSize: "var(--text-sm)", color: gestureStatus.includes("MATCHED") ? "var(--color-brand)" : "var(--color-text-secondary)" }}>{gestureStatus}</h3>
    </div>
  );
}

function AccuracyMeter({ score }) {
  return (
    <div className="card-outer">
      <p className="text-muted font-semibold text-xs mb-4">ACCURACY</p>
      <div style={{ height: "6px", background: "var(--color-overlay)", borderRadius: "var(--radius-full)", marginBottom: "var(--space-3)", overflow: "hidden" }}>
         <div style={{ background: "var(--color-brand)", width: `${score}%`, height: "100%", transition: "width 0.2s ease-out" }}></div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{score}% Matched</span>
        <span className="text-muted">Hold Form</span>
      </div>
    </div>
  );
}

function ProgressBar({ currentIndex, total, items }) {
  return (
    <div className="card-inner" style={{ marginTop: "auto" }}>
       <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-primary)", fontWeight: "700" }}>PROGRESS</p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{currentIndex + 1} of {total}</p>
       </div>
       <div style={{ display: "flex", gap: "6px" }}>
         {items.map((_, idx) => (
           <div key={idx} style={{ flex: 1, height: "4px", background: idx < currentIndex ? "var(--color-brand)" : "var(--color-border)", borderRadius: "var(--radius-full)" }}></div>
         ))}
       </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function PracticeRoomPage() {
  const { trackEvent } = useAnalytics();
  const {
    flatCurriculum, currentIndex, targetItem, targetSign, targetModule,
    gestureStatus, score, completed, modelLoading, model, poseModel,
    showIntro, showIntervention, handleIntroComplete, handleResumeFromIntervention,
    detect
  } = usePracticeSession();

  const [privacyAccepted, setPrivacyAccepted] = useState(localStorage.getItem('signsync_privacy_accepted') === 'true');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  
  // To avoid un-used variables from breaking the build
  const workerRef = useRef(null);
  // Webcam detection loop
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
             <button className="secondary" style={{ padding: "var(--space-2) var(--space-4)" }} onClick={() => handleIntroComplete}>
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
           <WebcamCanvas loading={modelLoading} onFrameProcessed={handleFrameProcessed} />
           {showIntervention && targetItem.correctionUrl && (
             <InterventionPanel 
                videoUrl={targetItem.correctionUrl}
                signName={targetSign}
                onResume={handleResumeFromIntervention}
             />
           )}
         </div>

         <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {completed ? (
             <CompletionCard />
           ) : (
             <>
               <TargetSignCard targetSign={targetSign} gestureStatus={gestureStatus} />
               <DemoLoop videoUrl={targetItem.demoUrl} signName={targetSign} />
               <AccuracyMeter score={score} />
               <ProgressBar currentIndex={currentIndex} total={flatCurriculum.length} items={flatCurriculum} />
             </>
           )}
         </aside>
      </section>
    </div>
  );
}
