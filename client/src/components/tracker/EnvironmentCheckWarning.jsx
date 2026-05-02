import React from "react";
import { AlertCircle } from "lucide-react";

export function EnvironmentCheckWarning({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      position: "absolute",
      top: "var(--space-4)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--color-warning)",
      color: "#000",
      padding: "var(--space-3) var(--space-4)",
      borderRadius: "var(--radius-md)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      zIndex: 100,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      width: "90%",
      maxWidth: "400px"
    }}>
      <AlertCircle size={20} style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "var(--text-sm)", margin: 0, flex: 1, fontWeight: "500" }}>{message}</p>
      <button 
        onClick={onDismiss} 
        style={{ 
          background: "transparent", 
          border: "none", 
          padding: "var(--space-1)", 
          color: "#000", 
          cursor: "pointer",
          fontWeight: "700"
        }}
      >
        ✕
      </button>
    </div>
  );
}
