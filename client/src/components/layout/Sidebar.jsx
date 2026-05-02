import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import MembershipModal from "../checkout/MembershipModal";
import { LayoutDashboard, GraduationCap, Users, UserCircle, LogOut, ShieldCheck } from "lucide-react";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses",   label: "Courses",   icon: GraduationCap },
  { to: "/profile",   label: "Profile",   icon: UserCircle },
];

const instructorLinks = [
  { to: "/instructor/dashboard", label: "HQ Overview", icon: LayoutDashboard },
  { to: "/profile",              label: "Profile",     icon: UserCircle },
];

export default function Sidebar({ isInstructor, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const links = isInstructor ? instructorLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <Link to={isInstructor ? "/instructor/dashboard" : "/dashboard"} className="sidebar-logo" onClick={onClose}>
          Sign<span>Sync</span>
          {isInstructor && <span className="badge" style={{ marginLeft: "var(--space-2)", verticalAlign: "middle" }}>Instructor</span>}
        </Link>

        <nav className="sidebar-nav">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${location.pathname === link.to ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <link.icon size={18} /> {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!isInstructor && profile?.membership_status !== 'member' && (
            <div className="card-inner" style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--color-text-secondary)", marginBottom: "var(--space-2)" }}>FREE TIER</p>
              <p style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-4)", color: "var(--color-text-primary)" }}>Become a member to unlock all courses.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{ fontSize: "var(--text-xs)", padding: "var(--space-2) var(--space-4)", width: "100%" }}
              >
                Activate Membership
              </button>
            </div>
          )}
          {!isInstructor && profile?.membership_status === 'member' && (
            <div className="card-inner" style={{ textAlign: "center", marginBottom: "var(--space-5)", background: "hsla(160, 84%, 39%, 0.1)", borderColor: "hsla(160, 84%, 39%, 0.2)" }}>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--color-success)", marginBottom: "var(--space-2)", display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--space-1)" }}>
                <ShieldCheck size={14}/> ACTIVE MEMBER
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-primary)" }}>Full access to the catalog.</p>
            </div>
          )}

          <button className="secondary" onClick={handleLogout} style={{ width: "100%" }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      <MembershipModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
