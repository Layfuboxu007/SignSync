import React, { useRef, useEffect, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { lerpHandPredictions } from "../../utils/landmarkSmoother";

const currentPoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20]
};

const poseConnections = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"]
];

export default function WebcamCanvas({ loading, onFrameProcessed }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  // ── Interpolation state ─────────────────────────────────
  // Store previous + current detection results for lerp rendering
  const interpRef = useRef({
    prevHands: [],
    targetHands: [],
    prevPoses: [],
    targetPoses: [],
    prevMatch: false,
    targetMatch: false,
    lastDetectTime: 0,
    detectInterval: 100, // expected ms between detections
  });
  const rafRef = useRef(null);

  // Paint function — draws the mesh at the given interpolation state
  const paint = useCallback((handPredictions, posePredictions, ctx, isValidMatch = false) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // 1. Draw Upper Body Pose Mesh
    if (posePredictions && posePredictions.length > 0) {
      const keypoints = posePredictions[0].keypoints;
      const keypointMap = {};
      keypoints.forEach(kp => {
        if (kp.score > 0.3) {
          keypointMap[kp.name] = kp;
        }
      });
      
      poseConnections.forEach(([p1, p2]) => {
        if (keypointMap[p1] && keypointMap[p2]) {
          ctx.beginPath();
          ctx.moveTo(keypointMap[p1].x, keypointMap[p1].y);
          ctx.lineTo(keypointMap[p2].x, keypointMap[p2].y);
          ctx.strokeStyle = "#ec4899"; // Pink body mesh
          ctx.lineWidth = 6;
          ctx.stroke();
        }
      });
      
      const targetJoints = ["nose", "left_eye", "right_eye", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist"];
      targetJoints.forEach(joint => {
        if (keypointMap[joint]) {
          ctx.beginPath();
          ctx.arc(keypointMap[joint].x, keypointMap[joint].y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.strokeStyle = "#ec4899";
          ctx.stroke();
        }
      });
    }

    // 2. Draw Finger Mesh
    if (handPredictions) {
      handPredictions.forEach((prediction) => {
        const landmarks = prediction.landmarks;
        
        for (let j = 0; j < Object.keys(currentPoints).length; j++) {
          let finger = Object.keys(currentPoints)[j];
          for (let k = 0; k < currentPoints[finger].length - 1; k++) {
            const firstJointIndex = currentPoints[finger][k];
            const secondJointIndex = currentPoints[finger][k + 1];
            ctx.beginPath();
            ctx.moveTo(landmarks[firstJointIndex][0], landmarks[firstJointIndex][1]);
            ctx.lineTo(landmarks[secondJointIndex][0], landmarks[secondJointIndex][1]);
            ctx.strokeStyle = isValidMatch ? "#10b981" : "#ef4444"; // Green if valid, Red if invalid
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }

        for (let i = 0; i < landmarks.length; i++) {
          const x = landmarks[i][0];
          const y = landmarks[i][1];
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 3 * Math.PI);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.strokeStyle = isValidMatch ? "#10b981" : "#ef4444";
          ctx.stroke();
        }
      });
    }
  }, []);

  // ── 60 fps render loop with interpolation ───────────────
  useEffect(() => {
    let running = true;

    const renderLoop = () => {
      if (!running || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      const ip = interpRef.current;

      if (ip.targetHands.length > 0 || ip.targetPoses.length > 0) {
        const elapsed = performance.now() - ip.lastDetectTime;
        const t = Math.min(1, elapsed / ip.detectInterval);

        // Interpolate hand landmarks between previous and target
        const lerpedHands = lerpHandPredictions(ip.prevHands, ip.targetHands, t);
        paint(lerpedHands, ip.targetPoses, ctx, ip.targetMatch);
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paint]);

  // drawMesh is now a "data setter" — pushes new detection targets
  // into the interpolation ref. The rAF loop handles actual rendering.
  const drawMesh = useCallback((handPredictions, posePredictions, _ctx, isValidMatch = false) => {
    const ip = interpRef.current;
    ip.prevHands = ip.targetHands.length > 0 ? ip.targetHands : handPredictions;
    ip.targetHands = handPredictions;
    ip.prevPoses = ip.targetPoses;
    ip.targetPoses = posePredictions;
    ip.targetMatch = isValidMatch;
    ip.lastDetectTime = performance.now();
  }, []);

  // Expose the refs and draw functions so the parent can manage the detection loop
  useEffect(() => {
    if (onFrameProcessed) {
      onFrameProcessed(webcamRef, canvasRef, drawMesh);
    }
  }, [onFrameProcessed, drawMesh]);

  // Camera error handler for the Webcam component
  const handleUserMediaError = useCallback((error) => {
    console.error("Camera access error:", error);
    if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
      setCameraError("Camera access is required for the Practice Room. Please enable camera permissions in your browser settings and reload this page.");
    } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
      setCameraError("No camera detected. Please connect a webcam and reload the page.");
    } else if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
      setCameraError("Your camera is being used by another application. Please close other apps using the camera and try again.");
    } else {
      setCameraError("Unable to access camera. Please check your device settings and try again.");
    }
  }, []);

  return (
    <div className="card-outer" style={{ position: "relative", minHeight: "600px", padding: 0, overflow: "hidden", borderRadius: "var(--radius-xl)" }}>
      {loading ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 10, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid var(--color-border)", borderTopColor: "var(--color-brand)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <h2 style={{ marginTop: "24px", fontSize: "var(--text-lg)" }}>Loading AI Models...</h2>
          <p className="text-muted text-sm text-center" style={{ maxWidth: "400px", marginTop: "8px" }}>Initializing hardware acceleration for browser-based tracking.</p>
        </div>
      ) : null}

      {cameraError ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 15, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", padding: "var(--space-8)", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "hsla(0, 84%, 60%, 0.1)", color: "#ef4444", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "var(--space-5)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9.34"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>
          </div>
          <h3 style={{ fontSize: "var(--text-md)", color: "#ef4444", marginBottom: "var(--space-3)" }}>Camera Unavailable</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", maxWidth: "400px", marginBottom: "var(--space-6)" }}>
            {cameraError}
          </p>
          <button onClick={() => window.location.reload()} style={{ width: "auto" }}>Reload Page</button>
        </div>
      ) : null}

      <Webcam
        ref={webcamRef}
        videoConstraints={{ width: 480, height: 360, facingMode: "user" }}
        onUserMediaError={handleUserMediaError}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          transform: "scaleX(-1)"
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 2,
          transform: "scaleX(-1)"
        }}
      />
    </div>
  );
}
