import { useDarkMode } from "../hooks/useDarkMode";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header({ setMobileOpen }) {
  const { dark, toggle: toggleDark } = useDarkMode();

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
            placeholder="Qidirish..."
            className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language — desktop+ */}
        <div className="hidden lg:flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors select-none">
          <span>O'zbekcha</span>
          <ExpandMoreIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
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
