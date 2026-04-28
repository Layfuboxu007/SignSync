import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function PublicLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </div>

      <footer className="site-footer container">
        <Link to="/" className="navbar-logo" style={{ display: "inline-block", marginBottom: "var(--space-4)" }}>
          Sign<span>Sync</span>
        </Link>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
          © {new Date().getFullYear()} SignSync AI. All rights reserved. <br/>
          Empowering communication through technology.
        </p>
      </footer>
    </div>
  );
}
