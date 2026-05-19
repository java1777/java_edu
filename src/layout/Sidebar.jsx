import { useNavigate, useLocation } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import { NAV_ITEMS } from "../constants/nav.jsx";

export default function Sidebar({ collapsed, setCollapsed, menuOpen, setMenuOpen, mobileOpen, setMobileOpen, boshqarishRef }) {
  const navigate = useNavigate();
  const location = useLocation();

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
        className="absolute -right-3 top-[18px] z-10 w-6 h-6 bg-white border border-gray-200
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
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            ref={item.path === "/settings" ? boshqarishRef : null}
            onClick={() => {
              setMobileOpen(false);
              if (item.path === "/settings") {
                setMenuOpen(true);
                navigate("/dashboard");
              } else {
                setMenuOpen(false);
                navigate(item.path);
              }
            }}
            title={collapsed ? item.label : undefined}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left
              transition-all duration-150 cursor-pointer
              ${
                item.path === "/settings"
                  ? menuOpen
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
                  : location.pathname === item.path
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
              }
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-[13px] font-semibold">{item.label}</span>
            )}
          </button>
        ))}

        {/* Logout */}
        <button
          title={collapsed ? "Chiqish" : undefined}
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left
                     text-red-400 hover:bg-red-50 hover:text-red-600
                     transition-all duration-150 cursor-pointer mt-1"
        >
          <LogoutIcon fontSize="small" className="shrink-0" />
          {!collapsed && (
            <span className="text-[13px] font-semibold">Chiqish</span>
          )}
        </button>
      </nav>

      {/* Subscription box */}
      {!collapsed && (
        <div className="m-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <LocalMallIcon sx={{ fontSize: 20, color: "#F97316" }} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-800 leading-tight">
                Obuna
              </p>
              <p className="text-[11px] text-orange-500 font-medium">
                Obunangiz tugagan
              </p>
            </div>
          </div>
          <button
            className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700
                       text-white text-xs font-bold py-2 rounded-xl
                       transition-colors cursor-pointer shadow-sm"
          >
            Obuna'ni yangilash
          </button>
        </div>
      )}
    </aside>
  );
}
