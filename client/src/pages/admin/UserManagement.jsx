import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { Users, MoreVertical, Shield, GraduationCap, User } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/api/admin/users?limit=50");
        setUsers(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={14} className="text-danger" />;
      case 'instructor': return <GraduationCap size={14} className="text-warning" />;
      default: return <User size={14} className="text-muted" />;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading Directory...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: "var(--space-6) var(--space-8)", maxWidth: "1400px", margin: "0 auto" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-8)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", color: "var(--color-brand-dark)", marginBottom: "var(--space-1)", fontFamily: "Fira Code, monospace" }}>User Directory</h1>
          <p className="text-muted text-sm">Manage roles and monitor student progress.</p>
        </div>
        <button className="primary flex items-center gap-2"><Users size={18} /> Export CSV</button>
      </div>

      <div className="card-outer p-0 overflow-hidden">
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
              <th style={{ padding: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>User</th>
              <th style={{ padding: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Role</th>
              <th style={{ padding: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Tier</th>
              <th style={{ padding: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Joined</th>
              <th style={{ padding: "var(--space-4)", width: "50px" }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s" }} className="hover:bg-slate-50">
                <td style={{ padding: "var(--space-4)" }}>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>{u.first_name} {u.last_name}</div>
                  <div className="text-xs text-muted" style={{ fontFamily: "Fira Code, monospace" }}>{u.email}</div>
                </td>
                <td style={{ padding: "var(--space-4)" }}>
                  <div className="flex items-center gap-2 text-sm capitalize">
                    {getRoleIcon(u.role)}
                    {u.role || 'learner'}
                  </div>
                </td>
                <td style={{ padding: "var(--space-4)" }}>
                  <span className="badge" style={{ 
                    backgroundColor: u.membership_status === 'premium' ? "hsla(45, 93%, 47%, 0.1)" : "var(--color-overlay)",
                    color: u.membership_status === 'premium' ? "var(--color-warning)" : "var(--color-text-muted)"
                  }}>
                    {u.membership_status || 'free'}
                  </span>
                </td>
                <td style={{ padding: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "var(--space-4)", textAlign: "center" }}>
                  <button style={{ padding: "var(--space-2)", background: "transparent", color: "var(--color-text-muted)" }}>
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
