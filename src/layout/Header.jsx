import { useState, useRef, useEffect } from "react";
import { useDarkMode } from "../hooks/useDarkMode";
import { useLanguage } from "../contexts/LanguageContext";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageIcon from "@mui/icons-material/Language";

const LANGS = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function Header({ setMobileOpen }) {
  const { dark, toggle: toggleDark } = useDarkMode();
  const { lang, setLang, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <header className="bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3 md:px-6 py-3 gap-2">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <MenuIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>

        {/* Calendar — tablet+ */}
        <button className="hidden sm:flex w-9 h-9 rounded-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
          <CalendarTodayIcon sx={{ fontSize: 16, color: "#6B7280" }} />
        </button>

        {/* Add + dropdown — tablet+ */}
        <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button className="flex items-center justify-center px-2.5 py-2 hover:bg-gray-50 transition-colors cursor-pointer border-r border-gray-200">
            <AddIcon sx={{ fontSize: 18, color: "#374151" }} />
          </button>
          <button className="flex items-center justify-center px-2 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
            <ExpandMoreIcon sx={{ fontSize: 16, color: "#6B7280" }} />
          </button>
        </div>

        {/* Search — desktop+ */}
        <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 w-44 lg:w-52 hover:border-violet-300 transition-colors">
          <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder={t("common.search")}
            className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher — desktop+ */}
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
                    ${
                      lang === l.code
                        ? "bg-violet-50 text-violet-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                  {lang === l.code && (
                    <span className="ml-auto text-violet-500 text-[11px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer">
          <NotificationsNoneIcon sx={{ fontSize: 18, color: "#6B7280" }} />
        </button>

        {/* Dark mode — tablet+ */}
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

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all shadow">
          <span className="text-white text-xs font-bold">C</span>
        </div>
      </div>
    </header>
  );
}
