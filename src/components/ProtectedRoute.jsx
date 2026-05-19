import { Navigate } from "react-router-dom";
import { isTokenValid } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
