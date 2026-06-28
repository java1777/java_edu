import { useLocation } from "react-router-dom";

// Sahifa qaysi panel ostida ochilganini aniqlaydi.
// O'qituvchi paneli (/teacher/...) bo'lsa "/teacher", aks holda admin ("/dashboard").
// Shu tarzda guruh sahifalari (GroupDetail va ichki sahifalar) ikkala panelda ham
// to'g'ri navigatsiya qiladi.
export function usePanelBase() {
  const { pathname } = useLocation();
  return pathname.startsWith("/teacher") ? "/teacher" : "/dashboard";
}
