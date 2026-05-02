import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { ActivitySquare, AlertTriangle, PlayCircle, CheckCircle2, Download, FileText, FileSpreadsheet, CreditCard } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("logs"); // "logs" or "transactions"
  const [logs, setLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "logs") {
          const res = await API.get("/api/admin/logs?limit=200");
          setLogs(res.data.logs || []);
        } else {
          const res = await API.get("/api/admin/transactions?limit=200");
          setTransactions(res.data.transactions || []);
        }
      } catch (err) {
        console.error("Failed to fetch reports data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleExportCSV = (type) => {
    const data = type === "logs" ? logs : transactions;
    if (!data.length) return;

    let headers, rows;
    if (type === "logs") {
      headers = ["Timestamp", "Event Type", "Actor Email", "Metadata"];
      rows = data.map(log => [
        new Date(log.created_at).toISOString(),
        log.event_type || "",
        log.users ? log.users.email : 'System/Anonymous',
        log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : ""
      ]);
    } else {
      headers = ["Timestamp", "User Email", "Amount", "Status"];
      rows = data.map(t => [
        new Date(t.created_at).toISOString(),
        t.users ? t.users.email : 'Unknown',
        t.amount || 0,
        t.payment_status || "unknown"
      ]);
    }

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `signsync_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportPDF = (type) => {
    const data = type === "logs" ? logs : transactions;
    if (!data.length) return;

    const doc = new jsPDF();
    doc.text(`SignSync ${type === 'logs' ? 'Activity Logs' : 'Transaction History'}`, 14, 15);

    let head, body;
    if (type === "logs") {
      head = [["Timestamp", "Event Type", "User Email", "Metadata"]];
      body = data.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.event_type || "",
        log.users ? log.users.email : 'System/Anonymous',
        log.metadata ? JSON.stringify(log.metadata) : ""
      ]);
    } else {
      head = [["Timestamp", "User Email", "Amount", "Status"]];
      body = data.map(t => [
        new Date(t.created_at).toLocaleString(),
        t.users ? t.users.email : 'Unknown',
        `₱${t.amount || 0}`,
        t.payment_status || "unknown"
      ]);
    }

    doc.autoTable({ head, body, startY: 20 });
    doc.save(`signsync_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = (type) => {
    const data = type === "logs" ? logs : transactions;
    if (!data.length) return;

    let formattedData;
    if (type === "logs") {
      formattedData = data.map(log => ({
        "Timestamp": new Date(log.created_at).toLocaleString(),
        "Event Type": log.event_type || "",
        "Actor Email": log.users ? log.users.email : 'System/Anonymous',
        "Metadata": log.metadata ? JSON.stringify(log.metadata) : ""
      }));
    } else {
      formattedData = data.map(t => ({
        "Timestamp": new Date(t.created_at).toLocaleString(),
        "User Email": t.users ? t.users.email : 'Unknown',
        "Amount": t.amount || 0,
        "Status": t.payment_status || "unknown"
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `signsync_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>System Reports</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>View and export activity logs and transaction history.</p>
        </div>
        
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => handleExportCSV(activeTab)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
            <Download size={14} /> CSV
          </button>
          <button onClick={() => handleExportExcel(activeTab)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={() => handleExportPDF(activeTab)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
        <button 
          onClick={() => setActiveTab("logs")}
          style={{ background: "transparent", border: "none", color: activeTab === "logs" ? "var(--color-brand)" : "#64748b", fontSize: "16px", fontWeight: "600", borderBottom: activeTab === "logs" ? "2px solid var(--color-brand)" : "none", paddingBottom: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <ActivitySquare size={18} /> User Activity Logs
        </button>
        <button 
          onClick={() => setActiveTab("transactions")}
          style={{ background: "transparent", border: "none", color: activeTab === "transactions" ? "var(--color-brand)" : "#64748b", fontSize: "16px", fontWeight: "600", borderBottom: activeTab === "transactions" ? "2px solid var(--color-brand)" : "none", paddingBottom: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <CreditCard size={18} /> Transaction History
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>Loading {activeTab}...</div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {activeTab === "logs" && logs.map((log, idx) => {
            const style = getEventStyle(log.event_type);
            const email = log.users ? log.users.email : 'System/Anonymous';
            
            return (
              <div key={log.id} style={{ display: "flex", gap: "24px", alignItems: "center", padding: "20px 24px", borderBottom: idx === logs.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                <div style={{ width: "100px", flexShrink: 0, fontSize: "12px", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`, flexShrink: 0 }}>
                  {style.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ textTransform: "capitalize" }}>{log.event_type.replace('_', ' ')}</span>
                    {log.metadata?.module && <span style={{ fontSize: "10px", padding: "2px 8px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "4px", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>{log.metadata.module}</span>}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "'Fira Code', monospace", marginTop: "6px" }}>
                    <span style={{ color: "#94a3b8" }}>Actor:</span> {email}
                  </div>
                </div>
              </div>
            );
          })}

          {activeTab === "transactions" && transactions.map((t, idx) => (
             <div key={t.id} style={{ display: "flex", gap: "24px", alignItems: "center", padding: "20px 24px", borderBottom: idx === transactions.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                <div style={{ width: "100px", flexShrink: 0, fontSize: "12px", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
                  {new Date(t.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#d97706", border: `1px solid #fde68a`, flexShrink: 0 }}>
                  <CreditCard size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>₱{t.amount} PHP</span>
                    <span style={{ fontSize: "10px", padding: "2px 8px", background: t.payment_status === 'completed' ? "#ecfdf5" : "#fef2f2", border: "1px solid #e2e8f0", borderRadius: "4px", color: t.payment_status === 'completed' ? "#10b981" : "#ef4444", textTransform: "capitalize", fontFamily: "'Fira Code', monospace" }}>{t.payment_status}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "'Fira Code', monospace", marginTop: "6px" }}>
                    <span style={{ color: "#94a3b8" }}>User:</span> {t.users ? t.users.email : 'Unknown'}
                  </div>
                </div>
             </div>
          ))}

          {((activeTab === "logs" && logs.length === 0) || (activeTab === "transactions" && transactions.length === 0)) && (
             <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>No data available for this report.</div>
          )}
        </div>
      )}
    </div>
  );
}
