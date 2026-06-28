import { useState, useEffect, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { groupsApi } from "../api/groups";
import { studentsApi } from "../api/students";
import { useLanguage } from "../contexts/LanguageContext";

const AVATAR_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#DB2777",
  "#0891B2",
];

const GENDER_MAP = { Erkak: "male", Ayol: "female" };
const GENDER_UNMAP = { male: "Erkak", female: "Ayol" };

function toUiStudent(s) {
  const groups = Array.isArray(s.groups) ? s.groups : [];
  return {
    id: s.id,
    name: s.full_name ?? s.name ?? "—",
    phone: s.phone ?? "—",
    email: s.email ?? "—",
    gender: GENDER_UNMAP[s.gender] ?? s.gender ?? "",
    address: s.address ?? "—",
    groups: groups.map((g) =>
      typeof g === "object"
        ? { id: g.id, name: g.name ?? "" }
        : { id: null, name: g },
    ),
    birth:
      (s.birth_date ?? s.birthday)
        ? new Date(s.birth_date ?? s.birthday).toLocaleDateString("ru-RU")
        : "—",
    created: s.created_at
      ? new Date(s.created_at).toLocaleDateString("ru-RU")
      : "—",
    birthRaw: s.birth_date ?? s.birthday ?? "",
  };
}

const STUDENT_EMPTY = {
  phone: "+998",
  email: "",
  fio: "",
  birthDate: "",
  address: "",
  password: "",
  gender: "",
};

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

