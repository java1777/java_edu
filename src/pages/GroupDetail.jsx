import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { groupsApi } from "../api/groups";
import { lessonsApi } from "../api/lessons";
import { getToken } from "../hooks/useAuth";
import { attendanceApi } from "../api/attendance";
import { homeworkApi } from "../api/homework";
import { filesApi } from "../api/files";
import { examsApi } from "../api/exams";
import { useLanguage } from "../contexts/LanguageContext";
import { usePanelBase } from "../hooks/usePanelBase";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

function fixPhotoUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SERVER_ORIGIN}${url}`;
  return `${SERVER_ORIGIN}/files/${url}`;
}

function getTeacherPhoto(tc) {
  const raw = tc?.image ?? tc?.photo ?? tc?.avatar ?? tc?.profile_image ?? null;
  return fixPhotoUrl(raw);
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

function formatDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTH_NAMES_UZ[d.getMonth()]}, ${d.getFullYear()} ${hh}:${mm}`;
}

// Lesson uchun to'g'ri yilni hisoblash
function getLessonYear(monthIdx, todayMonth, todayYear) {
  // Agar lesson oyi joriy oydan 6+ oy oldin bo'lsa → keyingi yil
  if (monthIdx < todayMonth - 5) return todayYear + 1;
  // Agar lesson oyi joriy oydan 6+ oy keyin bo'lsa → o'tgan yil
  if (monthIdx > todayMonth + 5) return todayYear - 1;
  return todayYear;
}

