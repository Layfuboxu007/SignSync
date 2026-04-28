import { Menu } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

export default function AppHeader({ onMenuToggle }) {
  return (
    <header className="app-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button
          className="app-header-hamburger"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar menu"
        >
          <Menu size={24} />
        </button>

        <div className="navbar-logo" style={{ fontSize: "20px", display: "none" }}>
          Sign<span>Sync</span>
        </div>
      </div>

      <ProfileMenu />
    </header>
  );
}
