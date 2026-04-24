import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { LogIn, UserPlus } from "lucide-react";

export default function MainLayout({ children }) {
  const { session } = useUserStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <nav className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", paddingBottom: "40px" }}>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-text-primary)" }}>
          Sign<span style={{ color: "var(--color-brand)" }}>Sync</span>
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link to="/" style={{ color: "var(--color-text-primary)", fontWeight: "600", transition: "color 0.2s" }}>Home</Link>
          <Link to="/courses" style={{ color: "var(--color-text-secondary)", fontWeight: "500", transition: "color 0.2s" }}>Courses</Link>
          <Link to="/about" style={{ color: "var(--color-text-secondary)", fontWeight: "500", transition: "color 0.2s" }}>About</Link>
          {session ? (
            <Link to="/dashboard" style={{ marginLeft: "20px" }}>
              <button>Go to Dashboard</button>
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "16px", marginLeft: "20px" }}>
              <Link to="/login">
                <button className="secondary"><LogIn size={16}/> Log In</button>
              </Link>
              <Link to="/register">
                <button><UserPlus size={16}/> Sign Up</button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main inject container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>

      <footer className="container" style={{ textAlign: "center", padding: "60px 0", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
        <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-text-primary)", marginBottom: "16px" }}>
          Sign<span style={{ color: "var(--color-brand)" }}>Sync</span>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
          © 2024 SignSync AI. All rights reserved. <br/>
          Empowering communication through technology.
        </p>
      </footer>
    </div>
  );
}
