import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ActivitySquare, LogOut, UserCircle, FileText } from "lucide-react";
import { useUserStore } from "../store/userStore";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useUserStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/admin", icon: LayoutDashboard, label: "Overview" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/logs", icon: FileText, label: "Reports" },
  ];

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#faf9f6", // Alabaster background
      color: "#0f172a", // Slate 900
      fontFamily: "'Fira Sans', sans-serif" 
    }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: "260px",
        backgroundColor: "#ffffff", // Pure white
        borderRight: "1px solid #e2e8f0", // Slate 200
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>
        {/* Header with user identity */}
        <div style={{ padding: "32px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px", color: "#0f172a" }}>SignSync Admin</h1>
          <p style={{ fontSize: "12px", color: "#2563eb", fontFamily: "'Fira Code', monospace", marginTop: "4px" }}>v2.0.0-beta</p>
          {profile && (
            <div style={{ 
              marginTop: "24px", padding: "16px", 
              background: "#f8fafc", 
              border: "1px solid #e2e8f0",
              borderRadius: "12px" 
            }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                {profile.first_name} {profile.last_name}
              </div>
              <div style={{ 
                fontSize: "12px", color: "#64748b", marginTop: "4px", 
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" 
              }}>
                {profile.email}
              </div>
              <div style={{
                display: "inline-block", marginTop: "12px",
                fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em",
                padding: "4px 8px", borderRadius: "6px",
                background: "#eff6ff", color: "#2563eb", 
                border: "1px solid #bfdbfe",
                textTransform: "uppercase", fontFamily: "'Fira Code', monospace"
              }}>
                {profile.role}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: "24px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", paddingLeft: "12px" }}>
            Menu
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", borderRadius: "10px",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? "#2563eb" : "#64748b",
                  fontWeight: isActive ? "600" : "500",
                  transition: "all 200ms ease",
                  border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                  boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.02)" : "none"
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#0f172a";
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <link.icon size={18} color={isActive ? "#2563eb" : "currentColor"} />
                <span style={{ fontSize: "14px" }}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: Profile + Logout */}
        <div style={{ padding: "24px 16px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link
            to="/admin/profile"
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px", borderRadius: "10px",
              color: "#64748b", fontSize: "14px", fontWeight: "500",
              transition: "all 200ms ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#0f172a";
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <UserCircle size={18} /> My Profile
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px", borderRadius: "10px",
              color: "#ef4444", background: "#fef2f2",
              border: "1px solid #fecaca",
              fontSize: "14px", fontWeight: "500", cursor: "pointer",
              width: "100%", transition: "all 200ms ease",
              fontFamily: "'Fira Sans', sans-serif"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#fee2e2";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fef2f2";
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto", position: "relative" }}>
        <div style={{ padding: "40px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
