import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { Users, MoreVertical, Shield, GraduationCap, User, Download } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/admin/users?limit=50");
        setUsers(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleExportCSV = () => {
    if (!users.length) return;
    
    // Create CSV header
    const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Membership Status", "Joined Date"];
    
    // Create CSV rows
    const rows = users.map(u => [
      u.id,
      u.first_name || "",
      u.last_name || "",
      u.email || "",
      u.role || "learner",
      u.membership_status || "free",
      new Date(u.created_at).toISOString().split('T')[0]
    ]);
    
    // Combine and encode
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `signsync_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={14} color="#ef4444" />; // Red 500
      case 'instructor': return <GraduationCap size={14} color="#d97706" />; // Amber 600
      default: return <User size={14} color="#2563eb" />; // Blue 600
    }
  };

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
      <div style={{ display: "inline-block", padding: "16px", borderRadius: "16px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Users size={24} color="#2563eb" className="animate-pulse mb-2 mx-auto" />
        Loading Directory...
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>User Directory</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Manage roles and monitor student progress.</p>
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
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
              <th style={{ padding: "16px 24px", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>User</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tier</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Joined</th>
              <th style={{ padding: "16px 24px", width: "50px" }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr 
                key={u.id} 
                style={{ 
                  borderBottom: idx === users.length - 1 ? "none" : "1px solid #f1f5f9", 
                  transition: "background 200ms ease" 
                }} 
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ color: "#0f172a", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>{u.first_name} {u.last_name}</div>
                  <div style={{ color: "#64748b", fontSize: "12px", fontFamily: "'Fira Code', monospace" }}>{u.email}</div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", textTransform: "capitalize" }}>
                    {getRoleIcon(u.role)}
                    {u.role || 'learner'}
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ 
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: u.membership_status === 'premium' ? "#fef3c7" : "#f1f5f9",
                    color: u.membership_status === 'premium' ? "#d97706" : "#64748b",
                    border: u.membership_status === 'premium' ? "1px solid #fde68a" : "1px solid #e2e8f0",
                    textTransform: "capitalize"
                  }}>
                    {u.membership_status || 'free'}
                  </span>
                </td>
                <td style={{ padding: "16px 24px", fontSize: "14px", color: "#64748b" }}>
                  {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button style={{ padding: "8px", background: "transparent", color: "#94a3b8", cursor: "pointer", border: "none", borderRadius: "8px", transition: "all 200ms ease" }}
                    onMouseOver={(e) => { e.currentTarget.style.color = "#0f172a"; e.currentTarget.style.background = "#f1f5f9"; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
