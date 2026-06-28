import { Outlet, useNavigate } from "react-router-dom";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { useDarkMode } from "../hooks/useDarkMode";
import { removeToken } from "../hooks/useAuth";

// Teacher va Student panellari uchun umumiy oddiy layout
export default function PanelLayout({ title }) {
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const userName = localStorage.getItem("user_name") || "Foydalanuvchi";

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 md:px-6 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 shadow">
            <span className="text-white text-sm font-extrabold">E</span>
          </div>
          <span className="font-bold text-gray-800 text-[15px]">{title}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggle}
            title={dark ? "Yorug' rejim" : "Tungi rejim"}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
          >
            {dark ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
              {userName[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {userName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Chiqish"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LogoutIcon fontSize="small" />
            <span className="hidden sm:block">Chiqish</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
