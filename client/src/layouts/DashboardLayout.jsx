import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useEffect } from "react";

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

  if (loading) return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="bg-subtle" style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)" }}>
      <div className="container dashboard-grid">
        <aside className="sidebar">
          <div className="logo" style={{ marginBottom: "48px" }}>Sign<span>Sync</span>
            {isInstructor && <span style={{fontSize: "12px", background: "var(--accent-bg)", color: "var(--accent)", padding: "4px 8px", borderRadius: "8px", verticalAlign: "middle", marginLeft: "8px"}}>Instructor</span>}
          </div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to={isInstructor ? "/instructor/dashboard" : "/dashboard"} style={{ 
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", 
              background: "var(--accent-bg)", color: "var(--accent)", borderRadius: "12px", fontWeight: "700" 
            }}>
              <span style={{ fontSize: "18px" }}>📊</span> {isInstructor ? "HQ Overview" : "Dashboard"}
            </Link>
            {!isInstructor && (
               <Link to="/courses" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
                 <span style={{ fontSize: "18px" }}>🎓</span> Courses
               </Link>
            )}
            {isInstructor && (
              <Link to="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
                <span style={{ fontSize: "18px" }}>👥</span> Student Roster
              </Link>
            )}
            <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
              <span style={{ fontSize: "18px" }}>⚙️</span> Settings
            </Link>
          </nav>

          <div style={{ marginTop: "auto", paddingTop: "40px" }}>
            {!isInstructor && (
              <div className="card" style={{ padding: "20px", background: "var(--accent-bg)", border: "none", textAlign: "center" }}>
                <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)", marginBottom: "8px" }}>PRO PLAN</p>
                <p style={{ fontSize: "13px", marginBottom: "16px" }}>Unlock all medical and professional modules.</p>
                <button style={{ fontSize: "13px", padding: "8px" }}>Upgrade</button>
              </div>
            )}
            <button className="secondary" onClick={() => { logout(); navigate("/"); }} style={{ marginTop: "24px", width: "100%", fontSize: "14px" }}>
              Log Out
            </button>
          </div>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
