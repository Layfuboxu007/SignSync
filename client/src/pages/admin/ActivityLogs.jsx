import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { ActivitySquare, AlertTriangle, PlayCircle, CheckCircle2 } from "lucide-react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/api/admin/logs?limit=100");
        setLogs(res.data.logs);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getEventStyle = (type) => {
    switch (type) {
      case 'ai_failure': return { icon: <AlertTriangle size={16} />, color: "var(--color-danger)", bg: "hsla(0, 84%, 60%, 0.1)" };
      case 'session_start': return { icon: <PlayCircle size={16} />, color: "#1E40AF", bg: "hsla(220, 84%, 40%, 0.1)" };
      case 'module_complete': return { icon: <CheckCircle2 size={16} />, color: "var(--color-success)", bg: "hsla(160, 84%, 39%, 0.1)" };
      default: return { icon: <ActivitySquare size={16} />, color: "var(--color-text-muted)", bg: "var(--color-overlay)" };
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading System Telemetry...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: "var(--space-6) var(--space-8)", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", color: "var(--color-brand-dark)", marginBottom: "var(--space-1)", fontFamily: "Fira Code, monospace" }}>System Telemetry</h1>
        <p className="text-muted text-sm">Raw, timestamped event stream from all users.</p>
      </div>

      <div className="card-outer p-0 overflow-hidden">
        {logs.map((log, idx) => {
          const style = getEventStyle(log.event_type);
          const email = log.users ? log.users.email : 'System/Anonymous';
          
          return (
            <div key={log.id} style={{ 
              display: "flex", gap: "var(--space-4)", alignItems: "center",
              padding: "var(--space-4) var(--space-6)",
              borderBottom: idx === logs.length - 1 ? "none" : "1px solid var(--color-border)",
              transition: "background 0.2s"
            }} className="hover:bg-slate-50">
              
              <div style={{ width: "120px", flexShrink: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "Fira Code, monospace" }}>
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>

              <div style={{ 
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "32px", height: "32px", borderRadius: "50%",
                backgroundColor: style.bg, color: style.color, flexShrink: 0
              }}>
                {style.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ textTransform: "capitalize" }}>{log.event_type.replace('_', ' ')}</span>
                  {log.metadata?.module && <span className="badge" style={{ fontSize: "10px", padding: "2px 6px" }}>{log.metadata.module}</span>}
                  {log.metadata?.sign && <span className="badge" style={{ fontSize: "10px", padding: "2px 6px", background: "var(--color-danger)", color: "#fff" }}>Failed: {log.metadata.sign}</span>}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "Fira Code, monospace", marginTop: "4px" }}>
                  Actor: {email}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
