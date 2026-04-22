// This mock completely bypasses Vite's syntax crash when using TensorFlow Pose Detection
// Because we use MoveNet and NOT BlazePose, we do not need the real mediapipe loader.
export class Pose {}
export const VERSION = "0.0.0";
