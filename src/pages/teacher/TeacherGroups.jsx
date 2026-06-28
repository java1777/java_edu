import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import ArchiveIcon from "@mui/icons-material/Archive";
import RefreshIcon from "@mui/icons-material/Refresh";
import { teachersApi } from "../../api/teachers";
import { useLanguage } from "../../contexts/LanguageContext";

const DAY_SHORT = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Chor",
  THURSDAY: "Pay",
  FRIDAY: "Ju",
  SATURDAY: "Shan",
  SUNDAY: "Yak",
};

function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "groups", "result", "items"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}

// Guruh hali boshlanmaganmi (start_date kelajakda) = "yig'ilayotgan"
function isNotStarted(g) {
  const raw = g.start_date ?? g.startDate ?? null;
  if (!raw) return false;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
}

function normalize(g) {
  const teachers = Array.isArray(g.teachers) ? g.teachers : [];
  const daysRaw = Array.isArray(g.week_day)
    ? g.week_day
    : Array.isArray(g.days)
      ? g.days
      : [];
  return {
    id: g.id ?? g.group_id ?? g.group?.id,
    notStarted: isNotStarted(g),
    startDate: g.start_date ?? g.startDate ?? null,
    active:
      typeof g.active === "boolean"
        ? g.active
        : typeof g.is_active === "boolean"
          ? g.is_active
          : true,
    name: g.name ?? g.group?.name ?? "—",
    course: g.course?.name ?? g.group?.course?.name ?? g.course ?? "—",
    duration: g.course?.duration_month
      ? `${g.course.duration_month} oy`
      : (g.duration ?? "—"),
    time: g.start_time ?? g.time ?? "—",
    days: daysRaw.map((d) => DAY_SHORT[d] ?? d).join(", ") || "—",
    room: g.room?.name ?? g.group?.room?.name ?? g.room ?? "—",
    teacher:
      teachers
        .map((t) => t.full_name ?? t.name ?? t)
        .filter(Boolean)
        .join(", ") || "—",
    students:
      g.student_count ??
      (Array.isArray(g.students) ? g.students.length : g.students) ??
      0,
  };
}

export default function TeacherGroups({ collecting = false }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("active"); // active | archive

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await teachersApi.getMyGroups();
        if (alive) setGroups(toArray(res).map(normalize));
      } catch (err) {
        if (alive) setError(err?.message || "Ma'lumotlarni yuklab bo'lmadi");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Yig'ilayotgan = hali boshlanmagan guruhlar (start_date kelajakda)
  // Asosiy sahifa: active tab = boshlangan & faol, archive tab = nofaol
  const list = collecting
    ? groups.filter((g) => g.notStarted)
    : tab === "archive"
      ? groups.filter((g) => !g.active)
      : groups.filter((g) => g.active && !g.notStarted);

  const title = collecting ? t("tp.collecting") : t("nav.groups");

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-gray-800">{title}</h1>
      </div>

      {/* Tabs (faqat asosiy Guruhlar sahifasida) */}
      {!collecting && (
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
              ${tab === "active" ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
          >
            <PeopleIcon sx={{ fontSize: 16 }} /> {t("groups.tab_groups")}
          </button>
          <button
            onClick={() => setTab("archive")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
              ${tab === "archive" ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
          >
            <ArchiveIcon sx={{ fontSize: 16 }} /> {t("groups.tab_archive")}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-[13px] border-b border-red-100">
            {error}
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
              ) : list.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-[13px] text-gray-400"
                  >
                    {collecting
                      ? t("tp.no_collecting")
                      : tab === "archive"
                        ? t("tp.no_archive")
                        : t("groups.no_groups")}
                  </td>
                </tr>
              ) : (
                list.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => g.id != null && navigate(`/teacher/groups/${g.id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Status (read-only ko'rinish) */}
                        <span
                          className={`relative inline-flex h-5 w-9 items-center rounded-full ${g.active ? "bg-violet-500" : "bg-gray-300"}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ${g.active ? "translate-x-4.5" : "translate-x-0.5"}`}
                          />
                        </span>
                        <span
                          className={`text-[11px] font-bold ${g.active ? "text-green-500" : "text-gray-400"}`}
                        >
                          {g.active ? t("common.active") : t("common.inactive")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">
                      {g.name}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[12px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg">
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
                      <p className="text-[11px] text-gray-400 mt-0.5">{g.days}</p>
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
                    <td className="px-4 py-4" />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
