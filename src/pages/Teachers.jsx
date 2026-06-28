import { useState, useEffect, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import IosShareIcon from "@mui/icons-material/IosShare";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EmailIcon from "@mui/icons-material/Email";
import { teachersApi } from "../api/teachers";
import { groupsApi } from "../api/groups";
import { useLanguage } from "../contexts/LanguageContext";

// ─── Backend response normalize ──────────────────────────────────────────────
const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

function fixPhotoUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SERVER_ORIGIN}${url}`;
  return `${SERVER_ORIGIN}/files/${url}`;
}

function normalizeList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.teachers)) return res.teachers;
  return [];
}

function toUiTeacher(t) {
  return {
    id: t.id,
    name: t.full_name ?? t.name ?? "—",
    phone: t.phone ?? "—",
    email: t.email ?? "—",
    address: t.address ?? "—",
    photo: fixPhotoUrl(
      t.photo ?? t.image ?? t.avatar ?? t.profile_image ?? null,
    ),
    groups: Array.isArray(t.groups) ? t.groups.map((g) => g.name ?? g) : [],
    extra: 0,
    created: t.created_at
      ? new Date(t.created_at).toLocaleDateString("uz-UZ")
      : "—",
  };
}

function toApiBody(form, groups) {
  return {
    phone: form.phone,
    email: form.email,
    full_name: form.fio,
    address: form.address,
    password: form.password,
    groups: groups.filter((g) => g.id != null).map((g) => g.id),
  };
}

const ITEMS_PER_PAGE = 10;

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  if (total > 1) pages.push(total);
  return pages;
}

const EMPTY_FORM = {
  phone: "+998",
  email: "",
  fio: "",
  birthDate: "1990-03-01",
  gender: "",
  address: "",
  photo: null,
  password: "",
};

export default function Teachers() {
  const { t } = useLanguage();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const [availableGroups, setAvailableGroups] = useState([]);

  const [showArchive, setShowArchive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [groups, setGroups] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalSearch, setGroupModalSearch] = useState("");
  const [tempGroupModal, setTempGroupModal] = useState([]);

  // ── GET /api/v1/teachers ─────────────────────────────────────────────────
  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    setShowArchive(false);
    setCurrentPage(1);
    try {
      const res = await teachersApi.getAll();
      setTeachers(normalizeList(res).map(toUiTeacher));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GET /api/v1/teachers/archive ─────────────────────────────────────────
  const loadArchive = useCallback(async () => {
    setLoading(true);
    setApiError("");
    setShowArchive(true);
    setCurrentPage(1);
    setSelected([]);
    try {
      const res = await teachersApi.getArchive();
      setTeachers(normalizeList(res).map(toUiTeacher));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
    groupsApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.groups ?? []);
        setAvailableGroups(list);
      })
      .catch(() => {});
  }, [loadTeachers]);

  // ── Checkbox ─────────────────────────────────────────────────────────────
  const allChecked = teachers.length > 0 && selected.length === teachers.length;
  const toggleAll = () =>
    setSelected(allChecked ? [] : teachers.map((tc) => tc.id));
  const toggleOne = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const filtered = teachers.filter((tc) =>
    tc.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  function handleSearch(val) {
    setSearch(val);
    setCurrentPage(1);
  }

  // ── Drawer ───────────────────────────────────────────────────────────────
  function openDrawer() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGroups([]);
    setPhotoPreview(null);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setEditingId(null);
    setDrawerOpen(false);
  }

  async function openEdit(tc) {
    setErrors({});
    setPhotoPreview(tc.photo || null);
    try {
      const raw = await teachersApi.getOne(tc.id);
      const teacher = raw?.data ?? raw;
      const GENDER_UNMAP = { male: "Erkak", female: "Ayol" };
      setForm({
        phone: teacher.phone ?? tc.phone ?? "+998",
        email: teacher.email ?? tc.email ?? "",
        fio: teacher.full_name ?? teacher.name ?? tc.name ?? "",
        birthDate: teacher.birthday ?? teacher.birth_date ?? "1990-03-01",
        gender: GENDER_UNMAP[teacher.gender] ?? teacher.gender ?? "",
        address: teacher.address ?? tc.address ?? "",
        photo: null,
        password: "",
      });
      const teacherGroups = Array.isArray(teacher.groups) ? teacher.groups : [];
      const resolvedGroups = teacherGroups.map((g) => {
        if (g.id != null) return { id: g.id, name: g.name ?? String(g) };
        const found = availableGroups.find((ag) => ag.name === (g.name ?? g));
        return found
          ? { id: found.id, name: found.name }
          : { id: null, name: g.name ?? String(g) };
      });
      setGroups(resolvedGroups);
    } catch {
      setForm({
        phone: tc.phone ?? "+998",
        email: tc.email ?? "",
        fio: tc.name ?? "",
        birthDate: "1990-03-01",
        gender: "",
        address: tc.address ?? "",
        photo: null,
        password: "",
      });
      setGroups([]);
    }
    setEditingId(tc.id);
    setDrawerOpen(true);
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
      e.phone = t("common.phone") + " " + t("common.not_found");
    if (!form.fio.trim()) e.fio = t("teachers.form_fio");
    if (!editingId && !form.password.trim()) e.password = t("common.password");
    return e;
  }

  // ── POST / PATCH /api/v1/teachers ────────────────────────────────────────
  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      const apiBody = toApiBody(form, groups);
      if (editingId && !apiBody.password) delete apiBody.password;

      let body;
      if (form.photo instanceof File) {
        body = new FormData();
        Object.entries(apiBody).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((item) => body.append(k, item));
          else if (v != null) body.append(k, v);
        });
        body.append("photo", form.photo);
      } else {
        body = apiBody;
      }

      if (editingId) {
        await teachersApi.update(editingId, body);
      } else {
        await teachersApi.create(body);
      }
      closeDrawer();
      await loadTeachers();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSaving(false);
    }
  }

  // ── DELETE /api/v1/teachers/{id} ─────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await teachersApi.remove(id);
      setTeachers((p) => p.filter((tc) => tc.id !== id));
      setSelected((p) => p.filter((x) => x !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            {showArchive ? t("teachers.archive_title") : t("teachers.title")}
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            {t("teachers.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showArchive ? (
            <button
              onClick={loadTeachers}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t("common.back")}
            </button>
          ) : (
            <>
              <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                <IosShareIcon sx={{ fontSize: 16 }} /> {t("common.export")}
              </button>
              <button
                onClick={openDrawer}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-base leading-none">+</span>{" "}
                {t("teachers.add")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <FilterListIcon sx={{ fontSize: 17 }} /> {t("common.filters")}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-52 hover:border-violet-300 transition-colors">
              <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
              />
            </div>
            <button
              onClick={showArchive ? loadTeachers : loadArchive}
              className={`flex items-center gap-1.5 border rounded-xl px-3 py-2 text-[13px] transition-colors cursor-pointer
                ${
                  showArchive
                    ? "border-violet-300 text-violet-600 bg-violet-50"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              <ArchiveIcon sx={{ fontSize: 16 }} /> {t("common.archive")}
            </button>
          </div>
        </div>

        {/* API error */}
        {apiError && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-[13px] border-b border-red-100">
            {apiError}
          </div>
        )}

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
                    {t("teachers.col_name")}{" "}
                    <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                  </span>
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("teachers.col_group")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("teachers.col_phone")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("teachers.col_email")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("teachers.col_address")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("teachers.col_created")}
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-[13px] text-gray-400"
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-[13px] text-gray-400"
                  >
                    {t("teachers.empty")}
                  </td>
                </tr>
              ) : (
                paginated.map((tc) => (
                  <tr
                    key={tc.id}
                    className={`border-b border-gray-50 transition-colors ${selected.includes(tc.id) ? "bg-violet-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(tc.id)}
                        onChange={() => toggleOne(tc.id)}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tc.photo ? (
                          <img
                            src={tc.photo}
                            alt={tc.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-400 to-blue-400 flex items-center justify-center shrink-0">
                            <span className="text-white text-[12px] font-semibold uppercase">
                              {tc.name[0]}
                            </span>
                          </div>
                        )}
                        <span className="text-[13px] font-semibold text-gray-800">
                          {tc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tc.groups.slice(0, 3).map((g, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500"
                          >
                            {typeof g === "object" ? (g.name ?? "") : g}
                          </span>
                        ))}
                        {tc.groups.length > 3 && (
                          <span className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500">
                            +{tc.groups.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {tc.phone}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {tc.email}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {tc.address}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">
                      {tc.created}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <VisibilityIcon
                            sx={{ fontSize: 16, color: "#9CA3AF" }}
                          />
                        </button>
                        {!showArchive && (
                          <>
                            <button
                              onClick={() => handleDelete(tc.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                            >
                              <DeleteIcon
                                sx={{ fontSize: 16, color: "#9CA3AF" }}
                              />
                            </button>
                            <button
                              onClick={() => openEdit(tc)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 cursor-pointer transition-colors"
                            >
                              <EditIcon
                                sx={{ fontSize: 15, color: "#9CA3AF" }}
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("common.previous")}
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers(safePage, totalPages).map((p, i) => (
            <button
              key={i}
              onClick={() => typeof p === "number" && setCurrentPage(p)}
              className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors
                ${
                  p === safePage
                    ? "bg-violet-600 text-white cursor-pointer"
                    : p === "..."
                      ? "text-gray-400 cursor-default"
                      : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("common.next")}
        </button>
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
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-bold text-gray-800">
              {editingId ? t("common.edit") : t("teachers.drawer_add")}
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            {t("teachers.drawer_desc")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {errors.api && (
            <p className="text-[12px] text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {errors.api}
            </p>
          )}

          {/* Phone */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.phone")}
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

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.email")}
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
              {t("teachers.form_fio")}
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

          {/* Birth date */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.birth_date")}
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

          {/* Group */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("teachers.col_group")}
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 min-h-11">
              {groups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {groups.map((g, i) => (
                    <span
                      key={g.id ?? i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {g.name}
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
                + {t("common.add")}
              </button>
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.photo")}
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
                    {t("common.upload_size")}
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

          {/* Address */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.address")}
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

          {/* Password */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.password")}
            </label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={(e) => {
                setForm((p) => ({ ...p, password: e.target.value }));
                setErrors((p) => ({ ...p, password: "" }));
              }}
              className={inputCls(errors.password)}
            />
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
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

      {/* Group modal */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setGroupModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  {t("teachers.modal_title")}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {t("teachers.modal_desc")}
                </p>
              </div>
              <button
                onClick={() => setGroupModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder={t("teachers.group_search")}
                value={groupModalSearch}
                onChange={(e) => setGroupModalSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {availableGroups
                .filter((g) =>
                  (g.name ?? "")
                    .toLowerCase()
                    .includes(groupModalSearch.toLowerCase()),
                )
                .map((g) => (
                  <label
                    key={g.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempGroupModal.some((x) => x.id === g.id)}
                      onChange={() =>
                        setTempGroupModal((p) =>
                          p.some((x) => x.id === g.id)
                            ? p.filter((x) => x.id !== g.id)
                            : [...p, g],
                        )
                      }
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-[13px] font-medium text-gray-700">
                      {g.name}
                    </span>
                  </label>
                ))}
              {availableGroups.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-3">
                  {t("teachers.no_groups")}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setGroupModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmGroupModal}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                {t("common.add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
