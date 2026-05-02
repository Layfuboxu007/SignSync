import { useState, useEffect, useRef } from "react";
import PoseWorker from "../workers/poseWorker.js?worker";

export function useGestureTracker() {
  const [loading, setLoading] = useState(true);
  const workerRef = useRef(null);

  useEffect(() => {
    const worker = new PoseWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === 'MODELS_LOADED') {
        setLoading(false);
        console.log("TFJS Models loaded in Web Worker");
      }
    };

    worker.postMessage({ type: 'INIT' });

    return () => {
      worker.terminate();
    };
  }, []);

  return { workerRef, loading };
}
