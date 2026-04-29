import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { ActivitySquare, AlertTriangle, PlayCircle, CheckCircle2, Download } from "lucide-react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/admin/logs?limit=100");
        setLogs(res.data.logs);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (!logs.length) return;
    
    const headers = ["Timestamp", "Event Type", "Actor Email", "Metadata"];
    
    const rows = logs.map(log => {
      const email = log.users ? log.users.email : 'System/Anonymous';
      const meta = log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : '';
      return [
        new Date(log.created_at).toISOString(),
        log.event_type || "",
        email,
        meta ? `"${meta}"` : ""
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `signsync_telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEventStyle = (type) => {
    switch (type) {
      case 'ai_failure': 
        return { icon: <AlertTriangle size={16} />, color: "#ef4444", bg: "#fef2f2", border: "#fecaca" };
      case 'session_start': 
        return { icon: <PlayCircle size={16} />, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
      case 'module_complete': 
        return { icon: <CheckCircle2 size={16} />, color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" };
      default: 
        return { icon: <ActivitySquare size={16} />, color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
    }
  };

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
      <div style={{ display: "inline-block", padding: "16px", borderRadius: "16px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
        <ActivitySquare size={24} color="#2563eb" className="animate-pulse mb-2 mx-auto" />
        Loading Telemetry Stream...
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>System Telemetry</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Raw, timestamped event stream from all users.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#eff6ff",
            color: "#2563eb", border: "1px solid #bfdbfe",
            padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
            cursor: "pointer", transition: "all 200ms ease"
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#dbeafe"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ 
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
      }}>
        {logs.map((log, idx) => {
          const style = getEventStyle(log.event_type);
          const email = log.users ? log.users.email : 'System/Anonymous';
          
          return (
            <div key={log.id} style={{ 
              display: "flex", gap: "24px", alignItems: "center",
              padding: "20px 24px",
              borderBottom: idx === logs.length - 1 ? "none" : "1px solid #f1f5f9",
              transition: "background 200ms ease"
            }} 
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              
              <div style={{ width: "100px", flexShrink: 0, fontSize: "12px", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>

              <div style={{ 
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "10px",
                backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`,
                flexShrink: 0
              }}>
                {style.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ textTransform: "capitalize" }}>{log.event_type.replace('_', ' ')}</span>
                  {log.metadata?.module && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "4px", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
                      {log.metadata.module}
                    </span>
                  )}
                  {log.metadata?.sign && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#ef4444", fontFamily: "'Fira Code', monospace" }}>
                      Failed: {log.metadata.sign}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "'Fira Code', monospace", marginTop: "6px" }}>
                  <span style={{ color: "#94a3b8" }}>Actor:</span> {email}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
