import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ActivitySquare, Settings } from "lucide-react";
import { useUserStore } from "../store/userStore";

export default function AdminLayout() {
  const location = useLocation();
  const { profile } = useUserStore();

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="card-outer text-center max-w-md">
          <h2 style={{ fontSize: "var(--text-xl)", color: "var(--color-danger)", marginBottom: "var(--space-2)" }}>Access Denied</h2>
          <p className="text-muted text-sm mb-6">You do not have permission to view the admin panel.</p>
          <Link to="/dashboard"><button style={{ width: "100%" }}>Return to App</button></Link>
        </div>
      </div>
    );
  }

  const navLinks = [
    { path: "/admin", icon: LayoutDashboard, label: "Overview" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/logs", icon: ActivitySquare, label: "Activity Logs" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--color-canvas)" }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: "260px",
        background: "linear-gradient(180deg, #1E3A8A 0%, #1E40AF 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>
        <div style={{ padding: "var(--space-6)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <h1 style={{ fontSize: "var(--text-lg)", fontWeight: "800", letterSpacing: "0.5px" }}>SignSync Admin</h1>
          <p style={{ fontSize: "var(--text-xs)", opacity: 0.7, fontFamily: "Fira Code, monospace" }}>v2.0.0-beta</p>
        </div>
        
        <nav style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-3)", borderRadius: "var(--radius-md)",
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                  fontWeight: isActive ? "600" : "500",
                  transition: "all 0.2s"
                }}
              >
                <link.icon size={18} />
                <span style={{ fontSize: "var(--text-sm)" }}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "var(--space-6)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "rgba(255,255,255,0.7)", fontSize: "var(--text-sm)" }}>
            ← Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
