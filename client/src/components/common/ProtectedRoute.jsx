import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

// Map each role to its "home" page for redirects
const ROLE_HOME = {
  admin: "/admin",
  instructor: "/instructor/dashboard",
  learner: "/dashboard",
  student: "/dashboard",
};

export default function ProtectedRoute({ allowedRoles }) {
  const { session, profile, loading } = useUserStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center container" style={{ height: "100vh" }}>
        Loading Platform...
      </div>
    );
  }

  // Not authenticated → login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Role enforcement: if allowedRoles is specified, check the user's role
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to the user's role-appropriate home page
      const home = ROLE_HOME[profile.role] || "/dashboard";
      return <Navigate to={home} replace />;
    }
  }

  return <Outlet />;
}
