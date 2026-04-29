import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore.js";

// Protect routes based on auth and role
export default function ProtectedRoute({ children, roles = [] }) {
  const user        = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const location    = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === "VENDOR") return <Navigate to="/vendor/dashboard" replace />;
    if (user.role === "ADMIN")  return <Navigate to="/admin/dashboard"  replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}