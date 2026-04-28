import React from "react";
import { AlertTriangle, PlayCircle } from "lucide-react";

export function InterventionPanel({ videoUrl, signName, onResume }) {
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
        You seem to be struggling with <strong>{signName}</strong>. Watch this correction tutorial.
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
