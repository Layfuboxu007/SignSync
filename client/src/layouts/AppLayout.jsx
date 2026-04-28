import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import AppHeader from "../components/layout/AppHeader";

export default function AppLayout({ isInstructor }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isInstructor={isInstructor}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <AppHeader onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        <div className="app-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
