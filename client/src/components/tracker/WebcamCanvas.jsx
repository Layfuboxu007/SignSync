import React, { useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";

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

  // Expose the refs and draw functions so the parent can manage the detection loop
  // without this component holding the business logic.
  const drawMesh = useCallback((handPredictions, posePredictions, ctx) => {
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
            ctx.strokeStyle = "#10b981"; // Teal accent
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
          ctx.strokeStyle = "#10b981";
          ctx.stroke();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (onFrameProcessed) {
      onFrameProcessed(webcamRef, canvasRef, drawMesh);
    }
  }, [onFrameProcessed, drawMesh]);

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

      <Webcam
        ref={webcamRef}
        videoConstraints={{ width: 480, height: 360, facingMode: "user" }}
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
