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
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          // Adapter to match TFJS API signature for usePracticeSession.js
          handsInstance.estimateHands = (video) => {
            return new Promise(async (resolve) => {
              handsInstance.onResults((results) => {
                const formatted = results.multiHandLandmarks ? results.multiHandLandmarks.map((lm, idx) => ({ 
                  landmarks: lm,
                  score: results.multiHandedness && results.multiHandedness[idx] ? results.multiHandedness[idx].score : 0
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
          poseInstance.estimatePoses = (video) => {
            return new Promise(async (resolve) => {
              poseInstance.onResults((results) => {
                const formatted = results.poseLandmarks ? [{ keypoints: results.poseLandmarks }] : [];
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