function LessonCalendar({ lessonDays, groupId, onDaySelect }) {
  const { t } = useLanguage();

  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Har bir lesson uchun to'liq sana ob'ekti
  const daysWithDate = lessonDays.map((d) => {
    const mIdx = MONTH_MAP[d.month] ?? 0;
    const year = getLessonYear(mIdx, today.getMonth(), today.getFullYear());
    const date = new Date(year, mIdx, d.day);
    const mm = String(mIdx + 1).padStart(2, "0");
    const dd = String(d.day).padStart(2, "0");
    return { ...d, mIdx, year, date, dateStr: `${year}-${mm}-${dd}` };
  });

  // Yashil = !isCompleted VA sana >= bugun (birinchi kelgusi/bugungi dars)
  const nextLesson = daysWithDate.find((d) => !d.isCompleted && d.date >= todayZero);
  const nextLessonStr = nextLesson?.dateStr ?? null;

  const months = [...new Set(lessonDays.map((d) => d.month))];
  const [activeMonth, setActiveMonth] = useState(months[0] ?? null);
  const [studyMonth, setStudyMonth] = useState(1);
  const [alert, setAlert] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const filtered = daysWithDate.filter((d) => d.month === activeMonth);
  const monthIdx = MONTH_MAP[activeMonth] ?? 0;

  function prev() {
    const idx = months.indexOf(activeMonth);
    if (idx > 0) { setActiveMonth(months[idx - 1]); setStudyMonth((m) => Math.max(1, m - 1)); }
  }
  function next() {
    const idx = months.indexOf(activeMonth);
    if (idx < months.length - 1) { setActiveMonth(months[idx + 1]); setStudyMonth((m) => m + 1); }
  }

  function DayCard({ entry, mIdxOverride }) {
    const mI = mIdxOverride ?? monthIdx;
    const { dateStr, date: entryDate, isCompleted } = entry;
    const isHighlighted = dateStr === nextLessonStr;
    const isPast = isCompleted || entryDate < todayZero;
    // Faqat bugun yoki o'tgan kunlarga kirish mumkin
    const canNavigate = entryDate <= todayZero;
    return (
      <div
        onClick={() => {
          if (!canNavigate) { setAlert(true); setTimeout(() => setAlert(false), 3000); }
          else onDaySelect(dateStr);
        }}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-colors cursor-pointer
          ${isHighlighted ? "border-green-500 bg-green-500 shadow-md"
            : isPast ? "border-gray-300 bg-gray-200 hover:border-gray-400"
            : "border-gray-300 bg-white shadow-sm hover:border-violet-400 hover:shadow-md"}`}
      >
        <span className={`text-[10px] font-medium ${isHighlighted ? "text-white" : isPast ? "text-gray-500" : "text-gray-400"}`}>
          {MONTH_NAMES_FULL[mI]?.slice(0, 3)}
        </span>
        <span className={`text-[15px] font-bold ${isHighlighted ? "text-white" : isPast ? "text-gray-600" : "text-gray-800"}`}>
          {entry.day}
        </span>
      </div>
    );
  }

  if (!lessonDays.length) {
    return <p className="text-[13px] text-gray-400">{t("gd.no_lessons")}</p>;
  }

  return (
    <div className="mt-6">
      {/* Alert */}
      {alert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-orange-500 text-white text-[13px] font-semibold px-5 py-3 rounded-2xl shadow-lg">
          <span>⚠</span>
          <span>Hali dars boshlanish vaqti kelmagan!</span>
          <button onClick={() => setAlert(false)} className="ml-2 text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Bitta oy ko'rinishi */}
      {!showAllMonths && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={prev} disabled={months.indexOf(activeMonth) === 0}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 disabled:opacity-40">
              <ChevronLeftIcon sx={{ fontSize: 16, color: "#6B7280" }} />
            </button>
            <span className="text-[13px] font-semibold text-gray-700">{studyMonth}{t("gd.study_month")}</span>
            <button onClick={next} disabled={months.indexOf(activeMonth) === months.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 disabled:opacity-40">
              <ChevronRightIcon sx={{ fontSize: 16, color: "#6B7280" }} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtered.map((entry, i) => <DayCard key={i} entry={entry} />)}
          </div>
        </>
      )}

      {/* Barcha oylar ko'rinishi */}
      {showAllMonths && (
        <div className="flex flex-col gap-6">
          {months.map((month, mNum) => {
            const mI = MONTH_MAP[month] ?? 0;
            const monthDays = daysWithDate.filter((d) => d.month === month);
            const isCurrentMonth = mI === today.getMonth();
            return (
              <div key={month}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] font-bold text-gray-700">
                    {mNum + 1}{t("gd.study_month")}
                  </span>
                  {isCurrentMonth && (
                    <span className="text-[11px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Joriy oy
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {monthDays.map((entry, i) => <DayCard key={i} entry={entry} mIdxOverride={mI} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center mt-5">
        <button
          onClick={() => setShowAllMonths((p) => !p)}
          className="border border-gray-200 rounded-xl px-8 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {showAllMonths ? "Yopish" : t("gd.show_all")}
        </button>
      </div>
    </div>
  );
}

// ─── Mock exam data (API qo'shilgunga qadar) ─────────────────────────────────
const MOCK_EXAMS = [
  { id: 4, title: "Examination", student_count: 16, failed_count: 0, isActive: false, lesson_date: "2026-02-26T09:30:00Z", created_at: "2026-02-26T09:28:00Z", announced_at: "2026-03-02T13:32:00Z" },
  { id: 5, title: "Examination", student_count: 14, failed_count: 0, isActive: false, lesson_date: "2026-03-26T09:30:00Z", created_at: "2026-03-26T09:23:00Z", announced_at: "2026-03-30T14:34:00Z" },
  { id: 6, title: "Examination", student_count: 12, failed_count: 0, isActive: false, lesson_date: "2026-04-24T09:30:00Z", created_at: "2026-04-24T09:25:00Z", announced_at: "2026-04-27T10:30:00Z" },
  { id: 7, title: "Examination", student_count: 12, failed_count: 0, isActive: true,  lesson_date: "2026-05-22T09:30:00Z", created_at: "2026-05-22T09:28:00Z", announced_at: null },
];

// ─── Inline Lesson Component ─────────────────────────────────────────────────
function LessonInline({ groupId, date, onClose }) {
  const { t } = useLanguage();
  const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

  const [lessonType, setLessonType] = useState("plan");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [topicError, setTopicError] = useState("");
  const [saveError, setSaveError] = useState("");

  const displayDate = (() => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
  })();

  useEffect(() => {
    setLoading(true);
    setSaved(false); setTopic(""); setDescription(""); setTopicError(""); setSaveError("");
    Promise.all([
      groupsApi.getStudents(groupId).catch(() => null),
      lessonsApi.getByGroup(groupId).catch(() => null),
    ]).then(([studRes, lessonsRes]) => {
      const studentList = Array.isArray(studRes) ? studRes : (studRes?.data ?? studRes?.students ?? []);
      setStudents(studentList);
      const lessonList = Array.isArray(lessonsRes) ? lessonsRes : (lessonsRes?.data ?? lessonsRes?.lessons ?? []);
      const todayLesson = lessonList.find((l) => l.date === date || l.date?.startsWith(date) || l.created_at?.startsWith(date));
      const attMap = {};
      studentList.forEach((s) => { attMap[s.id] = false; });

      if (todayLesson) {
        setSaved(true);
        setTopic(todayLesson.topic ?? todayLesson.title ?? "");
        setDescription(todayLesson.description ?? "");

        const attList = Array.isArray(todayLesson.attendance) && todayLesson.attendance.length > 0
          ? todayLesson.attendance : null;

        if (attList) {
          attList.forEach((a) => { if (a.student_id != null) attMap[a.student_id] = a.is_attended ?? a.isPresent ?? false; });
          setAttendance(attMap);
        } else {
          // Backend lesson.attendance bo'sh bo'lsa — API dan yuklash
          attendanceApi.getAll()
            .then((attRes) => {
              const raw = Array.isArray(attRes) ? attRes
                : Array.isArray(attRes?.data) ? attRes.data
                : Array.isArray(attRes?.data?.attendances) ? attRes.data.attendances
                : Array.isArray(attRes?.attendances) ? attRes.attendances
                : [];
              raw.filter((a) => Number(a.group_id) === Number(groupId) || a.Group?.id === Number(groupId))
                .forEach((a) => {
                  const sid = Number(a.student_id ?? a.Student?.id);
                  if (sid) attMap[sid] = a.isPresent ?? a.is_attended ?? false;
                });
              setAttendance({ ...attMap });
            })
            .catch(() => setAttendance(attMap));
        }
      } else {
        setAttendance(attMap);
      }
    }).finally(() => setLoading(false));
  }, [groupId, date]);

  async function handleSave() {
    if (!topic.trim()) { setTopicError(t("gd.topic_required")); return; }
    setTopicError(""); setSaveError(""); setSaving(true);
    try {
      await lessonsApi.create({ group_id: Number(groupId), topic: topic.trim(), description: description.trim(), date });
      await Promise.all(Object.entries(attendance).map(([sid, came]) =>
        attendanceApi.create({ group_id: Number(groupId), student_id: Number(sid), isPresent: came })
      ));
      setSaved(true);
      if (typeof window !== "undefined") localStorage.setItem(`lesson_${groupId}_${date}`, "1");
    } catch (err) {
      setSaveError(err.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-violet-50 border-b border-violet-100">
        <span className="text-[14px] font-bold text-violet-700">Dars — {displayDate}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer text-[18px] leading-none font-bold">×</button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[13px] text-gray-400">Yuklanmoqda...</div>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-4">
          {saveError && (
            <div className="bg-red-50 text-red-600 text-[12px] px-3 py-2 rounded-xl flex items-center justify-between">
              <span>⚠ {saveError}</span>
              <button onClick={() => setSaveError("")} className="font-bold cursor-pointer">×</button>
            </div>
          )}

          {/* Lesson type */}
          <div className="flex items-center gap-5">
            {["plan","other"].map((v) => (
              <label key={v} className={`flex items-center gap-2 ${saved ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                <input type="radio" name={`lt-${date}`} value={v} checked={lessonType === v}
                  onChange={() => !saved && setLessonType(v)} disabled={saved}
                  className="accent-violet-600 w-4 h-4" />
                <span className={`text-[13px] ${v === "other" && lessonType === "other" ? "text-green-500 font-semibold" : "text-gray-600"}`}>
                  {v === "plan" ? "O'quv reja bo'yicha" : "Boshqa"}
                </span>
              </label>
            ))}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-[12px] font-semibold text-red-500 mb-1">* {t("gd.col_topic")}</label>
            <input type="text" value={topic}
              onChange={(e) => { if (!saved) { setTopic(e.target.value); setTopicError(""); } }}
              readOnly={saved} placeholder={t("gd.col_topic")}
              className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none transition-colors
                ${saved ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : topicError ? "border-red-400 bg-white" : "border-gray-200 focus:border-violet-400 bg-white"}`} />
            {topicError && <p className="text-[11px] text-red-500 mt-0.5">{topicError}</p>}
          </div>

          {/* Description */}
          <textarea value={description} onChange={(e) => { if (!saved) setDescription(e.target.value); }}
            readOnly={saved} placeholder="Tavsif (ixtiyoriy)" rows={2}
            className={`w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none transition-colors
              ${saved ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed" : "border-gray-200 focus:border-violet-400 bg-white"}`} />

          {/* Students */}
          {students.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto] px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400">O'quvchi ismi</span>
                <span className="text-[11px] font-semibold text-gray-400">Keldi</span>
              </div>
              {students.map((s, idx) => {
                const name = s.full_name ?? s.name ?? "—";
                const came = attendance[s.id] ?? false;
                return (
                  <div key={s.id} className="grid grid-cols-[1fr_auto] items-center px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-violet-600 text-[11px] font-bold">{name[0]}</span>
                      </div>
                      <span className="text-[13px] text-gray-800">{name}</span>
                    </div>
                    <button onClick={() => !saved && setAttendance((p) => ({ ...p, [s.id]: !p[s.id] }))}
                      disabled={saved} className={saved ? "cursor-not-allowed opacity-70" : "cursor-pointer"}>
                      {came
                        ? <div className="w-6 h-6 rounded-full bg-green-500 shadow-sm" />
                        : <div className="w-10 h-5 rounded-full bg-gray-200 relative"><span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow" /></div>
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving || saved}
              className={`text-[13px] font-semibold px-5 py-2 rounded-xl transition-colors
                ${saved ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"}`}>
              {saving ? "Saqlanmoqda..." : saved ? "Dars allaqachon saqlangan" : "Saqlash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const base = usePanelBase();

  const [activeTab, setActiveTab] = useState(() => {
    const tab = Number(searchParams.get("tab"));
    return [0, 1, 2].includes(tab) ? tab : 0;
  });

  function handleTabChange(idx) {
    setActiveTab(idx);
    setSearchParams({ tab: idx });
  }
  const [group, setGroup] = useState(null);
  const [groupOne, setGroupOne] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [lessonDays, setLessonDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // URL: ?lesson=2026-06-03 — back tugmasi bosilganda avtomatik yopiladi
  const selectedDate = searchParams.get("lesson") ?? null;

  function openLesson(date) {
    const p = new URLSearchParams(searchParams);
    p.set("lesson", date);
    setSearchParams(p);
  }

  function closeLesson() {
    const p = new URLSearchParams(searchParams);
    p.delete("lesson");
    setSearchParams(p);
  }

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [subTab, setSubTab] = useState(0);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [videoRows, setVideoRows] = useState([]); // [{file, lessonId, videoName}]
  const [videoDragging, setVideoDragging] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [toast, setToast] = useState(null);
  const [homework, setHomework] = useState([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

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

        // GET /groups/{groupId}/schedules
        const schedList = Array.isArray(schedRaw)
          ? schedRaw
          : Array.isArray(schedRaw?.data)
            ? schedRaw.data
            : [];

        if (schedList.length === 0) {
          setLessonDays([]);
        } else if (schedList[0]?.day !== undefined) {
          // Format 1: flat array [{day, month, isCompleted}, ...]
          setLessonDays(schedList);
        } else {
          // Format 2: [{1: {isActive, days:[...]}, 2: {days:[...]}, ...}]
          // Barcha oylarni birlashtirish (faqat birinchi emas, hammasi)
          const allDays = [];
          schedList.forEach((sched) => {
            Object.values(sched)
              .filter((e) => e && typeof e === "object" && Array.isArray(e.days))
              .forEach((entry) => allDays.push(...entry.days));
          });
          setLessonDays(allDays.length > 0 ? allDays : []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Imtihonlar — GET /exams/{groupId}
  useEffect(() => {
    if (activeTab !== 1 || subTab !== 2) return;
    setExamsLoading(true);
    examsApi.getByGroup(id)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.exams ?? []);
        // API yo'q bo'lsa mock data ko'rsatamiz
        if (list.length === 0) {
          setExams(MOCK_EXAMS);
        } else {
          setExams(list);
        }
      })
      .catch(() => setExams(MOCK_EXAMS))
      .finally(() => setExamsLoading(false));
  }, [id, activeTab, subTab]);

  // Videolar — GET /files/{groupId}
  useEffect(() => {
    if (activeTab !== 1 || subTab !== 1) return;
    setVideosLoading(true);
    filesApi.getByGroup(id)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.files ?? []);
        setVideos(list);
      })
      .catch(() => setVideos([]))
      .finally(() => setVideosLoading(false));
  }, [id, activeTab, subTab]);

  // Tab 1: Guruh darsliklari — lessons + homework (with results)
  useEffect(() => {
    if (activeTab !== 1) return;

    setLessonsLoading(true);
    lessonsApi.getByGroup(id)
      .then((res) => setLessons(Array.isArray(res) ? res : (res?.data ?? res?.lessons ?? [])))
      .catch(() => setLessons([]))
      .finally(() => setLessonsLoading(false));

    setHomeworkLoading(true);
    homeworkApi.getByGroup(id)
      .then(async (res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.homeworks ?? res?.homework ?? []);
        // Har bir homework uchun results fetch qilish
        const withResults = await Promise.all(
          list.map(async (hw) => {
            try {
              const results = await homeworkApi.getResults(id, hw.id);
              const resultList = Array.isArray(results) ? results : (results?.data ?? []);
              return { ...hw, results: resultList };
            } catch {
              return { ...hw, results: [] };
            }
          })
        );
        setHomework(withResults);
      })
      .catch(() => setHomework([]))
      .finally(() => setHomeworkLoading(false));
  }, [id, activeTab]);

  // Tab 2: Akademik davomati
  useEffect(() => {
    if (activeTab !== 2) return;
    setAttendanceLoading(true);
    Promise.all([
      groupsApi.getStudents(id).catch(() => null),
      attendanceApi.getAll().catch(() => null),
    ]).then(([studRes, attRes]) => {
      const studList = Array.isArray(studRes) ? studRes : (studRes?.data ?? studRes?.students ?? []);
      setStudents(studList);
      const attList = Array.isArray(attRes) ? attRes : (attRes?.data ?? attRes?.attendance ?? []);
      setAttendance(attList);
    }).finally(() => setAttendanceLoading(false));
  }, [id, activeTab]);

  function addVideoFiles(files) {
    const newRows = Array.from(files).map((f) => ({
      file: f, lessonId: "", videoName: f.name,
    }));
    setVideoRows((p) => [...p, ...newRows]);
  }

  async function handleVideoUpload() {
    if (videoRows.length === 0) { setVideoError("Fayl tanlang"); return; }
    const invalid = videoRows.find((r) => !r.lessonId);
    if (invalid) { setVideoError("Barcha fayllar uchun darsni tanlang"); return; }
    setVideoError("");
    setVideoUploading(true);
    try {
      // Swagger: POST /files/group/{groupId}/upload?lessonId= — har fayl uchun
      await Promise.all(
        videoRows.map((row) => {
          const fd = new FormData();
          fd.append("file", row.file);
          return filesApi.upload(id, row.lessonId, fd);
        })
      );
      setVideoModal(false);
      setVideoRows([]);
      const res = await filesApi.getByGroup(id);
      setVideos(Array.isArray(res) ? res : (res?.data ?? res?.files ?? []));
      setToast(`${videoRows.length} ta video muvaffaqiyatli yuklandi!`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setVideoError(err.message ?? "Xatolik yuz berdi");
    } finally {
      setVideoUploading(false);
    }
  }

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
          onClick={() => navigate(`${base}/groups`)}
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
  const courseDuration = course.duration_month ?? groupOne?.course?.duration_month ?? "—";

  // lessonDays (schedules) dan hisoblaymiz
  const months = [...new Set(lessonDays.map((d) => d.month))];
  const lessonsPerMonth = lessonDays.length > 0 && months.length > 0
    ? Math.round(lessonDays.length / months.length)
    : "—";
  const totalLessons = lessonDays.length > 0 ? lessonDays.length : "—";

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
            onClick={() => navigate(`${base}/groups`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
          </button>
          <h1 className="text-xl font-extrabold text-gray-800">
            {group.name ?? groupOne?.name ?? "—"}
          </h1>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
              (group.active ?? groupOne?.active ?? true)
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {(group.active ?? groupOne?.active ?? true)
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
            onClick={() => handleTabChange(i)}
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

                <LessonCalendar
                  lessonDays={lessonDays}
                  groupId={id}
                  onDaySelect={(date) => date === selectedDate ? closeLesson() : openLesson(date)}
                />

                {/* Inline Lesson Detail */}
                {selectedDate && (
                  <LessonInline
                    groupId={id}
                    date={selectedDate}
                    onClose={closeLesson}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Sub-tab header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <h2 className="text-[15px] font-bold text-gray-800 mr-4">{t("gd.section_lessons")}</h2>
              {[t("gd.subtab_hw"), t("gd.subtab_videos"), t("gd.subtab_exams"), t("gd.subtab_journal")].map((label, i) => (
                <button
                  key={i}
                  onClick={() => setSubTab(i)}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
                    ${subTab === i ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (subTab === 0) navigate(`${base}/groups/${id}/homework/create`);
                else if (subTab === 1) setVideoModal(true);
                else if (subTab === 2) navigate(`${base}/groups/${id}/exam/create`);
                // subTab === 3 (Jurnal) — alohida action kerak emas
              }}
              className="bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold px-4 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              {subTab === 2 ? t("gd.new_exam") : t("gd.add")}
            </button>
          </div>

          {/* Uyga vazifa */}
          {subTab === 0 && (
            homeworkLoading ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("common.loading")}</p>
            ) : homework.length === 0 ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("gd.no_hw")}</p>
            ) : (
              <table className="w-full text-left table-fixed">
                <colgroup>
                  <col style={{ width: "40px" }} />
                  <col />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "36px" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-3 text-[12px] font-semibold text-gray-400">#</th>
                    <th className="px-3 py-3 text-[12px] font-semibold text-gray-400">{t("gd.col_topic")}</th>
                    <th className="py-3 text-[12px] font-semibold text-gray-400 text-center">👤</th>
                    <th className="py-3 text-[12px] font-semibold text-orange-400 text-center">⏰</th>
                    <th className="py-3 text-[12px] font-semibold text-green-500 text-center">✅</th>
                    <th className="px-3 py-3 text-[12px] font-semibold text-gray-400 whitespace-nowrap">{t("gd.col_given")}</th>
                    <th className="px-3 py-3 text-[12px] font-semibold text-gray-400 whitespace-nowrap">{t("gd.col_deadline")}</th>
                    <th className="px-3 py-3 text-[12px] font-semibold text-gray-400 whitespace-nowrap">{t("gd.col_lesson_date")}</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {homework.map((hw, i) => {
                    const total   = hw.existStudentsIngroup ?? hw.student_count ?? 0;
                    const pending = hw.homeworkPending ?? 0;
                    const checked = hw.homeworkAccept ?? 0;
                    const givenDate = hw.created_at ?? hw.createdAt;
                    const deadlineRaw = hw.deadline ?? hw.due_date ?? null;
                    const deadlineDate = deadlineRaw
                      ? deadlineRaw
                      : givenDate
                      ? new Date(new Date(givenDate).getTime() + 36 * 60 * 60 * 1000).toISOString()
                      : null;
                    const lessonDate = hw.lesson?.date ?? hw.lesson?.created_at ?? hw.lesson_date ?? givenDate;
                    const isOrange = pending > 0;
                    return (
                      <tr
                        key={`${hw.id ?? i}-${i}`}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-3 text-[13px] text-gray-500">{i + 1}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => navigate(`${base}/groups/${id}/homework/${hw.homework?.[0]?.id ?? hw.id}/results`)}
                            className={`text-[13px] font-semibold cursor-pointer text-left w-full px-3 py-1.5 rounded-lg transition-colors truncate block ${
                              isOrange
                                ? "bg-orange-500 text-white hover:bg-orange-400"
                                : "text-gray-800 hover:text-blue-600"
                            }`}
                          >
                            {hw.topic ?? hw.title ?? "—"}
                          </button>
                        </td>
                        <td className="py-3 text-[13px] text-center text-gray-600">{total}</td>
                        <td className="py-3 text-[13px] text-center font-semibold text-orange-500">{pending}</td>
                        <td className="py-3 text-[13px] text-center font-semibold text-green-600">{checked}</td>
                        <td className="px-3 py-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDateTime(givenDate)}</td>
                        <td className="px-3 py-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDateTime(deadlineDate)}</td>
                        <td className="px-3 py-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDate(lessonDate)}</td>
                        <td className="py-3 text-right pr-3">
                          <button
                            onClick={() => navigate(`${base}/groups/${id}/homework/${hw.homework?.[0]?.id ?? hw.id}/results`)}
                            className="cursor-pointer text-lg leading-none text-gray-400 hover:text-violet-600"
                          >⋮</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {subTab === 1 && (
            videosLoading ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("common.loading")}</p>
            ) : videos.length === 0 ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("gd.no_videos")}</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">#</th>
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-teal-500">Video nomi</th>
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-teal-500">Dars nomi</th>
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">Status</th>
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">Dars sanasi</th>
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">Hajmi</th>
                    <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">Qo'shilgan vaqti</th>
                    <th className="px-5 py-3.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v, i) => {
                    // Swagger bo'yicha to'g'ri field nomlar
                    const fileName = v.originalname ?? v.original_name ?? v.name ?? v.filename ?? "Fayl";
                    const videoUrlRaw = v.video_url ?? v.url ?? v.file_url ?? v.path ?? null;
                    const videoUrl = videoUrlRaw
                      ? videoUrlRaw.startsWith("http") ? videoUrlRaw : `${SERVER_ORIGIN}/files/files/${videoUrlRaw}`
                      : null;
                    const lessonName = v.lesson?.topic ?? v.lesson?.name ?? "—";
                    const lessonDate = v.lesson?.created_at ?? v.lesson?.date ?? null;
                    const fileSize = v.size_mb != null
                      ? `${Number(v.size_mb).toFixed(2)} MB`
                      : v.size ? `${(v.size / (1024 * 1024)).toFixed(2)} MB` : "—";
                    const uploadedAt = v.created_at ?? v.createdAt;
                    const statusLabel = v.status ?? "Tayyor";
                    return (
                      <tr key={v.id ?? i} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-[13px] text-gray-500">{i + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0">
                              <span className="text-teal-400 text-[10px] font-bold">▶</span>
                            </div>
                            <button
                              onClick={() => {
                                setPreviewVideo({ url: videoUrl, name: fileName, size: fileSize, lessonName, date: formatDate(lessonDate) });
                                setVideoBlobUrl(null);
                                setVideoLoadError(false);
                                if (videoUrl) {
                                  fetch(videoUrl, { headers: { Authorization: `Bearer ${getToken()}` } })
                                    .then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
                                    .then((blob) => setVideoBlobUrl(URL.createObjectURL(blob)))
                                    .catch(() => setVideoLoadError(true));
                                }
                              }}
                              className="text-[13px] font-semibold text-teal-500 hover:underline cursor-pointer text-left"
                            >
                              {fileName}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-700">{lessonName}</td>
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-lg">
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{formatDate(lessonDate)}</td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{fileSize}</td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{formatDate(uploadedAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-gray-300 hover:text-gray-500 cursor-pointer text-xl leading-none font-bold">⋮</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
          {subTab === 2 && (
            examsLoading ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("common.loading")}</p>
            ) : exams.length === 0 ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("gd.no_exams")}</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">#</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">{t("gd.col_topic")}</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400 text-center">
                      <span className="text-gray-400">👤</span>
                    </th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-center">
                      <span className="text-red-400">✕</span>
                    </th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">Status</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">Dars vaqti</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">{t("gd.col_given")}</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">{t("gd.col_given")}</th>
                    <th className="px-5 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {exams.map((ex, i) => {
                    const isActive = ex.status === "ACTIVE" || ex.status === "Faol" || ex.isActive;
                    const students = ex.student_count ?? ex.students_count ?? 0;
                    const failed = ex.failed_count ?? ex.failed ?? 0;
                    return (
                      <tr key={ex.id ?? i} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                        <td className="px-5 py-4 text-[13px] text-gray-500">{ex.id ?? i + 1}</td>
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-semibold text-blue-500 cursor-pointer hover:underline">
                            {ex.title ?? ex.topic ?? ex.name ?? "Examination"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-700 text-center">{students}</td>
                        <td className="px-5 py-4 text-[13px] text-gray-700 text-center">{failed}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[12px] font-semibold px-3 py-1 rounded-full border
                            ${isActive
                              ? "text-green-600 border-green-400"
                              : "text-gray-500 border-gray-300"}`}>
                            {isActive ? "Faol" : "Tugagan"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-600 whitespace-pre-line">
                          {formatDateTime(ex.lesson_date ?? ex.date ?? ex.lesson?.date)}
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-600 whitespace-pre-line">
                          {formatDateTime(ex.created_at ?? ex.given_at)}
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-600 whitespace-pre-line">
                          {ex.announced_at ? formatDateTime(ex.announced_at) : "-"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl leading-none">⋮</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
          {subTab === 3 && (
            lessonsLoading ? (
              <p className="text-center text-[13px] text-gray-400 py-10">{t("common.loading")}</p>
            ) : lessons.length === 0 ? (
              <p className="text-center text-[13px] text-gray-400 py-10">Darslar yo'q</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">#</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">Mavzu</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">Tavsif</th>
                    <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((l, i) => (
                    <tr key={l.id ?? i} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                      <td className="px-5 py-3 text-[13px] text-gray-500">{i + 1}</td>
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-800">{l.topic ?? l.title ?? "—"}</td>
                      <td className="px-5 py-3 text-[13px] text-gray-500">{l.description ?? "—"}</td>
                      <td className="px-5 py-3 text-[13px] text-gray-600">
                        {l.date ? new Date(l.date).toLocaleDateString("uz-UZ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {attendanceLoading ? (
            <p className="text-center text-[13px] text-gray-400 py-10">{t("common.loading")}</p>
          ) : students.length === 0 ? (
            <p className="text-center text-[13px] text-gray-400 py-10">{t("gd.no_attendance")}</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">#</th>
                  <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">O'quvchi</th>
                  <th className="px-5 py-3 text-[12px] font-semibold text-gray-400 text-right pr-6">Davomat</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const name = s.full_name ?? s.name ?? "—";
                  // Faqat shu guruh va shu o'quvchining davomati
                  const studentAtt = attendance.filter((a) => {
                    const sameStudent = a.student_id === s.id || a.Student?.id === s.id;
                    const sameGroup = a.group_id === Number(id) || a.Group?.id === Number(id);
                    return sameStudent && sameGroup;
                  });
                  const came = studentAtt.filter((a) => a.isPresent ?? a.is_attended ?? false).length;
                  const total = studentAtt.length;
                  const pct = total > 0 ? Math.round((came / total) * 100) : null;
                  return (
                    <tr key={s.id ?? i} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                      <td className="px-5 py-3 text-[13px] text-gray-500">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-violet-600 text-[12px] font-bold">{name[0]}</span>
                          </div>
                          <span className="text-[13px] font-semibold text-gray-800">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 pr-6 text-right">
                        {pct !== null ? (
                          <span className={`text-[13px] font-bold ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-[13px] text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Video upload modal */}
      {videoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setVideoModal(false); setVideoRows([]); setVideoError(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="text-[16px] font-bold text-gray-800">Qo'shish</span>
              <button onClick={() => { setVideoModal(false); setVideoRows([]); setVideoError(""); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <span className="text-gray-500 text-[18px] leading-none">×</span>
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {videoError && (
                <div className="bg-red-50 text-red-600 text-[13px] font-semibold px-4 py-2.5 rounded-xl">{videoError}</div>
              )}

              {/* Drag-drop */}
              <div
                onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
                onDragLeave={() => setVideoDragging(false)}
                onDrop={(e) => { e.preventDefault(); setVideoDragging(false); addVideoFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById("video-file-input").click()}
                className={`border-2 border-dashed rounded-2xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                  ${videoDragging ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-green-400 bg-white flex items-center justify-center">
                  <span className="text-green-500 text-[28px] font-bold leading-none">+</span>
                </div>
                <p className="text-[13px] font-semibold text-gray-700 text-center px-8">
                  Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
                </p>
                <p className="text-[12px] text-gray-400 text-center px-8">
                  Videofayl: .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov formatlaridan birida bo'lishi kerak
                </p>
                <input id="video-file-input" type="file" multiple
                  accept=".mp4,.webm,.mpeg,.avi,.mkv,.m4v,.ogm,.mov"
                  onChange={(e) => { if (e.target.files.length) addVideoFiles(e.target.files); }}
                  className="hidden" />
              </div>

              {/* Files table */}
              {videoRows.length > 0 && (
                <table className="w-full text-left border border-gray-100 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-500">File name</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-500">* Dars</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-500">* Video nomi</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videoRows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2.5 text-[13px] text-gray-700">{row.file.name}</td>
                        <td className="px-4 py-2.5">
                          <select
                            value={row.lessonId}
                            onChange={(e) => setVideoRows((p) => p.map((r, idx) => idx === i ? { ...r, lessonId: e.target.value } : r))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-violet-400 bg-white"
                          >
                            <option value="">Darsni tanlang</option>
                            {lessons.map((l) => (
                              <option key={l.id} value={l.id}>{l.topic ?? l.title ?? `Dars #${l.id}`}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            value={row.videoName}
                            onChange={(e) => setVideoRows((p) => p.map((r, idx) => idx === i ? { ...r, videoName: e.target.value } : r))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-violet-400"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => setVideoRows((p) => p.filter((_, idx) => idx !== i))}
                            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setVideoModal(false); setVideoRows([]); setVideoError(""); }}
                className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              {videoRows.length > 0 && (
                <button
                  onClick={handleVideoUpload}
                  disabled={videoUploading}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-[13px] font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {videoUploading ? "Yuklanmoqda..." : "Fayllarni yuklash"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white text-[13px] font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
          <span className="text-[16px]">✓</span>
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white cursor-pointer font-bold">✕</button>
        </div>
      )}

      {/* Video preview modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85" onClick={() => {
            if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
            setVideoBlobUrl(null);
            setPreviewVideo(null);
          }} />
          <div className="relative bg-black rounded-2xl shadow-2xl w-full max-w-3xl z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-black border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0">
                  <span className="text-teal-400 text-[10px] font-bold">▶</span>
                </div>
                <span className="text-[14px] font-semibold text-white">{previewVideo.name}</span>
              </div>
              <button
                onClick={() => {
                  if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
                  setVideoBlobUrl(null);
                  setPreviewVideo(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 cursor-pointer transition-colors text-white text-[20px]"
              >
                ✕
              </button>
            </div>

            {/* Video player */}
            <div className="bg-black min-h-48 flex items-center justify-center">
              {videoBlobUrl ? (
                <video
                  src={videoBlobUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-contain"
                  onEnded={() => URL.revokeObjectURL(videoBlobUrl)}
                />
              ) : videoLoadError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
                  <span className="text-[48px]">⚠</span>
                  <p className="text-[13px]">Video yuklanmadi — server faylni bermayapti</p>
                  {previewVideo.url && (
                    <a href={previewVideo.url} target="_blank" rel="noreferrer"
                      className="text-[12px] text-teal-400 hover:underline mt-1">
                      To'g'ridan-to'g'ri ochish →
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-gray-600">
                  <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px]">Video yuklanmoqda...</p>
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="flex flex-wrap items-center gap-5 px-5 py-3.5 bg-gray-900 border-t border-white/10">
              <span className="text-[13px] text-gray-400">
                Fayl: <span className="font-bold text-white">{previewVideo.name}</span>
              </span>
              <span className="text-[13px] text-gray-400">
                Hajmi: <span className="font-bold text-white">{previewVideo.size}</span>
              </span>
              <span className="text-[13px] text-gray-400">
                Dars: <span className="font-bold text-white">{previewVideo.lessonName}</span>
              </span>
              <span className="text-[13px] text-gray-400">
                Sana: <span className="font-bold text-white">{previewVideo.date}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
