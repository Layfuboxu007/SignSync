import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Link, useLocation } from "react-router-dom";

export default function ASLTracker() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const location = useLocation();
  
  const curriculum = location.state?.curriculum || ['Thumbs Up Demo'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const targetSign = curriculum[currentIndex];
  
  const [model, setModel] = useState(null);
  const [poseModel, setPoseModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gesture, setGesture] = useState(`Waiting for action...`);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Progression Safelock Hook
  useEffect(() => {
    if (score >= 100 && !completed && !isAdvancing) {
      setIsAdvancing(true);
      if (currentIndex < curriculum.length - 1) {
        setGesture(`Detected! Loading ${curriculum[currentIndex + 1]}...`);
        setTimeout(() => {
          setScore(0);
          setCurrentIndex(c => c + 1);
          setIsAdvancing(false);
        }, 1200);
      } else {
        setCompleted(true);
        setGesture("COURSE COMPLETE");
      }
    }
  }, [score, completed, isAdvancing, currentIndex, curriculum]);

  // Load the ML models on mount
  useEffect(() => {
    const loadModels = async () => {
      // Ensure backend is 'webgl' for performance
      await tf.setBackend('webgl');
      await tf.ready();
      
      const handNet = await handpose.load();
      
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const poseNet = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

      setModel(handNet);
      setPoseModel(poseNet);
      setLoading(false);
      console.log("Both Models loaded");
    };
    loadModels();
  }, []);

  // Continuously request animation frames to detect
  const savedDetect = useRef();
  useEffect(() => {
    savedDetect.current = detect;
  });

  useEffect(() => {
    let interval;
    if (model && poseModel) {
      interval = setInterval(() => {
        if (savedDetect.current) {
          savedDetect.current(model, poseModel);
        }
      }, 100); // 10FPS essentially, good for browser
    }
    return () => clearInterval(interval);
  }, [model, poseModel]);

  const detect = async (net, poseNet) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Extract hand & pose simultaneously via Promise.all for speed
      const [hand, poses] = await Promise.all([
        net.estimateHands(video),
        poseNet.estimatePoses(video)
      ]);

      if (hand.length > 0 || poses.length > 0) {
        drawMesh(hand, poses, canvasRef.current.getContext("2d"));
        if (hand.length > 0 && !completed) {
          checkSign(hand[0].landmarks, targetSign);
        }
      } else {
        setGesture(`Tracking active... Make sign: '${targetSign}'`);
      }
    }
  };

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

  const drawMesh = (handPredictions, posePredictions, ctx) => {
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
      
      // Draw lines
      for (let j = 0; j < Object.keys(currentPoints).length; j++) {
        let finger = Object.keys(currentPoints)[j];
        for (let k = 0; k < currentPoints[finger].length - 1; k++) {
          const firstJointIndex = currentPoints[finger][k];
          const secondJointIndex = currentPoints[finger][k + 1];
          ctx.beginPath();
          ctx.moveTo(
            landmarks[firstJointIndex][0],
            landmarks[firstJointIndex][1]
          );
          ctx.lineTo(
            landmarks[secondJointIndex][0],
            landmarks[secondJointIndex][1]
          );
          ctx.strokeStyle = "#10b981"; // Teal/Green accent
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // Draw Joint dots
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
  };

  const checkSign = (landmarks, targetSign) => {
    if (score >= 100 || completed || isAdvancing) return;

    let isMatch = false;

    const thumbTipX = landmarks[4][0];
    const thumbTipY = landmarks[4][1];
    const indexTipY = landmarks[8][1];
    const indexTipX = landmarks[8][0];
    const middleTipY = landmarks[12][1];
    const middleTipX = landmarks[12][0];
    const ringTipY = landmarks[16][1];
    const ringTipX = landmarks[16][0];
    const pinkyTipY = landmarks[20][1];
    const pinkyTipX = landmarks[20][0];

    const indexBaseY = landmarks[5][1];
    const middleBaseY = landmarks[9][1];
    const ringBaseY = landmarks[13][1];
    const pinkyBaseY = landmarks[17][1];

    const fI_s = indexTipY < indexBaseY - 20;
    const fM_s = middleTipY < middleBaseY - 20;
    const fR_s = ringTipY < ringBaseY - 20;
    const fP_s = pinkyTipY < pinkyBaseY - 20;

    const fI_c = indexTipY > indexBaseY - 10;
    const fM_c = middleTipY > middleBaseY - 10;
    const fR_c = ringTipY > ringBaseY - 10;
    const fP_c = pinkyTipY > pinkyBaseY - 10;
    
    // Scale & Rotation invariant extension check (wrist to tip vs wrist to PIP)
    const d = (i, j) => Math.sqrt(Math.pow(landmarks[i][0] - landmarks[j][0], 2) + Math.pow(landmarks[i][1] - landmarks[j][1], 2));
    const fI_ext = d(0, 8) > d(0, 6);
    const fM_ext = d(0, 12) > d(0, 10);
    const fR_ext = d(0, 16) > d(0, 14);
    const fP_ext = d(0, 20) > d(0, 18);
    const indexDown = indexTipY > indexBaseY;

    const sep_IM = Math.abs(indexTipX - middleTipX) > 20;
    const thumbUp = thumbTipY < indexBaseY - 30;
    const thumbOut = Math.abs(thumbTipX - indexTipX) > 40;
    const thumbTucked = Math.abs(thumbTipX - ringTipX) < 60;

    switch(targetSign) {
      case 'A': isMatch = fI_c && fM_c && fR_c && fP_c && Math.abs(thumbTipX - landmarks[5][0]) < 50; break;
      case 'B': isMatch = fI_s && fM_s && fR_s && fP_s && thumbTucked; break;
      case 'C': isMatch = !fI_s && !fI_c && !fM_s && !fM_c; break; 
      case 'D': isMatch = fI_s && fM_c && fR_c && fP_c; break;
      case 'E': isMatch = fI_c && fM_c && fR_c && fP_c && Math.abs(thumbTipY - indexTipY) < 30; break;
      case 'F': isMatch = fM_s && fR_s && fP_s && Math.abs(indexTipY - thumbTipY) < 30; break;
      case 'G': isMatch = fI_ext && !fM_ext && !fR_ext && !fP_ext && !fI_s; break;
      case 'H': isMatch = fI_ext && fM_ext && !fR_ext && !fP_ext && !sep_IM && !fI_s; break;
      case 'I': isMatch = fI_c && fM_c && fR_c && fP_s; break;
      case 'J': isMatch = fP_s; break; 
      case 'K': isMatch = fI_s && fM_s && sep_IM && thumbUp; break;
      case 'L': isMatch = fI_s && fM_c && fR_c && fP_c && thumbOut; break;
      case 'M': isMatch = fI_c && fM_c && fR_c && fP_c; break; 
      case 'N': isMatch = fI_c && fM_c && fR_c && fP_c; break; 
      case 'O': isMatch = Math.abs(indexTipY - thumbTipY) < 40 && Math.abs(indexTipX - thumbTipX) < 40; break;
      case 'P': isMatch = fI_ext && fM_ext && !fR_ext && !fP_ext && sep_IM && !fI_s; break; 
      case 'Q': isMatch = fI_ext && !fM_ext && !fR_ext && !fP_ext && !fI_s; break; 
      case 'R': isMatch = fI_s && fM_s && !sep_IM; break; 
      case 'S': isMatch = fI_c && fM_c && fR_c && fP_c && thumbTucked; break;
      case 'T': isMatch = fI_c && fM_c && fR_c && fP_c; break;
      case 'U': isMatch = fI_s && fM_s && !sep_IM && fR_c && fP_c; break;
      case 'V': isMatch = fI_s && fM_s && sep_IM && fR_c && fP_c; break;
      case 'W': isMatch = fI_s && fM_s && fR_s && fP_c; break;
      case 'X': isMatch = !fI_s && !fI_c && fM_c && fR_c && fP_c; break; 
      case 'Y': isMatch = fI_c && fM_c && fR_c && fP_s && thumbOut; break;
      case 'Z': isMatch = fI_s && fM_c && fR_c && fP_c; break; 
      case 'Thumbs Up Demo': isMatch = thumbUp && fI_c && fM_c && fR_c && fP_c; break;
      default: isMatch = false;
    }

    if (isMatch) {
      setGesture(`MATCHED: '${targetSign}'`);
      setScore(prev => Math.min(prev + 10, 100));
    } else if (!isAdvancing) {
      setGesture(`Tracking active... Make sign: '${targetSign}'`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <style>{`
        .tracker-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .tracker-layout {
            grid-template-columns: 1fr 320px;
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
           <div>
             <div className="badge" style={{ marginBottom: "16px" }}>PRACTICE ROOM</div>
             <h1 style={{ fontSize: "var(--text-xl)", marginBottom: "4px" }}>AI Video Tracker</h1>
             <p className="text-muted text-sm">Lesson Focus: Hands-On Practice</p>
           </div>
           <Link to="/courses" className="secondary" style={{ padding: "10px 20px", textDecoration: "none", borderRadius: "var(--radius-sm)" }}>
             Exit Session
           </Link>
        </header>

        <section className="tracker-layout">
           {/* Camera Feed */}
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
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 1,
                  transform: "scaleX(-1)" // Mirroring webcam for better UX
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

           {/* Metrics Sidebar */}
           <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             
              {completed ? (
               <div className="card-outer" style={{ background: "var(--color-brand-light)", borderColor: "var(--color-brand-dark)", textAlign: "center" }}>
                 <div style={{ width: "64px", height: "64px", margin: "0 auto 16px", borderRadius: "50%", background: "var(--color-brand)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </div>
                 <h2 style={{ color: "var(--color-brand-dark)", fontSize: "var(--text-lg)", marginBottom: "8px" }}>Lesson Completed</h2>
                 <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "24px" }}>You successfully passed the AI accuracy check for all signs in this lesson.</p>
                 <Link to="/courses">
                   <button style={{ width: "100%" }}>Return to Courses</button>
                 </Link>
               </div>
             ) : (
               <>
                 <div className="card-outer flex flex-col items-center justify-center text-center">
                   <p className="text-muted font-semibold text-xs mb-2">TARGET SIGN</p>
                   <div style={{ fontSize: "var(--text-3xl)", fontWeight: "800", color: "var(--color-text-primary)", margin: "16px 0" }}>{targetSign}</div>
                   <h3 style={{ fontSize: "var(--text-sm)", color: gesture.includes("MATCHED") ? "var(--color-brand)" : "var(--color-text-secondary)" }}>{gesture}</h3>
                 </div>

                 <div className="card-outer">
                   <p className="text-muted font-semibold text-xs mb-4">ACCURACY</p>
                   <div style={{ height: "6px", background: "var(--color-overlay)", borderRadius: "var(--radius-full)", marginBottom: "12px", overflow: "hidden" }}>
                      <div style={{ background: "var(--color-brand)", width: `${score}%`, height: "100%", transition: "width 0.2s ease-out" }}></div>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="font-semibold">{score}% Matched</span>
                     <span className="text-muted">Hold Form</span>
                   </div>
                 </div>

                 <div className="card-inner" style={{ marginTop: "auto" }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                       <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-primary)", fontWeight: "700" }}>PROGRESS</p>
                       <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{currentIndex + 1} of {curriculum.length}</p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {curriculum.map((item, idx) => (
                        <div key={idx} style={{ flex: 1, height: "4px", background: idx < currentIndex ? "var(--color-brand)" : "var(--color-border)", borderRadius: "var(--radius-full)" }}></div>
                      ))}
                    </div>
                 </div>
               </>
             )}
           </aside>
        </section>

      </div>
    </div>
  );
}
