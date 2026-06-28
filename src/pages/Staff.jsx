import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BOSHQARISH_TABS } from "../constants/nav.jsx";
import { usersApi } from "../api/users";
import { useLanguage } from "../contexts/LanguageContext";

const AVATAR_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#DB2777",
  "#0891B2",
  "#9333EA",
  "#CA8A04",
];

const EMPTY = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  address: "",
  password: "",
};

export default function Staff() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await usersApi.getAll();
      const list = Array.isArray(res) ? res : (res?.data ?? res?.admins ?? []);
      setStaff(list);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  function openAdd() {
    setForm(EMPTY);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function validate() {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Ism kiritilishi shart";
    if (!form.last_name.trim()) e.last_name = "Familya kiritilishi shart";
    if (!form.phone.trim()) e.phone = "Telefon kiritilishi shart";
    if (!form.password.trim()) e.password = "Parol kiritilishi shart";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      await usersApi.create({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password.trim(),
      });
      closeDrawer();
      await loadStaff();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSaving(false);
    }
  }

  const inp = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
     ${err ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  return (
    <>
      {/* Tab navigation */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-4">
          Boshqarish
        </h1>
        <div className="flex items-center gap-1 border-b border-gray-100">
          {BOSHQARISH_TABS.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2
                ${
                  location.pathname === tab.path
                    ? "text-violet-600 border-violet-600"
                    : "text-gray-400 hover:text-gray-700 border-transparent"
                }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-gray-800">Hodimlar</h2>
          <span className="text-[13px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {staff.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStaff}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <RefreshIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <PersonAddIcon sx={{ fontSize: 16 }} />
            Hodim qo'shish
          </button>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">
          {apiError}
        </div>
      )}

      {/* Staff grid */}
      {loading ? (
        <div className="text-center text-[13px] text-gray-400 py-16">
          Yuklanmoqda...
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <PersonAddIcon sx={{ fontSize: 28, color: "#D1D5DB" }} />
          </div>
          <p className="text-[14px] font-semibold text-gray-500">
            Hodimlar yo'q
          </p>
          <p className="text-[12px] text-gray-400 mt-1">
            Yangi hodim qo'shish uchun tugmani bosing
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {staff.map((s, i) => {
            const name =
              `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "—";
            const initials =
              `${(s.first_name ?? "?")[0]}${(s.last_name ?? "?")[0]}`.toUpperCase();
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={s.id ?? i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-200 overflow-hidden"
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-white text-[15px] font-bold">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-800 truncate">
                      {name}
                    </p>
                    <p className="text-[11px] text-violet-500 font-medium bg-violet-50 px-2 py-0.5 rounded-full w-fit mt-0.5">
                      Admin
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors shrink-0"
                  >
                    <DeleteIcon sx={{ fontSize: 16, color: "#EF4444" }} />
                  </button>
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-gray-50" />

                {/* Info */}
                <div className="px-5 py-3 flex flex-col gap-2">
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                      <span className="text-[12px] text-gray-600 truncate">
                        {s.phone}
                      </span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <EmailIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                      <span className="text-[12px] text-gray-600 truncate">
                        {s.email}
                      </span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-2">
                      <LocationOnIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                      <span className="text-[12px] text-gray-600 truncate">
                        {s.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-7 w-80 z-10">
            <h3 className="text-[17px] font-bold text-gray-800 mb-2">
              Hodimni o'chirish
            </h3>
            <p className="text-[13px] text-gray-500 mb-6">
              Rostdan ham o'chirishni hohlaysizmi?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    // DELETE endpoint swagger da yo'q — hozircha UI dan o'chirish
                    setStaff((p) => p.filter((s) => s.id !== deleteId));
                    setDeleteId(null);
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-semibold px-5 py-2 rounded-xl cursor-pointer transition-colors"
              >
                {deleting ? "..." : "Ha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add drawer backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.35)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Add drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[16px] font-bold text-gray-800">
            Yangi hodim qo'shish
          </span>
          <button
            onClick={closeDrawer}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {errors.api && (
            <p className="text-[12px] text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {errors.api}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Ism <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Ism"
                value={form.first_name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, first_name: e.target.value }));
                  setErrors((p) => ({ ...p, first_name: "" }));
                }}
                className={inp(errors.first_name)}
              />
              {errors.first_name && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Familya <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Familya"
                value={form.last_name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, last_name: e.target.value }));
                  setErrors((p) => ({ ...p, last_name: "" }));
                }}
                className={inp(errors.last_name)}
              />
              {errors.last_name && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              <PhoneIcon sx={{ fontSize: 14 }} /> Telefon{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="+998XXXXXXXXX"
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

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              <EmailIcon sx={{ fontSize: 14 }} /> Email
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              <LocationOnIcon sx={{ fontSize: 14 }} /> Manzil
            </label>
            <input
              placeholder="Shahar, ko'cha..."
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Parol <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={(e) => {
                setForm((p) => ({ ...p, password: e.target.value }));
                setErrors((p) => ({ ...p, password: "" }));
              }}
              className={inp(errors.password)}
            />
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl cursor-pointer transition-colors"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </>
  );
}
