import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

export default function ProtectedRoute({ allowedRoles }) {
  const { session, profile, loading } = useUserStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center container" style={{ height: "100vh" }}>
        Loading Platform...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile) {
    // If the component requires instructor, but user is not instructor
    if (allowedRoles.includes('instructor') && profile.role !== 'instructor') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
