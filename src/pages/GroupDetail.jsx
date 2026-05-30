import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { groupsApi } from "../api/groups";
import { useLanguage } from "../contexts/LanguageContext";

function getTeacherPhoto(tc) {
  return tc?.image ?? tc?.photo ?? tc?.avatar ?? tc?.profile_image ?? null;
}

const DAY_ABBR = {
  monday: "Du", tuesday: "Se", wednesday: "Ch",
  thursday: "Pa", friday: "Ju", saturday: "Sh", sunday: "Ya",
};

const MONTH_MAP = {
  January: 0, February: 1, March: 2, April: 3,
  May: 4, June: 5, July: 6, August: 7,
  September: 8, October: 9, November: 10, December: 11,
};

const MONTH_NAMES_UZ = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
  "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek",
];

const MONTH_NAMES_FULL = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTH_NAMES_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}

// Kalendar - schedules API dan kelgan { day, month, isCompleted } formatini ishlatadi
function LessonCalendar({ lessonDays, groupId }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const today = new Date();

  // Barcha oylarni topamiz
  const months = [...new Set(lessonDays.map((d) => d.month))];
  const [activeMonth, setActiveMonth] = useState(months[0] ?? null);
  const [studyMonth, setStudyMonth] = useState(1);

  const filtered = lessonDays.filter((d) => d.month === activeMonth);
  const monthIdx = MONTH_MAP[activeMonth] ?? 0;

  function prev() {
    const idx = months.indexOf(activeMonth);
    if (idx > 0) {
      setActiveMonth(months[idx - 1]);
      setStudyMonth((m) => Math.max(1, m - 1));
    }
  }
  function next() {
    const idx = months.indexOf(activeMonth);
    if (idx < months.length - 1) {
      setActiveMonth(months[idx + 1]);
      setStudyMonth((m) => m + 1);
    }
  }

  if (!lessonDays.length) {
    return <p className="text-[13px] text-gray-400">{t("gd.no_lessons")}</p>;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={prev}
          disabled={months.indexOf(activeMonth) === 0}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 disabled:opacity-40"
        >
          <ChevronLeftIcon sx={{ fontSize: 16, color: "#6B7280" }} />
        </button>
        <span className="text-[13px] font-semibold text-gray-700">
          {studyMonth}{t("gd.study_month")}
        </span>
        <button
          onClick={next}
          disabled={months.indexOf(activeMonth) === months.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 disabled:opacity-40"
        >
          <ChevronRightIcon sx={{ fontSize: 16, color: "#6B7280" }} />
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[13px] text-gray-400">{t("gd.no_lessons")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((entry, i) => {
            const entryDate = new Date(today.getFullYear(), monthIdx, entry.day);
            const isPast = entryDate < today || entry.isCompleted;
            const yyyy = today.getFullYear();
            const mm = String(monthIdx + 1).padStart(2, "0");
            const dd = String(entry.day).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;

            return (
              <div
                key={i}
                onClick={() => navigate(`/dashboard/groups/${groupId}/lesson/${dateStr}`)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-colors cursor-pointer
                  ${isPast ? "border-gray-200 bg-gray-50 hover:border-violet-300" : "border-gray-300 bg-white shadow-sm hover:border-violet-400 hover:shadow-md"}`}
              >
                <span className={`text-[10px] font-medium ${isPast ? "text-gray-300" : "text-gray-400"}`}>
                  {MONTH_NAMES_FULL[monthIdx]?.slice(0, 3)}
                </span>
                <span className={`text-[15px] font-bold ${isPast ? "text-gray-300" : "text-gray-800"}`}>
                  {entry.day}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center mt-5">
        <button className="border border-gray-200 rounded-xl px-8 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          {t("gd.show_all")}
        </button>
      </div>
    </div>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(0);
  const [group, setGroup] = useState(null);
  const [groupOne, setGroupOne] = useState(null); // /groups/one/{id} dan keladi
  const [teachers, setTeachers] = useState([]);
  const [lessonDays, setLessonDays] = useState([]); // kalendar uchun
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const DETAIL_TABS = [
    t("gd.tab_info"),
    t("gd.tab_lessons"),
    t("gd.tab_attendance"),
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      groupsApi.getById(id).catch(() => null),
      groupsApi.getOne(id).catch(() => null),
      groupsApi.getSchedules(id).catch(() => null),
    ])
      .then(([byId, one, schedRaw]) => {
        // /groups/{id} → teachers, averageAge, room_capacity, course, student_count
        const g = byId?.data ?? byId;
        setGroup(g);
        setTeachers(Array.isArray(g?.teachers) ? g.teachers : []);

        // /groups/one/{id} → start_time, end_time, week_day, room, start_date, end_date
        const g1 = one?.data ?? one;
        setGroupOne(g1);

        // /groups/{id}/schedules → { 1: {isActive, days}, 2: {...}, ... }
        const schedList = Array.isArray(schedRaw)
          ? schedRaw
          : Array.isArray(schedRaw?.data)
            ? schedRaw.data
            : [];

        if (schedList.length > 0) {
          const sched = schedList[0];
          // isActive: true bo'lgan entrydan yoki birinchisidan kunlarni olamiz
          const entries = Object.values(sched);
          const activeEntry = entries.find((e) => e?.isActive) ?? entries[0];
          const days = Array.isArray(activeEntry?.days) ? activeEntry.days : [];
          setLessonDays(days);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        {t("common.loading")}
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg font-semibold">{t("gd.not_found")}</p>
        <button
          onClick={() => navigate("/dashboard/groups")}
          className="mt-3 text-violet-600 text-sm hover:underline cursor-pointer"
        >
          {t("gd.back_list")}
        </button>
      </div>
    );
  }

  // --- Params ---
  const course = typeof group.course === "object" && group.course ? group.course : {};
  const courseName =
    (typeof group.course === "string" ? group.course : null) ??
    course.name ?? groupOne?.course?.name ?? "—";
  const avgAge = group.averageAge ?? group.avg_age ?? "—";
  const capacity = group.room_capacity ?? groupOne?.room?.capacity ?? "—";
  const studentCount = group.student_count ?? "—";
  const lessonsPerMonth = group.lessons_per_month ?? groupOne?.lessons_per_month ?? "—";
  const courseDuration = course.duration_month ?? groupOne?.course?.duration_month ?? "—";
  const totalLessons = group.total_lessons ?? groupOne?.total_lessons ?? "—";

  const params = [
    [t("gd.param_course"), courseName],
    [t("gd.param_avg_age"), avgAge],
    [t("gd.param_capacity"), capacity],
    [t("gd.param_students"), studentCount],
    [t("gd.param_lessons_month"), lessonsPerMonth],
    [t("gd.param_duration"), courseDuration],
    [t("gd.param_total_lessons"), totalLessons],
  ];

  // --- Schedule table ---
  // groupOne dan: week_day, start_time, end_time, room, start_date, end_date
  const weekDays = (Array.isArray(groupOne?.week_day) ? groupOne.week_day : [])
    .map((d) => DAY_ABBR[d?.toLowerCase()] ?? d)
    .join("/");
  const timeRange =
    groupOne?.start_time && groupOne?.end_time
      ? `${groupOne.start_time} dan - ${groupOne.end_time} gacha`
      : groupOne?.start_time ?? "—";
  const dateRange =
    groupOne?.start_date
      ? `${formatDate(groupOne.start_date)} - ${formatDate(groupOne.end_date)}`
      : "—";
  const roomDisplay = (() => {
    const rName =
      typeof groupOne?.room === "string"
        ? groupOne.room
        : groupOne?.room?.name ?? "—";
    const rCap = groupOne?.room?.capacity ?? group.room_capacity ?? "";
    return rCap ? `${rName} // ${rCap}` : rName;
  })();

  const visibleTeachers = showAll ? teachers : teachers.slice(0, 2);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/groups")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
          </button>
          <h1 className="text-xl font-extrabold text-gray-800">
            {group.name ?? groupOne?.name ?? "—"}
          </h1>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
              group.active ?? groupOne?.active
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {(group.active ?? groupOne?.active)
              ? t("common.active_label")
              : t("common.inactive_label")}
          </span>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          <BarChartIcon sx={{ fontSize: 18 }} /> {t("gd.statistics")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {DETAIL_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2
              ${activeTab === i ? "text-violet-600 border-violet-600" : "text-gray-400 hover:text-gray-700 border-transparent"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {activeTab === 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Mentors */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-500">
                <span className="text-white font-semibold text-[14px]">
                  {t("gd.mentors")}
                </span>
                <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-400 cursor-pointer">
                  <CloseIcon sx={{ fontSize: 16, color: "#fff" }} />
                </button>
              </div>
              <div className="p-6 flex flex-wrap gap-6 justify-center">
                {teachers.length > 0 ? (
                  teachers.map((tc, i) => {
                    const photoUrl = getTeacherPhoto(tc);
                    const name = tc.full_name ?? tc.name ?? "—";
                    const role = tc.role ?? tc.position ?? "Teacher";
                    return (
                      <div key={tc.id ?? i} className="flex flex-col items-center gap-2">
                        {photoUrl ? (
                          <img src={photoUrl} alt={name} className="w-16 h-16 rounded-full object-cover shadow" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-400 to-blue-400 flex items-center justify-center shadow">
                            <span className="text-white text-xl font-bold">{name[0]}</span>
                          </div>
                        )}
                        <span className="text-violet-600 text-[12px] font-medium">{role}</span>
                        <span className="font-bold text-gray-800 text-[13px]">{name}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[13px] text-gray-400">{t("gd.no_teacher")}</p>
                )}
              </div>
            </div>

            {/* Params */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-500">
                <span className="text-white font-semibold text-[14px]">
                  {t("gd.params")}
                </span>
                <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-400 cursor-pointer">
                  <CloseIcon sx={{ fontSize: 16, color: "#fff" }} />
                </button>
              </div>
              <div className="px-5 py-4 flex flex-col divide-y divide-gray-50">
                {params.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-[13px] text-gray-500">{label}</span>
                    <span className="text-[13px] font-bold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-[15px] font-bold text-gray-800 mb-2">
              {t("gd.schedule")}
            </h2>

            {teachers.length === 0 ? (
              <p className="text-[13px] text-gray-400 text-center py-6">
                {t("gd.no_schedule")}
              </p>
            ) : (
              <>
                <div className="flex flex-col">
                  {visibleTeachers.map((tc, i) => {
                    const rawName = tc.full_name ?? tc.name ?? "—";
                    const isSupport = rawName.startsWith("+++");
                    const displayName = isSupport ? rawName.slice(3) : rawName;

                    return (
                      <div
                        key={tc.id ?? i}
                        className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 gap-4 text-[13px] flex-wrap"
                      >
                        <div className="flex items-center gap-2 min-w-32">
                          <button className="text-blue-500 font-semibold hover:underline cursor-pointer">
                            {displayName}
                          </button>
                          {isSupport && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-600">
                              Support
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500">{weekDays || "—"}</span>
                        <span className="text-gray-600">{timeRange}</span>
                        <span className="text-gray-500">{dateRange}</span>
                        <span className="text-gray-500 text-right">{roomDisplay}</span>
                      </div>
                    );
                  })}
                </div>

                {teachers.length > 2 && !showAll && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setShowAll(true)}
                      className="border border-gray-200 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {t("gd.show_more")} ({teachers.length - 2})
                    </button>
                  </div>
                )}

                <LessonCalendar lessonDays={lessonDays} groupId={id} />
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-400">
          {t("gd.no_lessons_tab")}
        </div>
      )}

      {activeTab === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-400">
          {t("gd.no_attendance")}
        </div>
      )}
    </>
  );
}
