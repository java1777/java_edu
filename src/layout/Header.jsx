import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { groupsApi } from "../api/groups";
import { teachersApi } from "../api/teachers";
import { studentsApi } from "../api/students";

const LANGS = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

function normalize(res, keys = []) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "teachers", "students", "groups", ...keys])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}

export default function Header({ setMobileOpen }) {
  const { dark, toggle: toggleDark } = useDarkMode();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const langRef = useRef(null);
  const searchRef = useRef(null);

  const [langOpen, setLangOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    groups: [],
    teachers: [],
    students: [],
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const MONTHS_UZ = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyun",
    "Iyul",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];
  const DAYS_UZ = ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const liveDate = `${now.getDate()} ${MONTHS_UZ[now.getMonth()]}, ${now.getFullYear()}`;
  const liveTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const liveDay = DAYS_UZ[now.getDay()];

  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ groups: [], teachers: [], students: [] });
      setSearchOpen(false);
      return;
    }
    setSearching(true);
    try {
      const [groupsRes, teachersRes, studentsRes] = await Promise.allSettled([
        groupsApi.getAll(),
        teachersApi.getAll(),
        studentsApi.getAll(),
      ]);

      const ql = q.toLowerCase();

      const groups = normalize(groupsRes.value)
        .filter((g) => (g.name ?? "").toLowerCase().includes(ql))
        .slice(0, 4);

      const teachers = normalize(teachersRes.value)
        .filter((tc) =>
          (tc.full_name ?? tc.name ?? "").toLowerCase().includes(ql),
        )
        .slice(0, 4);

      const students = normalize(studentsRes.value)
        .filter((s) => (s.full_name ?? s.name ?? "").toLowerCase().includes(ql))
        .slice(0, 4);

      setResults({ groups, teachers, students });
      setSearchOpen(true);
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  const total =
    results.groups.length + results.teachers.length + results.students.length;

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

        {/* Live clock */}
        <div className="hidden sm:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-default select-none">
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

        {/* Add + dropdown */}
        <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button className="flex items-center justify-center px-2.5 py-2 hover:bg-gray-50 transition-colors cursor-pointer border-r border-gray-200">
            <AddIcon sx={{ fontSize: 18, color: "#374151" }} />
          </button>
          <button className="flex items-center justify-center px-2 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
            <ExpandMoreIcon sx={{ fontSize: 16, color: "#6B7280" }} />
          </button>
        </div>

        {/* Search */}
        <div ref={searchRef} className="hidden md:block relative">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 w-44 lg:w-64 hover:border-violet-300 transition-colors bg-white">
            <SearchIcon
              sx={{ fontSize: 16, color: searching ? "#7C3AED" : "#9CA3AF" }}
            />
            <input
              type="text"
              value={query}
              onChange={handleChange}
              onFocus={() => query.trim() && setSearchOpen(true)}
              placeholder={t("common.search")}
              className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                  setResults({ groups: [], teachers: [], students: [] });
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-[12px] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Results dropdown */}
          {searchOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
              {total === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-gray-400">
                  Natija topilmadi
                </div>
              ) : (
                <div className="py-2">
                  {results.groups.length > 0 && (
                    <>
                      <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Guruhlar
                      </p>
                      {results.groups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => {
                            navigate(`/dashboard/groups/${g.id}`);
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-violet-600 text-[11px] font-bold">
                              {(g.name ?? "G")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-800">
                              {g.name ?? "—"}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {g.course?.name ?? ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {results.teachers.length > 0 && (
                    <>
                      <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        O'qituvchilar
                      </p>
                      {results.teachers.map((tc) => (
                        <button
                          key={tc.id}
                          onClick={() => {
                            navigate("/dashboard/teachers");
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-400 to-blue-400 flex items-center justify-center shrink-0">
                            <span className="text-white text-[11px] font-bold">
                              {(tc.full_name ??
                                tc.name ??
                                "T")[0].toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[13px] font-semibold text-gray-800">
                            {tc.full_name ?? tc.name ?? "—"}
                          </p>
                        </button>
                      ))}
                    </>
                  )}

                  {results.students.length > 0 && (
                    <>
                      <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        O'quvchilar
                      </p>
                      {results.students.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            navigate("/dashboard/students");
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <span className="text-gray-600 text-[11px] font-bold">
                              {(s.full_name ?? s.name ?? "S")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-800">
                              {s.full_name ?? s.name ?? "—"}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {s.phone ?? ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all shadow">
          <span className="text-white text-xs font-bold uppercase">
            {(localStorage.getItem("user_name") ?? "C")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
