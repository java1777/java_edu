import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { BOSHQARISH_TABS } from "../constants/nav.jsx";
import { roomsApi } from "../api/rooms";
import { useLanguage } from "../contexts/LanguageContext";

export default function Rooms() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [archivedRooms, setArchivedRooms] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", capacity: "" });
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await roomsApi.getAll();
      const list = Array.isArray(res) ? res : (res?.data ?? res?.rooms ?? []);
      setRooms(list);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

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
    if (!form.name.trim()) e.name = t("rooms.form_name");
    if (!form.capacity.trim()) e.capacity = t("rooms.form_capacity");
    else if (isNaN(Number(form.capacity))) e.capacity = t("common.no_data");
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
      const body = { name: form.name.trim(), capacity: Number(form.capacity) };
      if (editId !== null) {
        await roomsApi.update(editId, body);
      } else {
        await roomsApi.create(body);
      }
      closeDrawer();
      await loadRooms();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await roomsApi.remove(deleteId);
      setRooms((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setApiError(err.message);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-3">
        {t("nav.settings")}
      </h1>

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
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {[t("rooms.title"), t("groups.tab_archive")].map((label, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveTab(i);
                  if (i === 1 && archivedRooms.length === 0) {
                    setArchiveLoading(true);
                    // GET /rooms/arxive — swagger bo'yicha
                    roomsApi
                      .getArchive()
                      .then((res) => {
                        const list = Array.isArray(res)
                          ? res
                          : (res?.data ?? res?.rooms ?? []);
                        setArchivedRooms(list);
                      })
                      .catch(() => {})
                      .finally(() => setArchiveLoading(false));
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
                  ${activeTab === i ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              >
                {label}
              </button>
            ))}
            {activeTab === 0 && (
              <button
                onClick={loadRooms}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <RefreshIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />
              </button>
            )}
          </div>
          {activeTab === 0 && (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-lg leading-none">+</span> {t("rooms.add")}
            </button>
          )}
        </div>

        {apiError && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-[13px] border-b border-red-100">
            {apiError}
          </div>
        )}

        {/* Arxiv tab */}
        {activeTab === 1 &&
          (archiveLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">
              {t("common.loading")}
            </div>
          ) : archivedRooms.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Arxivda xonalar yo'q
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {archivedRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-gray-50 opacity-75 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div>
                    <p className="text-[13px] font-bold text-gray-700">
                      {room.name}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {t("rooms.col_capacity")}: {room.capacity}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await roomsApi.update(room.id, { active: true });
                        setArchivedRooms((p) =>
                          p.filter((r) => r.id !== room.id),
                        );
                      } catch (err) {
                        alert("Xatolik: " + (err.message ?? err));
                      }
                    }}
                    className="text-[12px] font-semibold text-green-600 border border-green-300 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-center"
                  >
                    ↩ Qaytarish
                  </button>
                </div>
              ))}
            </div>
          ))}

        {activeTab === 0 && loading ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {t("common.loading")}
          </div>
        ) : activeTab === 0 && rooms.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {t("rooms.empty")}
          </div>
        ) : activeTab === 0 ? (
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
                    {t("rooms.col_capacity")}: {room.capacity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDeleteId(room.id)}
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
        ) : null}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-7 w-80 z-10">
            <h3 className="text-[17px] font-bold text-gray-800 mb-2">
              Xonani o'chirish
            </h3>
            <p className="text-[13px] text-gray-500 mb-6">
              Rostdan ham o'chirishni hohlaysizmi?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13px] font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                {deleting ? "..." : "Ha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.35)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-800">
            {editId !== null ? t("rooms.drawer_edit") : t("rooms.drawer_add")}
          </span>
          <button
            onClick={closeDrawer}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 flex flex-col gap-5 overflow-y-auto">
          {errors.api && (
            <p className="text-[12px] text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {errors.api}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("rooms.form_name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Xona nomi"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.name ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("rooms.form_capacity")} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Masalan: 20"
              value={form.capacity}
              onChange={(e) => {
                setForm((p) => ({ ...p, capacity: e.target.value }));
                setErrors((p) => ({ ...p, capacity: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.capacity ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.capacity && (
              <p className="text-[11px] text-red-500 mt-1">{errors.capacity}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl transition-colors cursor-pointer"
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </>
  );
}
