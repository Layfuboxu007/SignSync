import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export default function ProfileMenu() {
  const { profile, logout } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!profile) return null;

  // Use initials for avatar
  const initials = (profile.first_name?.[0] || profile.username?.[0] || "?").toUpperCase();

  return (
    <div className="profile-menu-container" ref={menuRef} style={{ position: "relative" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: "transparent", border: "none", padding: "4px 8px", 
          display: "flex", alignItems: "center", gap: "8px",
          color: "inherit", cursor: "pointer", borderRadius: "var(--radius-md)"
        }}
        className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "bold", fontSize: "14px"
        }}>
          {initials}
        </div>
        <ChevronDown size={16} opacity={0.6} />
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: "220px", background: "var(--color-canvas)",
          border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 50,
          overflow: "hidden", animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-overlay)" }}>
            <div style={{ fontWeight: "600", fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>
              {profile.first_name} {profile.last_name}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "Fira Code, monospace", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.email}
            </div>
            <div className="badge mt-2 capitalize" style={{ fontSize: "10px", padding: "2px 6px" }}>
              {profile.role || 'learner'}
            </div>
          </div>
          
          <div style={{ padding: "8px" }}>
            <Link 
              to="/profile" 
              onClick={() => setIsOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", transition: "all 0.2s" }}
              className="hover:bg-slate-100 hover:text-brand"
            >
              <User size={16} /> View Profile
            </Link>
            <Link 
              to="/profile?tab=settings" 
              onClick={() => setIsOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", transition: "all 0.2s" }}
              className="hover:bg-slate-100 hover:text-brand"
            >
              <Settings size={16} /> Settings
            </Link>
            
            <div style={{ height: "1px", background: "var(--color-border)", margin: "8px 0" }}></div>
            
            <button 
              onClick={handleLogout}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "var(--radius-md)", color: "var(--color-danger)", background: "transparent", border: "none", fontSize: "var(--text-sm)", cursor: "pointer", transition: "all 0.2s" }}
              className="hover:bg-red-50"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
