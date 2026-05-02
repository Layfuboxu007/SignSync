import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUserStore } from "./store/userStore";

import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import FocusLayout from "./layouts/FocusLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";
import UpdatePassword from "./features/auth/UpdatePassword";
import About from "./pages/About";
import CourseCatalogPage from "./pages/courses/CourseCatalogPage";

import Dashboard from "./features/dashboard/Dashboard";
import Profile from "./pages/Profile";
import StartPage from "./pages/StartPage";
import InstructorDashboard from "./features/dashboard/InstructorDashboard";
import PracticeRoomPage from "./pages/practice/PracticeRoomPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/AdminProfile";

function App() {
  const { initializeSession } = useUserStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public: top navbar + footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Route>

        {/* ==========================================
            ROLE-SCOPED ROUTE GROUPS (Strict RBAC)
            ========================================== */}

        {/* Student-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["learner", "student"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/start" element={<StartPage />} />
          </Route>
          <Route element={<FocusLayout />}>
            <Route path="/practice" element={<PracticeRoomPage />} />
          </Route>
        </Route>

        {/* Instructor-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route element={<AppLayout isInstructor />}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/logs" element={<Reports />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Shared routes (all authenticated roles can access) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;