import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";

export default function MainLayout({ children }) {
  const { session } = useUserStore();

  return (
    <div className="landing-page">
      <nav className="container nav-container">
        <div className="logo">Sign<span>Sync</span></div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link to="/" style={{ color: "var(--text-h)" }}>Home</Link>
          <Link to="/courses" style={{ color: "var(--text)" }}>Courses</Link>
          <Link to="/about" style={{ color: "var(--text)" }}>About</Link>
          {session ? (
            <Link to="/dashboard" style={{ marginLeft: "20px" }}>
              <button className="primary" style={{ width: "auto" }}>Go to Dashboard</button>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: "var(--text)", marginLeft: "20px" }}>Log In</Link>
              <Link to="/register">
                <button className="secondary" style={{ width: "auto" }}>Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {children}

      <footer className="container" style={{ textAlign: "center", padding: "60px 0", borderTop: "1px solid var(--border)", marginTop: "80px" }}>
        <div className="logo" style={{ marginBottom: "16px" }}>Sign<span>Sync</span></div>
        <p style={{ opacity: 0.6, fontSize: "14px" }}>
          © 2024 SignSync AI. All rights reserved. <br/>
          Empowering communication through technology.
        </p>
      </footer>
    </div>
  );
}
