import { Navigate } from "react-router-dom";
import { isTokenValid, getRole, getHomePathForRole } from "../hooks/useAuth";

export default function ProtectedRoute({ children, allow }) {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  // allow berilgan bo'lsa — role tekshiriladi.
  // Faqat role ANIQ bo'lganda cheklaymiz; aniqlab bo'lmasa (eski token va h.k.)
  // bloklamaymiz — admin lockout/loopni oldini olish uchun.
  if (allow && allow.length > 0) {
    const role = getRole();
    const permitted = allow.map((r) => r.toUpperCase());
    if (role && !permitted.includes(role)) {
      // noto'g'ri panel — foydalanuvchini o'z bosh sahifasiga yo'naltiramiz
      return <Navigate to={getHomePathForRole(role)} replace />;
    }
  }

  return children;
}
