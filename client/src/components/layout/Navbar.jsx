import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { LogIn, UserPlus, Menu, X } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { session } = useUserStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="public-navbar">
        <Link to="/" className="navbar-logo">
          Sign<span>Sync</span>
        </Link>

        <div className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'navbar-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <Link to="/dashboard" style={{ color: "var(--color-text-primary)", fontWeight: "500", fontSize: "var(--text-sm)" }}>
                Dashboard
              </Link>
              <ProfileMenu />
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="secondary"><LogIn size={16}/> Log In</button>
              </Link>
              <Link to="/register">
                <button><UserPlus size={16}/> Sign Up</button>
              </Link>
            </>
          )}
        </div>

        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={24} />
        </button>
      </nav>

      {mobileOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-nav-panel">
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
              <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
                Sign<span>Sync</span>
              </Link>
              <button
                className="navbar-hamburger"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={24} />
              </button>
            </div>

            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${location.pathname === link.to ? 'mobile-nav-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {session ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <button style={{ width: "100%" }}>Go to Dashboard</button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <button className="secondary" style={{ width: "100%" }}><LogIn size={16}/> Log In</button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <button style={{ width: "100%" }}><UserPlus size={16}/> Sign Up</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
