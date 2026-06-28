import { useNavigate, useLocation } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { STUDENT_NAV } from "../constants/studentNav.jsx";
import { useLanguage } from "../contexts/LanguageContext";

export default function StudentSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  function isActive(path) {
    if (path === "/student") return location.pathname === "/student";
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  }

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        fixed inset-y-0 left-0 z-30 md:relative md:z-auto
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      style={{ width: collapsed ? 64 : 210 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[14px] border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 shadow">
          <span className="text-white text-sm font-extrabold">E</span>
        </div>
        {!collapsed && (
          <span className="font-extrabold text-violet-700 text-[15px] tracking-wide">
            EduJava
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4.5 z-10 w-6 h-6 bg-white border border-gray-200
                   rounded-full flex items-center justify-center shadow-sm
                   hover:bg-violet-50 transition-colors cursor-pointer"
      >
        {collapsed ? (
          <ChevronRightIcon sx={{ fontSize: 13, color: "#7C3AED" }} />
        ) : (
          <ChevronLeftIcon sx={{ fontSize: 13, color: "#7C3AED" }} />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {STUDENT_NAV.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              setMobileOpen(false);
              navigate(item.path);
            }}
            title={collapsed ? t(item.labelKey) : undefined}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left
              transition-all duration-150 cursor-pointer
              ${
                isActive(item.path)
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
              }
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-[13px] font-semibold">{t(item.labelKey)}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
