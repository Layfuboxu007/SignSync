import { useState, useEffect } from "react";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // Exponential: 2s, 4s, 8s

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useGestureTracker() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  const [poseModel, setPoseModel] = useState(null);

  useEffect(() => {
    let handsInstance = null;
    let poseInstance = null;
    let cancelled = false;

    const initModels = async (attempt = 1) => {
      try {
        if (cancelled) return;

        if (!window.Hands || !window.Pose) {
          // Wait for CDNs to load if they haven't yet
          await delay(500);
        }

        if (!window.Hands || !window.Pose) {
          throw new Error("MediaPipe scripts not loaded. Check your network connection.");
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
          if (cancelled) return;
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
          if (cancelled) return;
          setPoseModel(poseInstance);
        }
        
        console.log("MediaPipe Native Models Loaded Successfully!");
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error(`Failed to load MediaPipe models (attempt ${attempt}/${MAX_RETRIES})`, err);
        
        if (cancelled) return;

        if (attempt < MAX_RETRIES) {
          const backoff = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${backoff}ms...`);
          await delay(backoff);
          if (!cancelled) {
            return initModels(attempt + 1);
          }
        } else {
          setError(`AI tracker failed to load after ${MAX_RETRIES} attempts. Please check your internet connection and refresh the page.`);
          setLoading(false);
        }
      }
    };

    initModels();

    return () => {
      cancelled = true;
      if (handsInstance) handsInstance.close();
      if (poseInstance) poseInstance.close();
    };
  }, []);

  return { model, poseModel, loading, error };
}
