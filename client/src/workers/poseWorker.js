import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import * as poseDetection from "@tensorflow-models/pose-detection";

let handNet = null;
let poseNet = null;

async function loadModels() {
  try {
    // Attempt webgl, but fallback if needed in worker context
    await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
    await tf.ready();
    
    handNet = await handpose.load();
    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
    poseNet = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    
    self.postMessage({ type: 'MODELS_LOADED' });
  } catch (err) {
    console.error("Worker failed to load models", err);
  }
}

self.onmessage = async (e) => {
  const { type, payload } = e.data;
  
  if (type === 'INIT') {
    loadModels();
  } else if (type === 'EVALUATE_FRAME') {
    if (!handNet || !poseNet) return;
    
    try {
      // Payload is an ImageBitmap
      const [hand, poses] = await Promise.all([
        handNet.estimateHands(payload),
        poseNet.estimatePoses(payload)
      ]);
      
      self.postMessage({ type: 'FRAME_RESULT', payload: { hand, poses } });
    } catch (err) {
      console.error("Worker estimation error", err);
    } finally {
      // Close the bitmap to free memory!
      if (payload && payload.close) {
         payload.close();
      }
    }
  }
};
