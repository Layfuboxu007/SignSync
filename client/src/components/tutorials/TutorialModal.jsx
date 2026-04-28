import React, { useEffect } from "react";
import { X, PlayCircle } from "lucide-react";

export function TutorialModal({ videoUrl, title, onComplete }) {
  useEffect(() => {
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: "var(--space-6)"
    }}>
      <div className="card-outer animate-fade-in" style={{
        maxWidth: "800px", width: "100%",
        padding: "var(--space-8)",
        background: "var(--color-canvas)",
        position: "relative"
      }}>
        <button 
          onClick={onComplete}
          style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)", padding: "var(--space-2)", background: "transparent", color: "var(--color-text-muted)" }}
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <PlayCircle size={32} color="var(--color-brand)" />
          <div>
            <h2 style={{ fontSize: "var(--text-xl)" }}>{title}</h2>
            <p className="text-muted text-sm">Module Introduction Tutorial</p>
          </div>
        </div>

        <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", background: "#000", aspectRatio: "16/9", marginBottom: "var(--space-6)" }}>
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        <div className="flex justify-end">
          <button onClick={onComplete} style={{ padding: "var(--space-3) var(--space-6)" }}>
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}
