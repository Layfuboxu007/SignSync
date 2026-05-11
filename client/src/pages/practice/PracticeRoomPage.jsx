import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePracticeSession, DETECTION_STATES } from "../../hooks/usePracticeSession";
import WebcamCanvas from "../../components/tracker/WebcamCanvas";
import { DemoLoop } from "../../components/tutorials/DemoLoop";
import { TutorialModal } from "../../components/tutorials/TutorialModal";


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

function TargetSignCard({ targetSign, gestureStatus, detectionState, currentErrorCode, CONSECUTIVE_FRAMES_REQUIRED }) {
  const stateColors = {
    [DETECTION_STATES.MATCHED]: "var(--color-brand)",
    [DETECTION_STATES.HOLDING]: "#f59e0b",
    [DETECTION_STATES.WRONG_SIGN]: "#ef4444",
    [DETECTION_STATES.NO_HAND]: "var(--color-text-muted)",
    [DETECTION_STATES.WAITING]: "var(--color-text-secondary)",
  };

  const stateHints = {
    [DETECTION_STATES.NO_HAND]: "Position your hand in front of the camera",
    [DETECTION_STATES.WRONG_SIGN]: currentErrorCode 
      ? currentErrorCode.replace(/^ERROR_/, '').replace(/_/g, ' ').toLowerCase() 
      : "Adjust your hand position",
    [DETECTION_STATES.HOLDING]: "Keep holding — almost there!",
    [DETECTION_STATES.MATCHED]: "Perfect!",
    [DETECTION_STATES.WAITING]: "Preparing tracker...",
  };

  return (
    <div className="card-outer flex flex-col items-center justify-center text-center">
      <p className="text-muted font-semibold text-xs mb-2">TARGET SIGN</p>
      <div style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: "var(--color-text-primary)", margin: "var(--space-4) 0" }}>{targetSign}</div>
      <h3 aria-live="polite" aria-atomic="true" style={{ fontSize: "var(--text-sm)", color: stateColors[detectionState] || "var(--color-text-secondary)" }}>
        {gestureStatus}
      </h3>
      {detectionState !== DETECTION_STATES.MATCHED && detectionState !== DETECTION_STATES.WAITING && (
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
          {stateHints[detectionState]}
        </p>
      )}
    </div>
  );
}

function MotionSignCard({ targetSign, demoUrl, onComplete }) {
  return (
    <div className="card-outer" style={{ textAlign: "center" }}>
      <div className="badge" style={{ marginBottom: "var(--space-4)", background: "hsla(280, 84%, 60%, 0.1)", color: "hsl(280, 84%, 60%)", borderColor: "hsla(280, 84%, 60%, 0.3)" }}>
        MOTION SIGN
      </div>
      <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>'{targetSign}' requires movement</h3>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
        This sign involves a motion arc that cannot be evaluated by the AI tracker. 
        Watch the demo video, practice the movement, then confirm when ready.
      </p>
      {demoUrl && (
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "var(--space-6)", border: "1px solid var(--color-border)" }}>
          <video src={demoUrl} autoPlay loop muted playsInline style={{ width: "100%", display: "block" }} />
        </div>
      )}
      <button onClick={onComplete} style={{ width: "100%" }}>
        I've practiced this — Continue
      </button>
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
           <div key={idx} style={{ flex: 1, height: "4px", background: idx < currentIndex ? "var(--color-brand)" : idx === currentIndex ? "var(--color-brand-dark)" : "var(--color-border)", borderRadius: "var(--radius-full)" }}></div>
         ))}
       </div>
    </div>
  );
}

function ModelErrorCard({ error }) {
  return (
    <div className="card-outer" style={{ textAlign: "center", borderColor: "#ef4444" }}>
      <h3 style={{ color: "#ef4444", marginBottom: "var(--space-3)" }}>AI Tracker Failed to Load</h3>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
        {error || "The gesture recognition models could not be loaded. This may be due to a network issue."}
      </p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}

function AccessDeniedCard({ reason }) {
  return (
    <div className="card-outer" style={{ textAlign: "center", borderColor: "#ef4444", padding: "var(--space-10)" }}>
      <h2 style={{ color: "#ef4444", marginBottom: "var(--space-4)" }}>Access Denied</h2>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
        {reason || "You do not have access to this course."}
      </p>
      <Link to="/courses">
        <button>Back to Catalog</button>
      </Link>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function PracticeRoomPage() {
  const navigate = useNavigate();
  const {
    flatCurriculum, currentIndex, targetItem, targetSign, targetModule, targetIsMotionSign,
    gestureStatus, detectionState, currentErrorCode, score, completed, modelLoading, modelError, model, poseModel,
    accessDenied,
    showIntro, handleIntroComplete, handleReplayIntro,
    handleMotionSignComplete,
    detect,
    CONSECUTIVE_FRAMES_REQUIRED,
  } = usePracticeSession();

  // Webcam detection loop
  const [refs, setRefs] = useState(null);
  const handleFrameProcessed = useCallback((webcamRef, canvasRef, drawMesh) => {
    setRefs({ webcamRef, canvasRef, drawMesh });
  }, []);

  const savedDetect = useRef(detect);
  useEffect(() => {
    savedDetect.current = detect;
  });

  useEffect(() => {
    let interval;
    if (refs && model && poseModel && !targetIsMotionSign) {
      interval = setInterval(() => {
        savedDetect.current(refs.webcamRef, refs.canvasRef, refs.drawMesh);
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [refs, model, poseModel, targetIsMotionSign]);

  // Access denied — show error
  if (accessDenied) {
    return (
      <div className="container" style={{ padding: "var(--space-20) var(--space-5)", maxWidth: "600px", margin: "0 auto" }}>
        <AccessDeniedCard reason={accessDenied} />
      </div>
    );
  }

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
             <button className="secondary" style={{ padding: "var(--space-2) var(--space-4)" }} onClick={handleReplayIntro}>
               Replay Intro
             </button>
          )}
        </div>
      </div>

      <section className="tracker-layout relative">
         <div style={{ position: "relative" }}>
           {modelError ? (
             <ModelErrorCard error={modelError} />
           ) : (
             <>
               <WebcamCanvas loading={modelLoading} onFrameProcessed={handleFrameProcessed} />
             </>
           )}
         </div>

         <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {completed ? (
              <CompletionCard />
            ) : targetIsMotionSign ? (
              <>
                <MotionSignCard 
                  targetSign={targetSign} 
                  demoUrl={targetItem.demoUrl} 
                  onComplete={handleMotionSignComplete} 
                />
                <ProgressBar currentIndex={currentIndex} total={flatCurriculum.length} items={flatCurriculum} />
              </>
            ) : (
              <>
                <TargetSignCard 
                  targetSign={targetSign} 
                  gestureStatus={gestureStatus} 
                  detectionState={detectionState}
                  currentErrorCode={currentErrorCode}
                  CONSECUTIVE_FRAMES_REQUIRED={CONSECUTIVE_FRAMES_REQUIRED}
                />
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
