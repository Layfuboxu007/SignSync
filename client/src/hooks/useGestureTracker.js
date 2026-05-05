import { useState, useEffect } from "react";

export function useGestureTracker() {
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState(null);
  const [poseModel, setPoseModel] = useState(null);

  useEffect(() => {
    let handsInstance = null;
    let poseInstance = null;

    const initModels = async () => {
      try {
        if (!window.Hands || !window.Pose) {
          // Wait for CDNs to load if they haven't yet
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (window.Hands) {
          handsInstance = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
          handsInstance.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
          });
          // Adapter to match TFJS API signature for usePracticeSession.js
          // Native MediaPipe returns normalized {x,y,z} objects (0-1 range).
          // gestureMath.js and WebcamCanvas.jsx expect pixel-scaled [x,y,z] arrays.
          handsInstance.estimateHands = (video) => {
            return new Promise(async (resolve) => {
              handsInstance.onResults((results) => {
                const w = video.videoWidth || 640;
                const h = video.videoHeight || 480;
                const formatted = results.multiHandLandmarks ? results.multiHandLandmarks.map((lm, idx) => ({
                  landmarks: lm.map(pt => [pt.x * w, pt.y * h, pt.z || 0]),
                  score: results.multiHandedness && results.multiHandedness[idx] ? results.multiHandedness[idx].score : undefined
                })) : [];
                resolve(formatted);
              });
              await handsInstance.send({ image: video });
            });
          };

          // Dummy initialization to trigger loading
          await handsInstance.initialize();
          setModel(handsInstance);
        }

        if (window.Pose) {
          poseInstance = new window.Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          });
          poseInstance.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          // Adapter to match TFJS API signature
          // Native MediaPipe Pose returns normalized {x,y,z,visibility} with NO names.
          // WebcamCanvas.jsx expects pixel-scaled {name, x, y, score} objects.
          const POSE_LANDMARK_NAMES = [
            "nose","left_eye_inner","left_eye","left_eye_outer",
            "right_eye_inner","right_eye","right_eye_outer",
            "left_ear","right_ear","mouth_left","mouth_right",
            "left_shoulder","right_shoulder","left_elbow","right_elbow",
            "left_wrist","right_wrist","left_pinky","right_pinky",
            "left_index","right_index","left_thumb","right_thumb",
            "left_hip","right_hip","left_knee","right_knee",
            "left_ankle","right_ankle","left_heel","right_heel",
            "left_foot_index","right_foot_index"
          ];
          poseInstance.estimatePoses = (video) => {
            return new Promise(async (resolve) => {
              poseInstance.onResults((results) => {
                const w = video.videoWidth || 640;
                const h = video.videoHeight || 480;
                const formatted = results.poseLandmarks ? [{
                  keypoints: results.poseLandmarks.map((pt, idx) => ({
                    name: POSE_LANDMARK_NAMES[idx] || `landmark_${idx}`,
                    x: pt.x * w,
                    y: pt.y * h,
                    score: pt.visibility || 0
                  }))
                }] : [];
                resolve(formatted);
              });
              await poseInstance.send({ image: video });
            });
          };

          await poseInstance.initialize();
          setPoseModel(poseInstance);
        }
        
        console.log("MediaPipe Native Models Loaded Successfully!");
        setLoading(false);
      } catch (err) {
        console.error("Failed to load native MediaPipe models", err);
        setLoading(false);
      }
    };

    initModels();

    return () => {
      if (handsInstance) handsInstance.close();
      if (poseInstance) poseInstance.close();
    };
  }, []);

  return { model, poseModel, loading };
}
