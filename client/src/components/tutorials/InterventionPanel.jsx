import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function InterventionPanel({ videoUrl, signName, onResume, errorCode }) {
  const errorMapping = {
    "ERROR_INDEX_NOT_CURLED": "Try curling your index finger tighter towards your palm.",
    "ERROR_THUMB_POSITION": "Adjust your thumb position. Keep it close to your index finger.",
    "ERROR_INDEX_NOT_STRAIGHT": "Ensure your index finger is pointing straight up.",
    "ERROR_THUMB_NOT_TUCKED": "Tuck your thumb across your palm.",
    "ERROR_FINGERS_NOT_STRAIGHT": "Keep all your fingers straight and together.",
    "ERROR_FINGERS_SHOULD_CURVE_LIKE_C": "Curve your fingers and thumb to form the letter 'C'.",
    "ERROR_OTHER_FINGERS_NOT_CURLED": "Make sure your other fingers are curled into your palm.",
    "ERROR_FINGERS_NOT_TIGHTLY_CURLED": "Curl your fingers tightly so they touch your palm.",
    "ERROR_THREE_FINGERS_NOT_STRAIGHT": "Keep your middle, ring, and pinky fingers straight and spread apart.",
    "ERROR_INDEX_THUMB_NOT_TOUCHING": "Touch the tips of your index finger and thumb together.",
    "ERROR_INDEX_SHOULD_POINT_SIDEWAYS": "Point your index finger horizontally sideways.",
    "ERROR_INDEX_MIDDLE_SHOULD_POINT_SIDEWAYS": "Point both index and middle fingers sideways.",
    "ERROR_PINKY_NOT_STRAIGHT": "Extend your pinky finger straight up.",
    "ERROR_PINKY_NOT_STRAIGHT_SWOOPING": "Keep your pinky extended to trace the 'J' swoop.",
    "ERROR_THUMB_NOT_UP": "Point your thumb straight up towards the ceiling.",
    "ERROR_INDEX_MIDDLE_NOT_SEPARATED": "Separate your index and middle fingers.",
    "ERROR_THUMB_NOT_OUT": "Extend your thumb outward, perpendicular to your index finger.",
    "ERROR_THUMB_SHOULD_BE_UNDER_THREE_FINGERS": "Tuck your thumb under your first three fingers.",
    "ERROR_THUMB_SHOULD_BE_UNDER_TWO_FINGERS": "Tuck your thumb under your first two fingers.",
    "ERROR_FINGERS_SHOULD_FORM_O_SHAPE": "Touch all your fingertips to your thumb to form an 'O'.",
    "ERROR_WRIST_SHOULD_POINT_DOWN": "Drop your wrist down so your fingers point towards the floor.",
    "ERROR_INDEX_THUMB_SHOULD_POINT_DOWN": "Point your index finger and thumb downwards.",
    "ERROR_INDEX_MIDDLE_SHOULD_CROSS": "Cross your middle finger over your index finger.",
    "ERROR_THUMB_SHOULD_BE_OVER_FINGERS": "Wrap your thumb tightly over the front of your curled fingers.",
    "ERROR_THUMB_SHOULD_BE_UNDER_INDEX": "Tuck your thumb between your index and middle fingers.",
    "ERROR_INDEX_MIDDLE_SHOULD_TOUCH": "Keep your index and middle fingers straight and pressed together.",
    "ERROR_INDEX_MIDDLE_NOT_STRAIGHT": "Ensure both index and middle fingers are fully extended.",
    "ERROR_INDEX_SHOULD_BE_HOOKED": "Hook your index finger while keeping other fingers curled.",
    "ERROR_THUMB_PINKY_NOT_OUT": "Extend both your thumb and pinky finger outward.",
    "ERROR_MIDDLE_FINGERS_NOT_CURLED": "Keep your index, middle, and ring fingers tightly curled.",
    "ERROR_INDEX_SHOULD_DRAW_Z": "Point your index finger to draw the 'Z' shape.",
    "ERROR_UNKNOWN_SIGN": "Please verify your handshape against the reference video."
  };

  const instruction = errorCode ? errorMapping[errorCode] : "You seem to be struggling. Watch this correction tutorial.";
  return (
    <div className="card-outer animate-fade-in" style={{
      position: "absolute",
      bottom: "var(--space-6)",
      right: "var(--space-6)",
      width: "320px",
      zIndex: 50,
      background: "var(--color-canvas)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      border: "1px solid var(--color-warning)"
    }}>
      <div className="flex items-center gap-2 mb-3" style={{ color: "var(--color-warning)" }}>
        <AlertTriangle size={20} />
        <h3 style={{ fontSize: "var(--text-md)", fontWeight: "700" }}>Coach Intervention</h3>
      </div>
      
      <p className="text-sm text-muted mb-4">
        <strong>Feedback: </strong>{instruction}
      </p>

      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#000", marginBottom: "var(--space-4)" }}>
        <video 
          src={videoUrl} 
          controls 
          autoPlay 
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      </div>

      <button onClick={onResume} style={{ width: "100%", background: "var(--color-warning)", color: "#000" }}>
        Resume Tracking
      </button>
    </div>
  );
}
