import { Outlet, Link } from "react-router-dom";

export default function FocusLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-canvas)" }}>
      <header className="focus-header">
        <Link to="/dashboard" className="focus-header-logo">
          Sign<span>Sync</span>
        </Link>
        <Link to="/dashboard">
          <button className="secondary" style={{ padding: "var(--space-2) var(--space-5)" }}>
            Exit Session
          </button>
        </Link>
      </header>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
