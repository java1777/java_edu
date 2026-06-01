import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { BOSHQARISH_MENU } from "../constants/nav.jsx";
import { useLanguage } from "../contexts/LanguageContext";

export default function BoshqarishMenu({
  menuOpen,
  setMenuOpen,
  collapsed,
  mobileOpen,
  menuRef,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const menuLeft = isDesktop
    ? (collapsed ? 64 : 210)
    : (mobileOpen ? (collapsed ? 64 : 210) : 0);

  return (
    <div
      ref={menuRef}
      className="fixed top-0 bottom-0 bg-white z-50 flex flex-col"
      style={{
        left: menuLeft,
        width: 260,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: "6px 0 40px rgba(0,0,0,0.13)",
        opacity: menuOpen ? 1 : 0,
        transform: menuOpen ? "translateX(0)" : "translateX(-30px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: menuOpen ? "auto" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5">
        <button
          onClick={() => setMenuOpen(false)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-violet-600 hover:bg-violet-700 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <ChevronLeftIcon sx={{ fontSize: 24, color: "#fff" }} />
        </button>
        <span className="text-[20px] font-bold text-gray-800">Menu</span>
      </div>

      <div className="mx-4 h-px bg-gray-100 mb-3" />

      {/* Items */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        {BOSHQARISH_MENU.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={i}
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl w-full text-left
                         transition-colors duration-150 cursor-pointer mb-1
                         ${active ? "bg-violet-50" : "hover:bg-violet-50"}`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 shrink-0 ${active ? "text-violet-600" : "text-gray-400 group-hover:text-violet-500"}`}>
                {item.icon}
              </span>
              <span className={`text-[15px] font-semibold leading-none ${active ? "text-violet-700" : "text-gray-700 group-hover:text-violet-700"}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
