import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { groupsApi } from "../api/groups";
import { roomsApi } from "../api/rooms";
import { coursesApi } from "../api/courses";
import { teachersApi } from "../api/teachers";
import { studentsApi } from "../api/students";
import { useLanguage } from "../contexts/LanguageContext";

const DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

const DAY_TO_API = {
  Dushanba: "MONDAY",
  Seshanba: "TUESDAY",
  Chorshanba: "WEDNESDAY",
  Payshanba: "THURSDAY",
  Juma: "FRIDAY",
  Shanba: "SATURDAY",
  Yakshanba: "SUNDAY",
};

const GROUP_EMPTY = {
  name: "",
  course: "",
  room: "",
  days: [],
  time: "09:00",
  startDate: "",
  tavsif: "",
  maxStudent: "",
  teachers: [],
  students: [],
};

function toUiGroup(g) {
  const teachers = Array.isArray(g.teachers) ? g.teachers : [];
  return {
    id: g.id,
    active: g.active === true,
    name: g.name ?? "—",
    course: g.course?.name ?? g.course ?? "—",
    duration: g.course?.duration_month
      ? `${g.course.duration_month} oy`
      : (g.duration ?? "—"),
    time: g.start_time ?? g.time ?? "—",
    days: Array.isArray(g.week_day) ? g.week_day.join(", ") : (g.days ?? "—"),
    room: g.room?.name ?? g.room ?? "—",
    teacher:
      teachers
        .map((t) => t.full_name ?? t.name ?? t)
        .filter(Boolean)
        .join(", ") || "—",
    teacherIds: teachers.map((t) => t.id).filter(Boolean),
    students:
      g.student_count ??
      (Array.isArray(g.students) ? g.students.length : g.students) ??
      0,
  };
}

