import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// No more isLoggedIn prop needed — reads directly from AuthContext
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}
