import React from "react";
import { ShieldAlert } from "lucide-react";

export function PrivacyDisclosureModal({ onAccept }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(250, 249, 246, 0.95)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div className="card-outer animate-fade-in" style={{
        maxWidth: "480px",
        textAlign: "center",
        padding: "var(--space-8)"
      }}>
        <div style={{
          width: "64px", height: "64px",
          borderRadius: "50%",
          background: "var(--color-brand-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto var(--space-6)"
        }}>
          <ShieldAlert size={32} color="var(--color-brand)" />
        </div>
        
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-3)" }}>
          Camera Privacy Guarantee
        </h2>
        
        <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
          SignSync uses your camera to evaluate your signing accuracy in real-time. 
        </p>
        <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-6)", lineHeight: 1.6 }}>
          <strong>Your privacy is our priority.</strong> The AI models run entirely inside your browser. 
          No video or image data ever leaves your device or gets sent to our servers.
        </p>

        <button onClick={onAccept} style={{ width: "100%", padding: "var(--space-3) 0", fontSize: "var(--text-md)" }}>
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
