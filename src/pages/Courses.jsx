import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../components/ui/CustomSelect";
import { BOSHQARISH_TABS } from "../constants/nav.jsx";
import { coursesApi } from "../api/courses";
import { useLanguage } from "../contexts/LanguageContext";

const CARD_COLORS = [
  "bg-violet-50",
  "bg-blue-50",
  "bg-green-50",
  "bg-amber-50",
  "bg-pink-50",
  "bg-orange-50",
];

function toUiCourse(c, i) {
  return {
    id: c.id,
    title: c.name ?? c.title ?? "—",
    description: c.description ?? "",
    duration: c.duration_hours ? `${c.duration_hours} min` : (c.duration ?? ""),
    period: c.duration_month ? `${c.duration_month} oy` : (c.period ?? ""),
    price: c.price != null ? String(c.price) : "",
    color: CARD_COLORS[i % CARD_COLORS.length],
  };
}

export default function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(0); // 0=Kurslar, 1=Arxiv
  const [courses, setCourses] = useState([]);
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
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

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await coursesApi.getAll();
      const list = Array.isArray(res) ? res : (res?.data ?? res?.courses ?? []);
      setCourses(list.map(toUiCourse));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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
    if (!form.title.trim()) e.title = t("courses.form_name");
    if (!form.duration.trim()) e.duration = t("courses.form_duration");
    if (!form.period.trim()) e.period = t("courses.form_period");
    if (!form.price.trim()) e.price = t("courses.form_price");
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
      const body = {
        name: form.title.trim(),
        description: form.description.trim(),
        duration_hours: parseInt(form.duration),
        duration_month: parseInt(form.period),
        price: Number(form.price),
      };
      if (editId !== null) {
        await coursesApi.update(editId, body);
      } else {
        await coursesApi.create(body);
      }
      closeDrawer();
      await loadCourses();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await coursesApi.remove(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
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
            {[t("courses.title"), t("groups.tab_archive")].map((label, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveTab(i);
                  if (i === 1 && archivedCourses.length === 0) {
                    setArchiveLoading(true);
                    coursesApi
                      .getArchive()
                      .then((res) => {
                        const list = Array.isArray(res)
                          ? res
                          : (res?.data ?? res?.courses ?? []);
                        setArchivedCourses(list.map(toUiCourse));
                      })
                      .catch(() => {})
                      .finally(() => setArchiveLoading(false));
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
                  ${
                    activeTab === i
                      ? "bg-white border border-gray-200 shadow-sm text-gray-800"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          {activeTab === 0 && (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-lg leading-none">+</span> {t("courses.add")}
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
          ) : archivedCourses.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Arxivda kurslar yo'q
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {archivedCourses.map((course) => (
                <div
                  key={course.id}
                  className={`${course.color ?? "bg-gray-50"} opacity-75 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3`}
                >
                  <p className="text-[14px] font-bold text-gray-700">
                    {course.title}
                  </p>
                  {course.description && (
                    <p className="text-[12px] text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {course.duration && (
                      <span className="text-[11px] bg-white/70 px-2 py-0.5 rounded-lg text-gray-500">
                        {course.duration}
                      </span>
                    )}
                    {course.period && (
                      <span className="text-[11px] bg-white/70 px-2 py-0.5 rounded-lg text-gray-500">
                        {course.period}
                      </span>
                    )}
                    {course.price && (
                      <span className="text-[11px] bg-white/70 px-2 py-0.5 rounded-lg font-semibold text-gray-600">
                        {course.price} so'm
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await coursesApi.update(course.id, { active: true });
                        setArchivedCourses((p) =>
                          p.filter((c) => c.id !== course.id),
                        );
                      } catch (err) {
                        alert("Xatolik: " + (err.message ?? err));
                      }
                    }}
                    className="text-[12px] font-semibold text-green-600 border border-green-300 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors w-full text-center mt-1"
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
        ) : activeTab === 0 && courses.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {t("courses.empty")}
          </div>
        ) : activeTab === 0 ? (
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
        ) : null}
      </div>

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
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[16px] font-bold text-gray-800">
              {editId !== null
                ? t("courses.drawer_edit")
                : t("courses.drawer_add")}
            </p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {t("courses.drawer_desc")}
            </p>
          </div>
          <button
            onClick={closeDrawer}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
          >
            <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          {errors.api && (
            <p className="text-[12px] text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {errors.api}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("courses.form_name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="HR Manager..."
              value={form.title}
              onChange={(e) => {
                setForm((p) => ({ ...p, title: e.target.value }));
                setErrors((p) => ({ ...p, title: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.title ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Lesson duration */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("courses.form_duration")}{" "}
              <span className="text-red-500">*</span>
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

          {/* Course period */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("courses.form_period")} <span className="text-red-500">*</span>
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

          {/* Price */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("courses.form_price")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Narxini kiriting"
              value={form.price}
              onChange={(e) => {
                setForm((p) => ({ ...p, price: e.target.value }));
                setErrors((p) => ({ ...p, price: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.price ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.price && (
              <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("courses.form_description")}
            </label>
            <textarea
              rows={4}
              placeholder="A little about the course..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-5 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
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
