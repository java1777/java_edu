import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LayersIcon from "@mui/icons-material/Layers";
import GroupsIcon from "@mui/icons-material/Groups";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonIcon from "@mui/icons-material/Person";
import { useLanguage } from "../contexts/LanguageContext";

const GROUP_CHILDREN = [
  { icon: <GroupsIcon sx={{ fontSize: 18 }} />, labelKey: "nav.groups", path: "/teacher" },
  {
    icon: <HourglassEmptyIcon sx={{ fontSize: 18 }} />,
    labelKey: "tp.collecting",
    path: "/teacher/collecting",
  },
];

export default function TeacherSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [groupsOpen, setGroupsOpen] = useState(true);

  function isActive(path) {
    if (path === "/teacher") {
      return (
        location.pathname === "/teacher" ||
        location.pathname.startsWith("/teacher/groups")
      );
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  const anyChildActive = GROUP_CHILDREN.some((c) => isActive(c.path));

  function go(path) {
    setMobileOpen(false);
    navigate(path);
  }

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        fixed inset-y-0 left-0 z-30 md:relative md:z-auto
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      style={{ width: collapsed ? 64 : 230 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[14px] border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 shadow">
          <span className="text-white text-sm font-extrabold">E</span>
        </div>
        {!collapsed && (
          <span className="font-extrabold text-violet-700 text-[15px] tracking-wide">
            NajotEdu
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
        {/* Guruhlar (ochiluvchi) */}
        <button
          onClick={() => {
            if (collapsed) {
              go("/teacher");
            } else {
              setGroupsOpen((p) => !p);
            }
          }}
          title={collapsed ? t("nav.groups") : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left
            transition-all duration-150 cursor-pointer
            ${
              anyChildActive
                ? "text-violet-700"
                : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
        >
          <span className="shrink-0">
            <LayersIcon fontSize="small" />
          </span>
          {!collapsed && (
            <>
              <span className="text-[13px] font-bold flex-1">{t("nav.groups")}</span>
              <ExpandMoreIcon
                sx={{
                  fontSize: 18,
                  transform: groupsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </>
          )}
        </button>

        {/* Sub-items */}
        {!collapsed && groupsOpen && (
          <div className="flex flex-col gap-0.5 pl-3">
            {GROUP_CHILDREN.map((c) => (
              <button
                key={c.path}
                onClick={() => go(c.path)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left
                  transition-all duration-150 cursor-pointer
                  ${
                    isActive(c.path)
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
                  }`}
              >
                <span className="shrink-0">{c.icon}</span>
                <span className="text-[13px] font-semibold">{t(c.labelKey)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Profil */}
        <button
          onClick={() => go("/teacher/profile")}
          title={collapsed ? t("tp.profile") : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left
            transition-all duration-150 cursor-pointer mt-1
            ${
              isActive("/teacher/profile")
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
        >
          <span className="shrink-0">
            <PersonIcon fontSize="small" />
          </span>
          {!collapsed && (
            <span className="text-[13px] font-semibold">{t("tp.profile")}</span>
          )}
        </button>
      </nav>
    </aside>
  );
}
