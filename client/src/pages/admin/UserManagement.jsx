import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { Users, Shield, GraduationCap, User, Download, Crown, XCircle, CheckCircle2 } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // userId being toggled

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
    const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Membership Status", "Expires At", "Joined Date"];
    
    // Create CSV rows
    const rows = users.map(u => [
      u.id,
      u.first_name || "",
      u.last_name || "",
      u.email || "",
      u.role || "learner",
      u.membership_status || "free",
      u.membership_expires_at ? new Date(u.membership_expires_at).toISOString().split('T')[0] : "N/A",
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

  const handleToggleMembership = async (user) => {
    const newStatus = user.membership_status === 'member' ? 'free' : 'member';
    const action = newStatus === 'member' ? 'grant membership to' : 'revoke membership from';
    
    if (!window.confirm(`Are you sure you want to ${action} ${user.first_name} ${user.last_name} (${user.email})?`)) return;

    setActionLoading(user.id);
    try {
      const res = await API.patch(`/admin/users/${user.id}/membership`, { status: newStatus });
      if (res.data.success) {
        // Update the local state
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...res.data.user } : u));
      }
    } catch (err) {
      console.error("Failed to toggle membership", err);
      alert("Failed to update membership. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={14} color="#ef4444" />; // Red 500
      case 'instructor': return <GraduationCap size={14} color="#d97706" />; // Amber 600
      default: return <User size={14} color="#2563eb" />; // Blue 600
    }
  };

  const getMembershipBadge = (status) => {
    const isMember = status === 'member';
    return {
      backgroundColor: isMember ? "#ecfdf5" : "#f1f5f9",
      color: isMember ? "#059669" : "#64748b",
      border: isMember ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
      label: isMember ? "Member" : "Free"
    };
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
          <p style={{ color: "#64748b", fontSize: "14px" }}>Manage roles, memberships, and monitor student progress.</p>
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
              <th style={{ padding: "16px 24px", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const badge = getMembershipBadge(u.membership_status);
              const isToggling = actionLoading === u.id;
              const isAdminOrInstructor = u.role === 'admin' || u.role === 'instructor';
              
              return (
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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: badge.backgroundColor,
                      color: badge.color,
                      border: badge.border,
                      textTransform: "capitalize"
                    }}>
                      {u.membership_status === 'member' && <Crown size={10} />}
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: "#64748b" }}>
                    {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    {isAdminOrInstructor ? (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>—</span>
                    ) : u.membership_status === 'member' ? (
                      <button 
                        onClick={() => handleToggleMembership(u)}
                        disabled={isToggling}
                        style={{ 
                          padding: "6px 12px", background: "hsla(0, 84%, 60%, 0.06)", 
                          color: "#ef4444", cursor: isToggling ? "not-allowed" : "pointer", 
                          border: "1px solid hsla(0, 84%, 60%, 0.2)", borderRadius: "8px", 
                          fontSize: "12px", fontWeight: "600", transition: "all 200ms ease",
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          opacity: isToggling ? 0.6 : 1
                        }}
                        onMouseOver={(e) => { if (!isToggling) { e.currentTarget.style.background = "hsla(0, 84%, 60%, 0.12)"; } }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "hsla(0, 84%, 60%, 0.06)"; }}
                      >
                        <XCircle size={12} />
                        {isToggling ? "Revoking..." : "Revoke"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleToggleMembership(u)}
                        disabled={isToggling}
                        style={{ 
                          padding: "6px 12px", background: "hsla(160, 84%, 39%, 0.06)", 
                          color: "#059669", cursor: isToggling ? "not-allowed" : "pointer", 
                          border: "1px solid hsla(160, 84%, 39%, 0.2)", borderRadius: "8px", 
                          fontSize: "12px", fontWeight: "600", transition: "all 200ms ease",
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          opacity: isToggling ? 0.6 : 1
                        }}
                        onMouseOver={(e) => { if (!isToggling) { e.currentTarget.style.background = "hsla(160, 84%, 39%, 0.12)"; } }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "hsla(160, 84%, 39%, 0.06)"; }}
                      >
                        <CheckCircle2 size={12} />
                        {isToggling ? "Granting..." : "Grant"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
