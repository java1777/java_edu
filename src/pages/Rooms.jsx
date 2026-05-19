import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { BOSHQARISH_TABS } from "../constants/nav.jsx";

const ROOMS_DATA = [{ id: 1, name: "Autodesk", capacity: 20 }];

export default function Rooms() {
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
                  <p className="text-[13px] font-bold text-gray-800">{room.name}</p>
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
