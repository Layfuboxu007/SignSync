import { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import * as poseDetection from "@tensorflow-models/pose-detection";

export function useGestureTracker() {
  const [model, setModel] = useState(null);
  const [poseModel, setPoseModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        
        const handNet = await handpose.load();
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const poseNet = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

        if (isMounted) {
          setModel(handNet);
          setPoseModel(poseNet);
          setLoading(false);
          console.log("TFJS Models loaded successfully");
        }
      } catch (err) {
        console.error("Failed to load TFJS models", err);
      }
    };
    
    loadModels();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { model, poseModel, loading };
}