export default function Students() {
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showArchive, setShowArchive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(STUDENT_EMPTY);
  const [groups, setGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [groupModal, setGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [tempGroups, setTempGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);

  // ── Load all students (client-side pagination) ──────────────────────────
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setApiError("");
    setShowArchive(false);
    setCurrentPage(1);
    try {
      const res = await studentsApi.getAll(1, 1000);
      let list;
      if (Array.isArray(res)) {
        list = res;
      } else {
        list = Array.isArray(res?.data) ? res.data : (res?.students ?? []);
      }
      setStudents(list.map(toUiStudent));
      setTotal(list.length);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArchive = useCallback(async () => {
    setLoading(true);
    setApiError("");
    setShowArchive(true);
    setCurrentPage(1);
    try {
      const res = await studentsApi.getArchive();
      const list = Array.isArray(res)
        ? res
        : (res?.data ?? res?.students ?? []);
      setStudents(list.map(toUiStudent));
      setTotal(list.length);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    groupsApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.groups ?? []);
        setAvailableGroups(list);
      })
      .catch(() => {});
  }, [loadStudents]);

  // ── Table selection ─────────────────────────────────────────────────────
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const allChecked = filtered.length > 0 && selected.length === filtered.length;
  function toggleAll() {
    setSelected(allChecked ? [] : filtered.map((s) => s.id));
  }
  function toggleOne(id) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  async function handleDelete(id) {
    if (!window.confirm(t("common.confirm_delete"))) return;
    try {
      await studentsApi.remove(id);
      setStudents((p) => p.filter((s) => s.id !== id));
      setSelected((p) => p.filter((x) => x !== id));
      setTotal((v) => v - 1);
    } catch (err) {
      alert(err.message);
    }
  }

  // ── Drawer: create ──────────────────────────────────────────────────────
  function openDrawer() {
    setEditId(null);
    setForm(STUDENT_EMPTY);
    setGroups([]);
    setGroupInput("");
    setPhotoPreview(null);
    setErrors({});
    setDrawerOpen(true);
  }

  // ── Drawer: edit ────────────────────────────────────────────────────────
  function openEditDrawer(s) {
    setEditId(s.id);
    setForm({
      phone: s.phone === "—" ? "" : s.phone,
      email: s.email === "—" ? "" : s.email,
      fio: s.name === "—" ? "" : s.name,
      birthDate: s.birthRaw ?? "",
      address: s.address === "—" ? "" : s.address,
      password: "",
      gender: s.gender ?? "",
    });
    setGroups(s.groups.filter((g) => g.id));
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
      setGroups((p) => [...p, { id: null, name: groupInput.trim() }]);
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

  function validate(isEdit) {
    const e = {};
    if (!form.phone.trim() || form.phone === "+998")
      e.phone = t("common.phone");
    if (!form.fio.trim()) e.fio = t("students.form_fio");
    if (!form.address.trim()) e.address = t("common.address");
    if (!isEdit && !form.password.trim()) e.password = t("common.password");
    return e;
  }

  async function handleSave() {
    const isEdit = editId !== null;
    const e = validate(isEdit);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      const apiBody = {
        phone: form.phone,
        email: form.email,
        full_name: form.fio,
        birth_date: form.birthDate,
        address: form.address,
        gender: GENDER_MAP[form.gender] ?? form.gender,
        groups: groups.filter((g) => g.id).map((g) => g.id),
      };
      if (form.password) apiBody.password = form.password;

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

      if (isEdit) {
        await studentsApi.update(editId, body);
      } else {
        await studentsApi.create(body);
      }
      closeDrawer();
      await loadStudents();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSaving(false);
    }
  }

  const inp = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${err ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  function handleSearch(val) {
    setSearch(val);
    setCurrentPage(1);
  }
  function goPage(page) {
    setCurrentPage(page);
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            {showArchive ? t("students.archive_title") : t("students.title")}
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            {t("students.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showArchive ? (
            <button
              onClick={loadStudents}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t("common.back")}
            </button>
          ) : (
            <button
              onClick={openDrawer}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <span className="text-base leading-none">+</span>{" "}
              {t("students.add")}
            </button>
          )}
        </div>
      </div>

      {/* White card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {apiError && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-[13px] border-b border-red-100">
            {apiError}
          </div>
        )}

        {/* Search + filter bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
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
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <FilterListIcon sx={{ fontSize: 16 }} /> {t("common.filters")}
            </button>
            <button
              onClick={showArchive ? loadStudents : loadArchive}
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
                    {t("students.col_name")}{" "}
                    <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                  </span>
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_group")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_phone")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_email")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_birth")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_address")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_created")}
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  {t("students.col_actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-[13px] text-gray-400"
                  >
                    {t("common.loading")}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-[13px] text-gray-400"
                  >
                    {t("students.empty")}
                  </td>
                </tr>
              ) : (
                paginated.map((s, idx) => {
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
                            {s.name[0]?.toUpperCase() ?? "?"}
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
                              {g.name}
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
                          {!showArchive && (
                            <>
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                              >
                                <DeleteIcon
                                  sx={{ fontSize: 16, color: "#9CA3AF" }}
                                />
                              </button>
                              <button
                                onClick={() => openEditDrawer(s)}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
          <button
            onClick={() => goPage(safePage - 1)}
            disabled={safePage <= 1}
            className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("common.previous")}
          </button>
          <div className="flex items-center gap-1">
            {getPageNumbers(safePage, totalPages).map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === "number" && goPage(p)}
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400">
              {total > 0
                ? `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, total)} / ${total}`
                : ""}
            </span>
            <button
              onClick={() => goPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
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
              {editId ? t("students.drawer_edit") : t("students.drawer_add")}
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            {editId
              ? t("students.drawer_edit_desc")
              : t("students.drawer_add_desc")}
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
              className={inp(errors.phone)}
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
              {t("students.form_fio")}
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

          {/* Birth date */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.birth_date")}
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

          {/* Address */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.address")}
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

          {/* Password */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("common.password")}{" "}
              {editId && (
                <span className="text-gray-400 font-normal">
                  {t("common.optional")}
                </span>
              )}
            </label>
            <input
              type="password"
              placeholder={
                editId
                  ? "O'zgartirmasangiz bo'sh qoldiring"
                  : "Parolni kiriting"
              }
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

          {/* Group */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.col_name")}
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-10 focus-within:border-violet-400 transition-colors">
              {groups.map((g, i) => (
                <span
                  key={g.id ?? i}
                  className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[12px] px-2 py-0.5 rounded-lg"
                >
                  {g.name}
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
              {t("students.add_group")}
            </button>
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
                  <CloudUploadIcon sx={{ fontSize: 28, color: "#6B7280" }} />
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
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl transition-colors cursor-pointer"
          >
            {saving
              ? t("common.saving")
              : editId
                ? t("common.save")
                : t("common.add")}
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
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  {t("students.group_modal")}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {t("students.group_modal_desc")}
                </p>
              </div>
              <button
                onClick={() => setGroupModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-violet-400 transition-colors">
                <SearchIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder={t("students.group_search")}
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
                />
              </div>
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {availableGroups.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-3">
                  {t("students.no_groups")}
                </p>
              )}
              {availableGroups
                .filter((g) =>
                  (g.name ?? "")
                    .toLowerCase()
                    .includes(groupSearch.toLowerCase()),
                )
                .map((g) => (
                  <label
                    key={g.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempGroups.some((x) => x.id === g.id)}
                      onChange={() =>
                        setTempGroups((p) =>
                          p.some((x) => x.id === g.id)
                            ? p.filter((x) => x.id !== g.id)
                            : [...p, { id: g.id, name: g.name }],
                        )
                      }
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-[13px] font-medium text-gray-700">
                      {g.name}
                    </span>
                  </label>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setGroupModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  setGroups(tempGroups);
                  setGroupModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
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
