import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import LayersIcon from "@mui/icons-material/Layers";
import SchoolIcon from "@mui/icons-material/School";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import TuneIcon from "@mui/icons-material/Tune";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BadgeIcon from "@mui/icons-material/Badge";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import IosShareIcon from "@mui/icons-material/IosShare";
import EmailIcon from "@mui/icons-material/Email";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";

const BOSHQARISH_MENU = [
  {
    icon: <AutoStoriesIcon fontSize="small" />,
    label: "Kurslar",
    path: "/dashboard/courses",
  },
  {
    icon: <MeetingRoomIcon fontSize="small" />,
    label: "Xonalar",
    path: "/dashboard/rooms",
  },
  {
    icon: <BadgeIcon fontSize="small" />,
    label: "Hodimlar",
    path: "/dashboard/staff",
  },
  {
    icon: <MonetizationOnIcon fontSize="small" />,
    label: "Coin",
    path: "/dashboard/coins",
  },
  {
    icon: <SendIcon fontSize="small" />,
    label: "Xabar Yuborish",
    path: "/dashboard/messages",
  },
];

const NAV_ITEMS = [
  { icon: <HomeIcon fontSize="small" />, label: "Asosiy", path: "/dashboard" },
  {
    icon: <PeopleIcon fontSize="small" />,
    label: "O'qituvchilar",
    path: "/dashboard/teachers",
  },
  {
    icon: <LayersIcon fontSize="small" />,
    label: "Guruhlar",
    path: "/dashboard/groups",
  },
  {
    icon: <SchoolIcon fontSize="small" />,
    label: "Talabalar",
    path: "/dashboard/students",
  },
  {
    icon: <CardGiftcardIcon fontSize="small" />,
    label: "To'lovlar",
    path: "/dashboard/payments",
  },
  {
    icon: <TuneIcon fontSize="small" />,
    label: "Boshqarish",
    path: "/settings",
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle: toggleDark } = useDarkMode();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const boshqarishRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      const inMenu = menuRef.current?.contains(e.target);
      const inBtn = boshqarishRef.current?.contains(e.target);
      if (!inMenu && !inBtn) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
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

      {/* ── Boshqarish submenu panel ────────────────────────── */}
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
            management
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
              <span className="text-[13px] font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Page content injected here */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── Ichki sahifalar ──────────────────────────────────── */

const TEACHERS_MOCK = [
  {
    id: 1,
    name: "Mohirbek Toshmatov",
    groups: ["N26", "n105", "B2"],
    extra: 4,
    phone: "+998901234567",
    email: "mohirbek@gmail.com",
    address: "Toshkent",
    created: "12.05.2026",
  },
  {
    id: 2,
    name: "Sardor Rahimov",
    groups: ["N12"],
    extra: 0,
    phone: "+998907654321",
    email: "sardor@gmail.com",
    address: "Samarqand",
    created: "05.02.2023",
  },
  {
    id: 3,
    name: "Dilnoza Yusupova",
    groups: ["C3", "A1"],
    extra: 0,
    phone: "+998913334455",
    email: "dilnoza@gmail.com",
    address: "Buxoro",
    created: "18.03.2023",
  },
  {
    id: 4,
    name: "Jasur Mirzayev",
    groups: ["M7"],
    extra: 0,
    phone: "+998935556677",
    email: "jasur@gmail.com",
    address: "Namangan",
    created: "22.04.2023",
  },
  {
    id: 5,
    name: "Kamola Nazarova",
    groups: ["K9"],
    extra: 0,
    phone: "+998941112233",
    email: "kamola@gmail.com",
    address: "Andijon",
    created: "01.05.2023",
  },
  {
    id: 6,
    name: "Otabek Xasanov",
    groups: ["N26", "K9"],
    extra: 0,
    phone: "+998957778899",
    email: "otabek@gmail.com",
    address: "Toshkent",
    created: "15.06.2023",
  },
  {
    id: 7,
    name: "Feruza Abdullayeva",
    groups: ["B2"],
    extra: 0,
    phone: "+998919990011",
    email: "feruza@gmail.com",
    address: "Farg'ona",
    created: "20.07.2023",
  },
  {
    id: 8,
    name: "Sherzod Qodirov",
    groups: ["C3", "A1", "M7"],
    extra: 1,
    phone: "+998902221133",
    email: "sherzod@gmail.com",
    address: "Qarshi",
    created: "08.08.2023",
  },
  {
    id: 9,
    name: "Nilufar Ergasheva",
    groups: ["n105", "N12"],
    extra: 0,
    phone: "+998968884455",
    email: "nilufar@gmail.com",
    address: "Nukus",
    created: "14.09.2023",
  },
  {
    id: 10,
    name: "Bobur Usmonov",
    groups: ["N26", "B2", "K9"],
    extra: 0,
    phone: "+998977776655",
    email: "bobur@gmail.com",
    address: "Jizzax",
    created: "30.10.2023",
  },
];

const EMPTY_FORM = {
  phone: "+998",
  email: "",
  fio: "",
  birthDate: "1990-03-01",
  gender: "",
  address: "",
  photo: null,
  password: "",
  showPassword: false,
};

export function Teachers() {
  const [teachers, setTeachers] = useState(TEACHERS_MOCK);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [groups, setGroups] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalSearch, setGroupModalSearch] = useState("");
  const [tempGroupModal, setTempGroupModal] = useState([]);

  const allChecked = selected.length === teachers.length;
  function toggleAll() {
    setSelected(allChecked ? [] : teachers.map((t) => t.id));
  }
  function toggleOne(id) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openDrawer() {
    setForm(EMPTY_FORM);
    setGroups([]);
    setPhotoPreview(null);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removeGroup(i) {
    setGroups((p) => p.filter((_, idx) => idx !== i));
  }

  function openGroupModal() {
    setTempGroupModal([...groups]);
    setGroupModalSearch("");
    setGroupModalOpen(true);
  }
  function confirmGroupModal() {
    setGroups(tempGroupModal);
    setGroupModalOpen(false);
  }

  function validate() {
    const e = {};
    if (!form.phone.trim() || form.phone === "+998")
      e.phone = "Telefon kiritilishi shart";
    if (!form.fio.trim()) e.fio = "FIO kiritilishi shart";
    if (!form.gender) e.gender = "Jinsni tanlang";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const today = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setTeachers((p) => [
      ...p,
      {
        id: Date.now(),
        name: form.fio,
        groups,
        extra: 0,
        phone: form.phone,
        birth: form.birthDate,
        created: today,
      },
    ]);
    closeDrawer();
  }

  function handleDelete(id) {
    setTeachers((p) => p.filter((t) => t.id !== id));
  }

  const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            O'qituvchilar
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning
            ma'lumotlarini topasiz.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <IosShareIcon sx={{ fontSize: 16 }} /> Export
          </button>
          <button
            onClick={openDrawer}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <span className="text-base leading-none">+</span> O'qituvchi
            qo'shish
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header: filters + search */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <FilterListIcon sx={{ fontSize: 17 }} /> Filters
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-52 hover:border-violet-300 transition-colors">
              <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
              />
            </div>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <ArchiveIcon sx={{ fontSize: 16 }} /> Arxiv
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  <span className="flex items-center gap-1 cursor-pointer select-none">
                    Nomi <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                  </span>
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Guruh
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Telefon raqamlari
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Manzil
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Yaratilgan sana
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 transition-colors ${selected.includes(t.id) ? "bg-violet-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleOne(t.id)}
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 shrink-0" />
                      <span className="text-[13px] font-semibold text-gray-800">
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.groups.map((g, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500"
                        >
                          {g}
                        </span>
                      ))}
                      {t.extra > 0 && (
                        <span className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500">
                          +{t.extra}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.phone}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.email}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.address}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.created}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <VisibilityIcon
                          sx={{ fontSize: 16, color: "#9CA3AF" }}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                      >
                        <DeleteIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 cursor-pointer transition-colors">
                        <EditIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          ← Previous
        </button>
        <div className="flex items-center gap-1">
          {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
            <button
              key={i}
              className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${p === 1 ? "bg-violet-600 text-white" : p === "..." ? "text-gray-400 cursor-default" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          Next →
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.2)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Drawer header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-bold text-gray-800">
              O'qituvchi qo'shish
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Telefon */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Telefon raqam
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => {
                setForm((p) => ({ ...p, phone: e.target.value }));
                setErrors((p) => ({ ...p, phone: "" }));
              }}
              className={inputCls(errors.phone)}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Mail */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Mail
            </label>
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 ${errors.email ? "border-red-400" : "border-gray-200 focus-within:border-violet-400"} transition-colors`}
            >
              <EmailIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              <input
                type="email"
                placeholder="Elektron pochtani kiriting"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
              />
            </div>
          </div>

          {/* FIO */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              O'qituvchi FIO
            </label>
            <input
              type="text"
              placeholder="Ma'lumotni kiriting"
              value={form.fio}
              onChange={(e) => {
                setForm((p) => ({ ...p, fio: e.target.value }));
                setErrors((p) => ({ ...p, fio: "" }));
              }}
              className={inputCls(errors.fio)}
            />
            {errors.fio && (
              <p className="text-[11px] text-red-500 mt-1">{errors.fio}</p>
            )}
          </div>

          {/* Tug'ilgan sanasi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Tug'ilgan sanasi
            </label>
            <div className="flex items-center gap-2 border border-gray-200 focus-within:border-violet-400 rounded-xl px-3 py-2.5 transition-colors">
              <CalendarTodayIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, birthDate: e.target.value }))
                }
                className="text-[13px] text-gray-600 outline-none bg-transparent w-full"
              />
            </div>
          </div>

          {/* Guruh */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Guruh
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 min-h-11">
              {groups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {groups.map((g, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {g}
                      <button
                        onClick={() => removeGroup(i)}
                        className="text-violet-400 hover:text-red-500 cursor-pointer leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={openGroupModal}
                className="flex items-center gap-1 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
              >
                + Qo'shish
              </button>
            </div>
          </div>

          {/* Jinsi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Jinsi
            </label>
            <div className="flex gap-5">
              {["Erkak", "Ayol"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => {
                      setForm((p) => ({ ...p, gender: g }));
                      setErrors((p) => ({ ...p, gender: "" }));
                    }}
                    className="accent-violet-600"
                  />
                  <span className="text-[13px] text-gray-700">{g}</span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="text-[11px] text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Surati */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Surati
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-violet-400 transition-colors">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl"
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 30, color: "#7C3AED" }} />
                  <p className="text-[13px] mt-2">
                    <span className="text-violet-600 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-400"> or drag and drop</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG or PNG (max. 800x800px)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/jpg,image/jpeg,image/png"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Manzil */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Manzil
            </label>
            <input
              type="text"
              placeholder="Manzilni kiriting"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>

          {/* Parol */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Parol
            </label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>

      {/* ── Guruh tanlash modali ──────────────────── */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setGroupModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  Guruhga biriktirish
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bir yoki bir nechta guruhni tanlang
                </p>
              </div>
              <button
                onClick={() => setGroupModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="Guruh qidirish..."
                value={groupModalSearch}
                onChange={(e) => setGroupModalSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            {/* List */}
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {AVAILABLE_GROUPS.filter((g) =>
                g.toLowerCase().includes(groupModalSearch.toLowerCase()),
              ).map((g, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempGroupModal.includes(g)}
                    onChange={() =>
                      setTempGroupModal((p) =>
                        p.includes(g) ? p.filter((x) => x !== g) : [...p, g],
                      )
                    }
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    {g}
                  </span>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setGroupModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmGroupModal}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const GROUPS_DATA = [
  {
    id: 1,
    active: true,
    name: "N26",
    course: "Backend",
    duration: "6 oy",
    time: "09:30",
    days: "Du. Se. Chor. Pay. Ju",
    room: "Autodesk",
    teacher: "Mohirbek",
    students: 1,
  },
  {
    id: 2,
    active: true,
    name: "n105",
    course: "Backend",
    duration: "6 oy",
    time: "16:00",
    days: "Se. Pay. Shan",
    room: "Autodesk",
    teacher: "Mohirbek",
    students: 4,
  },
];

const DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];
const GROUP_EMPTY = {
  name: "",
  course: "",
  room: "",
  days: [],
  time: "09:00",
  startDate: "",
  tavsif: "",
  teachers: [],
  students: [],
};

export function Groups() {
  const [activeTab, setActiveTab] = useState(0);
  const [groups, setGroups] = useState(GROUPS_DATA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(GROUP_EMPTY);
  const [errors, setErrors] = useState({});

  // Student modal
  const [studentModal, setStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [tempStudents, setTempStudents] = useState([]);

  // Teacher modal
  const [teacherModal, setTeacherModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [tempTeachers, setTempTeachers] = useState([]);

  const availableStudents = STUDENTS_MOCK.map((s) => s.name);
  const availableTeachers = TEACHERS_MOCK.map((t) => t.name);

  function toggleActive(id) {
    setGroups((p) =>
      p.map((g) => (g.id === id ? { ...g, active: !g.active } : g)),
    );
  }

  function openDrawer() {
    setForm(GROUP_EMPTY);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function toggleDay(day) {
    setForm((p) => ({
      ...p,
      days: p.days.includes(day)
        ? p.days.filter((d) => d !== day)
        : [...p.days, day],
    }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Guruh nomi kiritilishi shart";
    if (!form.course.trim()) e.course = "Kurs tanlanishi shart";
    if (!form.room.trim()) e.room = "Xona tanlanishi shart";
    if (form.days.length === 0) e.days = "Kamida bir kun tanlang";
    if (!form.startDate) e.startDate = "Boshlanish sanasini kiriting";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setGroups((p) => [
      ...p,
      {
        id: Date.now(),
        active: true,
        name: form.name,
        course: form.course,
        duration: "6 oy",
        time: form.time,
        days: form.days.map((d) => d.slice(0, 3)).join(". "),
        room: form.room,
        teacher: form.teachers[0] || "—",
        students: form.students.length,
      },
    ]);
    closeDrawer();
  }

  const totalTeachers = [...new Set(groups.map((g) => g.teacher))].length;
  const totalStudents = groups.reduce((sum, g) => sum + g.students, 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-gray-800">Guruhlar</h1>
        <button
          onClick={openDrawer}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <span className="text-base leading-none">+</span> Guruh qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
            ${activeTab === 0 ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        >
          <PeopleIcon sx={{ fontSize: 16 }} /> Guruhlar
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
            ${activeTab === 1 ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        >
          <CalendarTodayIcon sx={{ fontSize: 14 }} /> Arxiv
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Jami guruhlar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <PeopleIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">Jami guruhlar</p>
          <p className="text-3xl font-extrabold text-gray-800">
            {groups.length}
          </p>
        </div>

        {/* O'qituvchilar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <PeopleIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">O'qituvchilar</p>
          <p className="text-3xl font-extrabold text-gray-800">
            {totalTeachers}
          </p>
        </div>

        {/* O'quvchilar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <SchoolIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">O'quvchilar</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-gray-800">
              {totalStudents}
            </p>
            <div className="flex -space-x-2">
              {["#7C3AED", "#EA580C", "#16A34A"].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Guruh nomi
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Kurs
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Davomiyligi
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Dars vaqti
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Xona
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  O'qituvchi
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Talabalar
                </th>
                <th className="px-4 py-3">
                  <RefreshIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {/* Status toggle */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(g.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${g.active ? "bg-violet-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${g.active ? "translate-x-4.5" : "translate-x-0.5"}`}
                        />
                      </button>
                      <span
                        className={`text-[11px] font-bold ${g.active ? "text-green-500" : "text-gray-400"}`}
                      >
                        {g.active ? "FAOL" : "NOFAOL"}
                      </span>
                    </div>
                  </td>

                  {/* Guruh nomi */}
                  <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">
                    {g.name}
                  </td>

                  {/* Kurs */}
                  <td className="px-4 py-4">
                    <span className="text-[13px] font-semibold text-violet-600">
                      {g.course}
                    </span>
                  </td>

                  {/* Davomiyligi */}
                  <td className="px-4 py-4 text-[13px] text-gray-600">
                    {g.duration}
                  </td>

                  {/* Dars vaqti */}
                  <td className="px-4 py-4">
                    <p className="text-[13px] font-semibold text-gray-800">
                      {g.time}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{g.days}</p>
                  </td>

                  {/* Xona */}
                  <td className="px-4 py-4 text-[13px] text-gray-600">
                    {g.room}
                  </td>

                  {/* O'qituvchi */}
                  <td className="px-4 py-4 text-[13px] text-gray-600">
                    {g.teacher}
                  </td>

                  {/* Talabalar */}
                  <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">
                    {g.students}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <MoreVertIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Drawer ──────────────────────────────────── */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.2)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Drawer header */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[16px] font-bold text-gray-800">
              Guruh qo'shish
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {/* Guruh nomi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Guruh nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Frontend 2024"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.name ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Kurs */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Kurs <span className="text-red-500">*</span>
            </label>
            <select
              value={form.course}
              onChange={(e) => {
                setForm((p) => ({ ...p, course: e.target.value }));
                setErrors((p) => ({ ...p, course: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors bg-white ${errors.course ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            >
              <option value="">Tanlang</option>
              {["Backend", "Frontend", "Mobile", "UI/UX", "DevOps"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.course && (
              <p className="text-[11px] text-red-500 mt-1">{errors.course}</p>
            )}
          </div>

          {/* Xona */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Xona <span className="text-red-500">*</span>
            </label>
            <select
              value={form.room}
              onChange={(e) => {
                setForm((p) => ({ ...p, room: e.target.value }));
                setErrors((p) => ({ ...p, room: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors bg-white ${errors.room ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            >
              <option value="">Tanlang</option>
              {["Autodesk", "Room 1", "Room 2", "Aula"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.room && (
              <p className="text-[11px] text-red-500 mt-1">{errors.room}</p>
            )}
          </div>

          {/* Dars kunlari */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Dars kunlari <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.days.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-700">{day}</span>
                </label>
              ))}
            </div>
            {errors.days && (
              <p className="text-[11px] text-red-500 mt-1">{errors.days}</p>
            )}
          </div>

          {/* Dars vaqti */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Dars vaqti <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>

          {/* Boshlanish sanasi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Boshlanish sanasi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => {
                setForm((p) => ({ ...p, startDate: e.target.value }));
                setErrors((p) => ({ ...p, startDate: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.startDate ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.startDate && (
              <p className="text-[11px] text-red-500 mt-1">
                {errors.startDate}
              </p>
            )}
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Tavsif
            </label>
            <textarea
              rows={3}
              placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
              value={form.tavsif}
              onChange={(e) =>
                setForm((p) => ({ ...p, tavsif: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors resize-none"
            />
          </div>

          {/* O'qituvchilar */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              O'qituvchilar
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 min-h-10.5">
              {form.teachers.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.teachers.map((t, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {t}{" "}
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            teachers: p.teachers.filter((x) => x !== t),
                          }))
                        }
                        className="text-violet-400 hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setTempTeachers([...form.teachers]);
                  setTeacherSearch("");
                  setTeacherModal(true);
                }}
                className="flex items-center gap-1 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
              >
                + Qo'shish
              </button>
            </div>
          </div>

          {/* Talabalar */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Talabalar
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 min-h-10.5">
              {form.students.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.students.map((s, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {s}{" "}
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            students: p.students.filter((x) => x !== s),
                          }))
                        }
                        className="text-violet-400 hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setTempStudents([...form.students]);
                  setStudentSearch("");
                  setStudentModal(true);
                }}
                className="flex items-center gap-1 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
              >
                + Qo'shish
              </button>
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>

      {/* ── Student modal ──────────────────────────── */}
      {studentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setStudentModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  Talaba qo'shish
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bitta yoki bir nechta talabani tanlang
                </p>
              </div>
              <button
                onClick={() => setStudentModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="Talaba qidirish..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {availableStudents
                .filter((s) =>
                  s.toLowerCase().includes(studentSearch.toLowerCase()),
                )
                .map((s, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempStudents.includes(s)}
                      onChange={() =>
                        setTempStudents((p) =>
                          p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                        )
                      }
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-[13px] text-gray-700">{s}</span>
                  </label>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setStudentModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, students: tempStudents }));
                  setStudentModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Teacher modal ──────────────────────────── */}
      {teacherModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setTeacherModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  O'qituvchi qo'shish
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bitta yoki bir nechta o'qituvchini tanlang
                </p>
              </div>
              <button
                onClick={() => setTeacherModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="O'qituvchi qidirish..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {availableTeachers
                .filter((t) =>
                  t.toLowerCase().includes(teacherSearch.toLowerCase()),
                )
                .map((t, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempTeachers.includes(t)}
                      onChange={() =>
                        setTempTeachers((p) =>
                          p.includes(t) ? p.filter((x) => x !== t) : [...p, t],
                        )
                      }
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-[13px] text-gray-700">{t}</span>
                  </label>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setTeacherModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, teachers: tempTeachers }));
                  setTeacherModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const AVATAR_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#DB2777",
  "#0891B2",
];

const STUDENTS_MOCK = [
  {
    id: 1,
    name: "Ali Valiyev",
    groups: ["N26", "n105"],
    phone: "+998976541223",
    email: "ali@gmail.com",
    birth: "12.12.2010",
    address: "Sirdaryo",
    created: "12.05.2026",
  },
  {
    id: 2,
    name: "Salim Qodirov",
    groups: ["n105"],
    phone: "+998977777777",
    email: "salim@gmail.com",
    birth: "14.01.2007",
    address: "Buxoro",
    created: "14.05.2026",
  },
  {
    id: 3,
    name: "Bobur",
    groups: ["n105"],
    phone: "+998999999999",
    email: "bobur@gmail.com",
    birth: "14.03.2002",
    address: "Toshkent",
    created: "14.05.2026",
  },
  {
    id: 4,
    name: "Qodir Salimov",
    groups: ["n105"],
    phone: "+998911111111",
    email: "qodir@gmail.com",
    birth: "29.04.2026",
    address: "O'zbekcha",
    created: "14.05.2026",
  },
];

const AVAILABLE_GROUPS = ["N26", "n105", "N12", "B2", "C3", "A1", "M7", "K9"];

const STUDENT_EMPTY = {
  phone: "+998",
  email: "",
  fio: "",
  birthDate: "",
  address: "",
  password: "",
};

export function Students() {
  const [students, setStudents] = useState(STUDENTS_MOCK);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(STUDENT_EMPTY);
  const [groups, setGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [groupModal, setGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [tempGroups, setTempGroups] = useState([]);

  const allChecked = selected.length === students.length;
  function toggleAll() {
    setSelected(allChecked ? [] : students.map((s) => s.id));
  }
  function toggleOne(id) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }
  function handleDelete(id) {
    setStudents((p) => p.filter((s) => s.id !== id));
  }

  function openDrawer() {
    setForm(STUDENT_EMPTY);
    setGroups([]);
    setGroupInput("");
    setPhotoPreview(null);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function addGroup() {
    if (groupInput.trim()) {
      setGroups((p) => [...p, groupInput.trim()]);
      setGroupInput("");
    }
  }
  function removeGroup(i) {
    setGroups((p) => p.filter((_, idx) => idx !== i));
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function validate() {
    const e = {};
    if (!form.phone.trim() || form.phone === "+998")
      e.phone = "Telefon kiritilishi shart";
    if (!form.fio.trim()) e.fio = "FIO kiritilishi shart";
    if (!form.address.trim()) e.address = "Manzil kiritilishi shart";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const today = new Date().toLocaleDateString("ru-RU").replace(/\//g, ".");
    setStudents((p) => [
      ...p,
      {
        id: Date.now(),
        name: form.fio,
        groups,
        phone: form.phone,
        email: form.email,
        birth: form.birthDate || "—",
        address: form.address,
        created: today,
      },
    ]);
    closeDrawer();
  }

  const inp = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${err ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            Talabalar
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini
            topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari
            keltirilgan.
          </p>
        </div>
        <button
          onClick={openDrawer}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <span className="text-base leading-none">+</span> Talaba qo'shish
        </button>
      </div>

      {/* White card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + filter bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-52 hover:border-violet-300 transition-colors">
            <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <FilterListIcon sx={{ fontSize: 16 }} /> Filters
            </button>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <ArchiveIcon sx={{ fontSize: 16 }} /> Arxiv
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  <span className="flex items-center gap-1 cursor-pointer select-none">
                    Nomi <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                  </span>
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Guruh
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Telefon raqamlari
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Tug'ilgan sanasi
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Manzil
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Yaratilgan sana
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => {
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-50 transition-colors ${selected.includes(s.id) ? "bg-violet-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        onChange={() => toggleOne(s.id)}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
                          style={{ background: color }}
                        >
                          {s.name[0].toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-gray-800">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.groups.map((g, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {s.phone}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {s.email}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {s.birth}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {s.address}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {s.created}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <VisibilityIcon
                            sx={{ fontSize: 16, color: "#9CA3AF" }}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          <DeleteIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 cursor-pointer transition-colors">
                          <EditIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            ← Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${p === 1 ? "bg-violet-600 text-white" : p === "..." ? "text-gray-400 cursor-default" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            Next →
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.2)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-bold text-gray-800">
              Talaba qo'shish
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            Bu yerda siz yangi Talaba qo'shishingiz mumkin.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Telefon */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Telefon raqam
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => {
                setForm((p) => ({ ...p, phone: e.target.value }));
                setErrors((p) => ({ ...p, phone: "" }));
              }}
              className={inp(errors.phone)}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Mail */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Mail
            </label>
            <input
              type="email"
              placeholder="Elektron pochtani kiriting"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          {/* FIO */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Talaba FIO
            </label>
            <input
              type="text"
              placeholder="Ma'lumotni kiriting"
              value={form.fio}
              onChange={(e) => {
                setForm((p) => ({ ...p, fio: e.target.value }));
                setErrors((p) => ({ ...p, fio: "" }));
              }}
              className={inp(errors.fio)}
            />
            {errors.fio && (
              <p className="text-[11px] text-red-500 mt-1">{errors.fio}</p>
            )}
          </div>

          {/* Tug'ilgan sanasi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Tug'ilgan sanasi
            </label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, birthDate: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          {/* Manzil */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Manzil
            </label>
            <input
              type="text"
              placeholder="Manzilni kiriting"
              value={form.address}
              onChange={(e) => {
                setForm((p) => ({ ...p, address: e.target.value }));
                setErrors((p) => ({ ...p, address: "" }));
              }}
              className={inp(errors.address)}
            />
            {errors.address && (
              <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Parol */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Parol
            </label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          {/* Guruh */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Guruh
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-10.5 focus-within:border-violet-400 transition-colors">
              {groups.map((g, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[12px] px-2 py-0.5 rounded-lg"
                >
                  {g}{" "}
                  <button
                    onClick={() => removeGroup(i)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Guruh nomi..."
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                className="text-[13px] outline-none bg-transparent flex-1 min-w-20 placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => {
                setTempGroups([...groups]);
                setGroupSearch("");
                setGroupModal(true);
              }}
              className="flex items-center gap-1 mt-2 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
            >
              + Guruh qo'shish
            </button>
          </div>

          {/* Surati */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Surati
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-violet-400 transition-colors">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl"
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 28, color: "#6B7280" }} />
                  <p className="text-[13px] mt-2">
                    <span className="text-violet-600 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-400"> or drag and drop</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG or PNG (max. 2 MB)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>

      {/* Group modal */}
      {groupModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setGroupModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  Guruhga biriktirish
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bir yoki bir nechta guruhni tanlang
                </p>
              </div>
              <button
                onClick={() => setGroupModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-violet-400 transition-colors">
                <SearchIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Guruh qidirish..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
                />
              </div>
            </div>

            {/* List */}
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {AVAILABLE_GROUPS.filter((g) =>
                g.toLowerCase().includes(groupSearch.toLowerCase()),
              ).map((g, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempGroups.includes(g)}
                    onChange={() =>
                      setTempGroups((p) =>
                        p.includes(g) ? p.filter((x) => x !== g) : [...p, g],
                      )
                    }
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    {g}
                  </span>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setGroupModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setGroups(tempGroups);
                  setGroupModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Payments() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">
          To'lovlar
        </h1>
        <p className="text-sm text-gray-400">Barcha to'lovlar ro'yxati</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        Hozircha to'lovlar mavjud emas.
      </div>
    </>
  );
}

export function Settings() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">
          Boshqarish
        </h1>
        <p className="text-sm text-gray-400">Tizim sozlamalari</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        Hozircha sozlamalar mavjud emas.
      </div>
    </>
  );
}

const BOSHQARISH_TABS = [
  { label: "Kurslar", path: "/dashboard/courses" },
  { label: "Xonalar", path: "/dashboard/rooms" },
  { label: "Xodimlar", path: "/dashboard/staff" },
];

const ROOMS_DATA = [{ id: 1, name: "Autodesk", capacity: 20 }];

export function Rooms() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState(ROOMS_DATA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", capacity: "" });
  const [errors, setErrors] = useState({});

  function openAdd() {
    setEditId(null);
    setForm({ name: "", capacity: "" });
    setErrors({});
    setDrawerOpen(true);
  }

  function openEdit(room) {
    setEditId(room.id);
    setForm({ name: room.name, capacity: String(room.capacity) });
    setErrors({});
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setErrors({});
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Nom kiritilishi shart";
    if (!form.capacity.trim()) e.capacity = "Sig'im kiritilishi shart";
    else if (isNaN(Number(form.capacity))) e.capacity = "Faqat raqam kiriting";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (editId !== null) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === editId
            ? { ...r, name: form.name.trim(), capacity: Number(form.capacity) }
            : r,
        ),
      );
    } else {
      setRooms((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name.trim(),
          capacity: Number(form.capacity),
        },
      ]);
    }
    closeDrawer();
  }

  function handleDelete(id) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-3">Boshqarish</h1>

      {/* Top tabs */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
        {BOSHQARISH_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2
              ${
                location.pathname === tab.path
                  ? "text-violet-600 border-violet-600"
                  : "text-gray-400 hover:text-gray-700 border-transparent"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-gray-800">Xonalar</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <RefreshIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
            </button>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            Xonani qo'shish
          </button>
        </div>

        {/* Rooms grid */}
        {rooms.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Hozircha xonalar mavjud emas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="text-[13px] font-bold text-gray-800">
                    {room.name}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Sig'imi: {room.capacity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <DeleteIcon sx={{ fontSize: 17, color: "#EF4444" }} />
                  </button>
                  <button
                    onClick={() => openEdit(room)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 transition-colors cursor-pointer"
                  >
                    <EditIcon sx={{ fontSize: 16, color: "#7C3AED" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Slide-in drawer ───────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.15)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50
                   flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-800">
            {editId !== null ? "Xonani tahrirlash" : "Xonani qo'shish"}
          </span>
          <button
            onClick={closeDrawer}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
        </div>

        {/* Drawer form */}
        <div className="flex-1 px-5 py-5 flex flex-col gap-5 overflow-y-auto">
          {/* Nomi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Xona nomi"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
                ${errors.name ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Sig'imi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Sig'imi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Masalan: 20"
              value={form.capacity}
              onChange={(e) => {
                setForm((p) => ({ ...p, capacity: e.target.value }));
                setErrors((p) => ({ ...p, capacity: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
                ${errors.capacity ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.capacity && (
              <p className="text-[11px] text-red-500 mt-1">{errors.capacity}</p>
            )}
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>
    </>
  );
}

const CARD_COLORS = [
  "bg-violet-50",
  "bg-blue-50",
  "bg-green-50",
  "bg-amber-50",
  "bg-pink-50",
  "bg-orange-50",
];

const COURSES_DATA = [
  {
    id: 1,
    title: "Backend",
    description: "Yaxshi",
    duration: "120 min",
    period: "6 oy",
    price: "2400000",
    color: "bg-violet-50",
  },
];

function CustomSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full border rounded-xl px-3 py-2.5 pr-9 text-[13px] text-left outline-none transition-colors bg-white cursor-pointer flex items-center justify-between
          ${error ? "border-red-400" : open ? "border-violet-400" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span
          className="absolute inset-y-0 right-3 flex items-center transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ExpandMoreIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
        </span>
      </button>

      <div
        className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        style={{
          top: "calc(100% + 4px)",
          maxHeight: open ? "200px" : "0px",
          opacity: open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="py-1">
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-[13px] text-gray-400 hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer transition-colors
                ${value === opt ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState(COURSES_DATA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    period: "",
    price: "",
  });
  const [errors, setErrors] = useState({});

  function openAdd() {
    setEditId(null);
    setForm({
      title: "",
      description: "",
      duration: "",
      period: "",
      price: "",
    });
    setErrors({});
    setDrawerOpen(true);
  }

  function openEdit(course) {
    setEditId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      duration: course.duration,
      period: course.period,
      price: course.price,
    });
    setErrors({});
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setErrors({});
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Nom kiritilishi shart";
    if (!form.duration.trim()) e.duration = "Davomiylik kiritilishi shart";
    if (!form.period.trim()) e.period = "Muddati kiritilishi shart";
    if (!form.price.trim()) e.price = "Narxi kiritilishi shart";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (editId !== null) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, ...form } : c)),
      );
    } else {
      setCourses((prev) => {
        const color = CARD_COLORS[prev.length % CARD_COLORS.length];
        return [...prev, { id: Date.now(), color, ...form }];
      });
    }
    closeDrawer();
  }

  function handleDelete(id) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-3">Boshqarish</h1>

      {/* Top tabs */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
        {BOSHQARISH_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2
              ${
                location.pathname === tab.path
                  ? "text-violet-600 border-violet-600"
                  : "text-gray-400 hover:text-gray-700 border-transparent"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-800">Kurslar</span>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            Kurslar qo'shish
          </button>
        </div>

        {/* Courses grid */}
        {courses.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Hozircha kurslar mavjud emas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`${course.color ?? "bg-violet-50"} rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-1">
                      {course.title}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <DeleteIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                    </button>
                    <button
                      onClick={() => openEdit(course)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 transition-colors cursor-pointer"
                    >
                      <EditIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {[course.duration, course.period, course.price].map(
                    (tag, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-500 font-medium"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.15)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[16px] font-bold text-gray-800">
              {editId !== null ? "Kursni tahrirlash" : "Kurs qo'shish"}
            </p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Bu yerda siz yangi kurs qo'shishingiz mumkin.
            </p>
          </div>
          <button
            onClick={closeDrawer}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
          >
            <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          {/* Nomi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="HR Manager..."
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                setErrors((p) => ({ ...p, title: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
                ${errors.title ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Dars davomiyligi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Dars davomiyligi <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={form.duration}
              onChange={(v) => {
                setForm((p) => ({ ...p, duration: v }));
                setErrors((p) => ({ ...p, duration: "" }));
              }}
              options={["60 min", "90 min", "120 min"]}
              placeholder="Tanlang"
              error={errors.duration}
            />
            {errors.duration && (
              <p className="text-[11px] text-red-500 mt-1">{errors.duration}</p>
            )}
          </div>

          {/* Kurs davomiyligi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Kurs davomiyligi (oylarda) <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={form.period}
              onChange={(v) => {
                setForm((p) => ({ ...p, period: v }));
                setErrors((p) => ({ ...p, period: "" }));
              }}
              options={["1 oy", "3 oy", "6 oy"]}
              placeholder="Tanlang"
              error={errors.period}
            />
            {errors.period && (
              <p className="text-[11px] text-red-500 mt-1">{errors.period}</p>
            )}
          </div>

          {/* Narx */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Narx <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Narxini kiriting"
              value={form.price}
              onChange={(e) => {
                setForm((p) => ({ ...p, price: e.target.value }));
                setErrors((p) => ({ ...p, price: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
                ${errors.price ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.price && (
              <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="A little about the company and the team that you'll be working with."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              This is a hint text to help user.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-5 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>
    </>
  );
}
