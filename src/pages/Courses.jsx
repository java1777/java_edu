import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../components/ui/CustomSelect";
import { BOSHQARISH_TABS } from "../constants/nav.jsx";

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

export default function Courses() {
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
    setForm({ title: "", description: "", duration: "", period: "", price: "" });
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
                  {[course.duration, course.period, course.price].map((tag, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-500 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
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