export default function Groups() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(0);
  const [groups, setGroups] = useState([]);
  const [archivedGroups, setArchivedGroups] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(GROUP_EMPTY);
  const [errors, setErrors] = useState({});

  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [roomSchedule, setRoomSchedule] = useState([]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await groupsApi.getAll();
      const list = Array.isArray(res) ? res : (res?.data ?? res?.groups ?? []);
      const uiList = list.map(toUiGroup);
      setGroups(uiList);
      // Nofaol guruhlarni avtomatik faollashtirish
      const inactive = uiList.filter((g) => !g.active);
      if (inactive.length > 0) {
        await Promise.all(
          inactive.map((g) =>
            groupsApi.update(g.id, { active: true }).catch(() => {}),
          ),
        );
        setGroups(uiList.map((g) => ({ ...g, active: true })));
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
    roomsApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.rooms ?? []);
        setAvailableRooms(list);
      })
      .catch(() => {});
    coursesApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.courses ?? []);
        setAvailableCourses(list);
      })
      .catch(() => {});
    teachersApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.teachers ?? []);
        setAvailableTeachers(
          list.map((tc) => ({
            id: tc.id,
            name: tc.full_name ?? tc.name ?? "—",
          })),
        );
      })
      .catch(() => {});
    studentsApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.students ?? []);
        setAvailableStudents(
          list.map((s) => ({ id: s.id, name: s.full_name ?? s.name ?? "—" })),
        );
      })
      .catch(() => {});
  }, [loadGroups]);

  // Modals
  const [studentModal, setStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [tempStudents, setTempStudents] = useState([]);
  const [teacherModal, setTeacherModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [tempTeachers, setTempTeachers] = useState([]);

  async function toggleActive(id) {
    const current = groups.find((g) => g.id === id);
    if (!current) return;
    const newActive = !current.active;
    setGroups((p) =>
      p.map((g) => (g.id === id ? { ...g, active: newActive } : g)),
    );
    try {
      await groupsApi.update(id, { active: newActive });
    } catch {
      setGroups((p) =>
        p.map((g) => (g.id === id ? { ...g, active: current.active } : g)),
      );
    }
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
    if (!form.name.trim()) e.name = t("groups.form_name");
    if (!form.course.trim()) e.course = t("groups.form_course");
    if (!form.room.trim()) e.room = t("groups.form_room");
    if (form.days.length === 0) e.days = t("groups.form_days");
    if (!form.startDate) e.startDate = t("groups.form_start_date");
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
        name: form.name.trim(),
        description: form.tavsif.trim(),
        course_id: Number(form.course),
        room_id: Number(form.room),
        week_day: form.days.map((d) => DAY_TO_API[d] ?? d),
        start_time: form.time,
        start_date: form.startDate,
        max_student: Number(form.maxStudent) || 0,
        teachers: form.teachers.map((tc) => tc.id),
        students: form.students.map((s) => s.id),
      };
      await groupsApi.create(body);
      closeDrawer();
      await loadGroups();
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setSaving(false);
    }
  }

  const totalTeachers = availableTeachers.length;
  const totalStudents = groups.reduce(
    (sum, g) => sum + (Number(g.students) || 0),
    0,
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-gray-800">
          {t("groups.title")}
        </h1>
        <button
          onClick={openDrawer}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <span className="text-base leading-none">+</span> {t("groups.add")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
            ${activeTab === 0 ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        >
          <PeopleIcon sx={{ fontSize: 16 }} /> {t("groups.tab_groups")}
        </button>
        <button
          onClick={() => {
            setActiveTab(1);
            if (archivedGroups.length === 0) {
              setArchiveLoading(true);
              groupsApi
                .getArchive()
                .then((res) => {
                  const list = Array.isArray(res)
                    ? res
                    : (res?.data ?? res?.groups ?? []);
                  setArchivedGroups(list.map(toUiGroup));
                })
                .catch(() => setArchivedGroups([]))
                .finally(() => setArchiveLoading(false));
            }
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
            ${activeTab === 1 ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        >
          <CalendarTodayIcon sx={{ fontSize: 14 }} /> {t("groups.tab_archive")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <PeopleIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">
            {t("groups.stat_total")}
          </p>
          <p className="text-3xl font-extrabold text-gray-800">
            {groups.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <PeopleIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">
            {t("groups.stat_teachers")}
          </p>
          <p className="text-3xl font-extrabold text-gray-800">
            {totalTeachers}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <SchoolIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">
            {t("groups.stat_students")}
          </p>
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

      {/* Archive tab */}
      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {archiveLoading ? (
            <p className="text-center text-[13px] text-gray-400 py-10">
              Yuklanmoqda...
            </p>
          ) : archivedGroups.length === 0 ? (
            <p className="text-center text-[13px] text-gray-400 py-10">
              Arxivda guruhlar yo'q
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-187.5">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_name")}
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_course")}
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_duration")}
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_time")}
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_room")}
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_teacher")}
                    </th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-400">
                      {t("groups.col_students")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {archivedGroups.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                    >
                      <td
                        className="px-4 py-4 text-[13px] font-semibold text-gray-800 cursor-pointer"
                        onClick={() => navigate(`/dashboard/groups/${g.id}`)}
                      >
                        {g.name}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-violet-600">
                        {g.course}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-gray-600">
                        {g.duration}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[13px] font-semibold text-gray-800">
                          {g.time}
                        </p>
                        <p className="text-[11px] text-gray-400">{g.days}</p>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-gray-600">
                        {g.room}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-gray-600">
                        {g.teacher}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-bold text-gray-800">
                        {g.students}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await groupsApi.update(g.id, { active: true });
                              setArchivedGroups((p) =>
                                p.filter((x) => x.id !== g.id),
                              );
                            } catch (err) {
                              alert("Xatolik: " + (err.message ?? err));
                            }
                          }}
                          className="text-[12px] font-semibold text-green-600 border border-green-300 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          Qaytarish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {activeTab === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {apiError && (
            <div className="px-5 py-3 bg-red-50 text-red-600 text-[13px] border-b border-red-100">
              {apiError}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-187.5">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_status")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_name")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_course")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_duration")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_time")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_room")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_teacher")}
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                    {t("groups.col_students")}
                  </th>
                  <th className="px-4 py-3">
                    <RefreshIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
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
                ) : groups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-[13px] text-gray-400"
                    >
                      {t("groups.no_groups")}
                    </td>
                  </tr>
                ) : (
                  groups.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => navigate(`/dashboard/groups/${g.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActive(g.id);
                            }}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${g.active ? "bg-violet-500" : "bg-gray-300"}`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${g.active ? "translate-x-4.5" : "translate-x-0.5"}`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${g.active ? "text-green-500" : "text-gray-400"}`}
                          >
                            {g.active
                              ? t("common.active")
                              : t("common.inactive")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">
                        {g.name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[13px] font-semibold text-violet-600">
                          {g.course}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-gray-600">
                        {g.duration}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[13px] font-semibold text-gray-800">
                          {g.time}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {g.days}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-gray-600">
                        {g.room}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-gray-600">
                        {g.teacher}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">
                        {g.students}
                      </td>
                      <td className="px-4 py-4">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <MoreVertIcon
                            sx={{ fontSize: 18, color: "#9CA3AF" }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer backdrop */}
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
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[16px] font-bold text-gray-800">
              {t("groups.drawer_title")}
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">{t("groups.drawer_desc")}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {errors.api && (
            <p className="text-[12px] text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {errors.api}
            </p>
          )}

          {/* Group name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_name")} <span className="text-red-500">*</span>
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

          {/* Course */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_course")} <span className="text-red-500">*</span>
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
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.title}
                </option>
              ))}
            </select>
            {errors.course && (
              <p className="text-[11px] text-red-500 mt-1">{errors.course}</p>
            )}
          </div>

          {/* Room */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_room")} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.room}
              onChange={(e) => {
                const roomId = e.target.value;
                setForm((p) => ({ ...p, room: roomId }));
                setErrors((p) => ({ ...p, room: "" }));
                if (roomId) {
                  const selectedRoom = availableRooms.find(
                    (r) => String(r.id) === roomId,
                  );
                  const busy = groups
                    .filter((g) => {
                      const gRoom = g.room ?? "";
                      return (
                        selectedRoom &&
                        (gRoom === selectedRoom.name ||
                          gRoom.startsWith(selectedRoom.name))
                      );
                    })
                    .map((g) => ({ name: g.name, time: g.time, days: g.days }));
                  setRoomSchedule(busy);
                } else {
                  setRoomSchedule([]);
                }
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors bg-white ${errors.room ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            >
              <option value="">Tanlang</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.room && (
              <p className="text-[11px] text-red-500 mt-1">{errors.room}</p>
            )}
            {roomSchedule.length > 0 && (
              <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                <p className="text-[11px] font-bold text-orange-600 mb-1.5">
                  🔴 Band vaqtlar:
                </p>
                {roomSchedule.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] text-orange-700 py-0.5 border-b border-orange-100 last:border-0"
                  >
                    <span className="font-semibold">{s.name}</span>
                    <span>
                      {s.days} — {s.time}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-orange-500 mt-1.5">
                  ✅ Bo'sh vaqtni tanlang
                </p>
              </div>
            )}
            {form.room && roomSchedule.length === 0 && (
              <p className="text-[11px] text-green-600 mt-1 font-semibold">
                ✅ Bu xona hozircha bo'sh
              </p>
            )}
          </div>

          {/* Days */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              {t("groups.form_days")} <span className="text-red-500">*</span>
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

          {/* Time */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_time")} <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>

          {/* Start date */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_start_date")}{" "}
              <span className="text-red-500">*</span>
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

          {/* Max students */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              O'quvchilar sig'imi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="Masalan: 20"
              value={form.maxStudent}
              onChange={(e) =>
                setForm((p) => ({ ...p, maxStudent: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_description")}
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

          {/* Teachers */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_teachers")}
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 min-h-10">
              {form.teachers.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.teachers.map((tc) => (
                    <span
                      key={tc.id}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {tc.name}
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            teachers: p.teachers.filter((x) => x.id !== tc.id),
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
                + {t("common.add")}
              </button>
            </div>
          </div>

          {/* Students */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t("groups.form_students")}
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 min-h-10">
              {form.students.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.students.map((s) => (
                    <span
                      key={s.id}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {s.name}
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            students: p.students.filter((x) => x.id !== s.id),
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
                + {t("common.add")}
              </button>
            </div>
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
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>

      {/* Student modal */}
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
                  {t("groups.student_modal")}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {t("groups.student_modal_desc")}
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
                placeholder={t("groups.student_search")}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {availableStudents.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-3">
                  {t("groups.no_students")}
                </p>
              )}
              {availableStudents
                .filter((s) =>
                  s.name.toLowerCase().includes(studentSearch.toLowerCase()),
                )
                .map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempStudents.some((x) => x.id === s.id)}
                      onChange={() =>
                        setTempStudents((p) =>
                          p.some((x) => x.id === s.id)
                            ? p.filter((x) => x.id !== s.id)
                            : [...p, s],
                        )
                      }
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-[13px] text-gray-700">{s.name}</span>
                  </label>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setStudentModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, students: tempStudents }));
                  setStudentModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher modal */}
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
                  {t("groups.teacher_modal")}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {t("groups.teacher_modal_desc")}
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
                placeholder={t("groups.teacher_search")}
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {availableTeachers.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-3">
                  {t("groups.no_teachers")}
                </p>
              )}
              {availableTeachers
                .filter((tc) =>
                  tc.name.toLowerCase().includes(teacherSearch.toLowerCase()),
                )
                .map((tc) => (
                  <label
                    key={tc.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempTeachers.some((x) => x.id === tc.id)}
                      onChange={() =>
                        setTempTeachers((p) =>
                          p.some((x) => x.id === tc.id)
                            ? p.filter((x) => x.id !== tc.id)
                            : [...p, tc],
                        )
                      }
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-[13px] text-gray-700">{tc.name}</span>
                  </label>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setTeacherModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, teachers: tempTeachers }));
                  setTeacherModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
