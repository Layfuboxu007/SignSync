import React from "react";

export function DemoLoop({ videoUrl, signName }) {
  if (!videoUrl) return null;

  return (
    <div className="card-outer flex flex-col items-center justify-center text-center mt-4">
      <p className="text-muted font-semibold text-xs mb-2">DEMO: {signName}</p>
      <div 
        style={{ 
          width: "100%", 
          borderRadius: "var(--radius-lg)", 
          overflow: "hidden",
          background: "var(--color-overlay)"
        }}
      >
        <video 
          src={videoUrl}
          autoPlay 
          loop 
          muted 
          playsInline
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </div>
  );
}
