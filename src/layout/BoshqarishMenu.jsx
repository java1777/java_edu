import { useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { BOSHQARISH_MENU } from "../constants/nav.jsx";
import { useLanguage } from "../contexts/LanguageContext";

export default function BoshqarishMenu({
  menuOpen,
  setMenuOpen,
  collapsed,
  menuRef,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <div
      ref={menuRef}
      className="absolute top-0 h-full w-56 bg-white border border-gray-200 shadow-2xl z-50 flex flex-col
                 transition-all duration-700 ease-in-out rounded-2xl"
      style={{
        left: collapsed ? 64 : 210,
        opacity: menuOpen ? 1 : 0,
        transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
        pointerEvents: menuOpen ? "auto" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <span className="font-bold text-gray-700 text-[15px]">
          {t("nav.settings")}
        </span>
        <button
          onClick={() => setMenuOpen(false)}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <CloseIcon sx={{ fontSize: 16, color: "#6B7280" }} />
        </button>
      </div>

      {/* Items */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {BOSHQARISH_MENU.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              navigate(item.path);
              setMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left
                       transition-all duration-150 cursor-pointer
                       ${
                         location.pathname === item.path
                           ? "bg-violet-100 text-violet-700"
                           : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                       }`}
          >
            <span
              className={
                location.pathname === item.path
                  ? "text-violet-600"
                  : "text-gray-400"
              }
            >
              {item.icon}
            </span>
            <span className="text-[13px] font-semibold">
              {t(item.labelKey)}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
