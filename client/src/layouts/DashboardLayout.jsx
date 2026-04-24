import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useEffect } from "react";
import { LayoutDashboard, GraduationCap, Users, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children, isInstructor }) {
  const { session, profile, logout, loading } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/");
    }
    if (!loading && profile) {
      if (isInstructor && profile.role !== "instructor") {
         navigate("/dashboard");
      }
    }
  }, [session, profile, loading, navigate, isInstructor]);

  if (loading) return (
    <div className="flex items-center justify-between container" style={{height: "100vh"}}>
      Loading Platform...
    </div>
  )
  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-canvas)" }}>
      <div className="container grid" style={{ padding: "40px 0" }}>
        {/* Sidebar Container */}
        <aside className="card-outer" style={{ height: "fit-content", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-text-primary)", marginBottom: "48px" }}>
            Sign<span style={{ color: "var(--color-brand)" }}>Sync</span>
            {isInstructor && <span className="badge" style={{ marginLeft: "8px" }}>Instructor</span>}
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link to={isInstructor ? "/instructor/dashboard" : "/dashboard"} 
              style={{ 
                display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", 
                background: "var(--color-brand-light)", color: "var(--color-brand-dark)", 
                borderRadius: "var(--radius-sm)", fontWeight: "600" 
              }}>
              <LayoutDashboard size={18} /> {isInstructor ? "HQ Overview" : "Dashboard"}
            </Link>
            {!isInstructor && (
               <Link to="/courses" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-text-secondary)", fontWeight: "500", transition: "color 0.2s" }}>
                 <GraduationCap size={18} /> Courses
               </Link>
            )}
            {isInstructor && (
              <Link to="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-text-secondary)", fontWeight: "500" }}>
                <Users size={18} /> Student Roster
              </Link>
            )}
            <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-text-secondary)", fontWeight: "500" }}>
              <Settings size={18} /> Settings
            </Link>
          </nav>

          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--color-border)" }}>
            {!isInstructor && (
              <div className="card-inner" style={{ textAlign: "center", marginBottom: "20px" }}>
                <p style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--color-brand)", marginBottom: "8px" }}>PRO PLAN</p>
                <p style={{ fontSize: "var(--text-xs)", marginBottom: "16px", color: "var(--color-text-primary)" }}>Unlock all medical and professional modules.</p>
                <button style={{ fontSize: "var(--text-xs)", padding: "8px 16px", width: "100%" }}>Upgrade</button>
              </div>
            )}
            <button className="secondary" onClick={() => { logout(); navigate("/"); }} style={{ width: "100%" }}>
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </aside>

        {/* Main Application Area */}
        <main style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
