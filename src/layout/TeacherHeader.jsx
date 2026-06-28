import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { useLanguage } from "../contexts/LanguageContext";
import { removeToken } from "../hooks/useAuth";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";

const LANGS = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const MONTHS_UZ = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];
const DAYS_UZ = ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

export default function TeacherHeader({ setMobileOpen }) {
  const navigate = useNavigate();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { lang, setLang, t } = useLanguage();
  const langRef = useRef(null);
  const userRef = useRef(null);

  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const liveDate = `${now.getDate()} ${MONTHS_UZ[now.getMonth()]}, ${now.getFullYear()}`;
  const liveTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const liveDay = DAYS_UZ[now.getDay()];

  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const userName = localStorage.getItem("user_name") || t("tp.role");

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 py-3 gap-2 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <MenuIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>

        {/* Live clock */}
        <div className="hidden sm:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 cursor-default select-none">
          <CalendarTodayIcon sx={{ fontSize: 14, color: "#7C3AED" }} />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold text-gray-500">
              {liveDate} — {liveDay}
            </span>
            <span className="text-[13px] font-bold text-violet-600 tabular-nums">
              {liveTime}
            </span>
          </div>
        </div>

        {/* Search (visual) */}
        <div className="hidden md:block relative">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 w-44 lg:w-64 hover:border-violet-300 transition-colors">
            <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${t("common.search")}...`}
              className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div ref={langRef} className="hidden lg:block relative">
          <button
            onClick={() => setLangOpen((p) => !p)}
            className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors select-none"
          >
            <LanguageIcon sx={{ fontSize: 15, color: "#6B7280" }} />
            <span>
              {currentLang.flag} {currentLang.label}
            </span>
            <ExpandMoreIcon
              sx={{
                fontSize: 15,
                color: "#9CA3AF",
                transform: langOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 overflow-hidden">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors cursor-pointer
                    ${lang === l.code ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                  {lang === l.code && (
                    <span className="ml-auto text-violet-500 text-[11px]">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications (visual) */}
        <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer">
          <NotificationsNoneIcon sx={{ fontSize: 18, color: "#6B7280" }} />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="hidden sm:flex w-9 h-9 rounded-full border border-gray-200 items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer"
        >
          {dark ? (
            <LightModeIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          )}
        </button>

        {/* Avatar + dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen((p) => !p)}
            className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all shadow"
          >
            <span className="text-white text-xs font-bold uppercase">
              {userName[0]}
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-[13px] font-semibold text-gray-800 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-gray-400">{t("tp.role")}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
                {t("nav.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
