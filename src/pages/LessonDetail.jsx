import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { groupsApi } from "../api/groups";
import { lessonsApi } from "../api/lessons";
import { attendanceApi } from "../api/attendance";
import { useLanguage } from "../contexts/LanguageContext";
import { usePanelBase } from "../hooks/usePanelBase";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

function fixPhotoUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SERVER_ORIGIN}${url}`;
  return `${SERVER_ORIGIN}/files/${url}`;
}

function normalizeList(res, keys = []) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  for (const key of keys) if (Array.isArray(res?.[key])) return res[key];
  return [];
}

const MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

export default function LessonDetail() {
  const { groupId, date } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const base = usePanelBase();

  const [lessonType, setLessonType] = useState("plan");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existingLesson, setExistingLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [topicError, setTopicError] = useState("");
  const [saveError, setSaveError] = useState("");

  // GET /groups/one/students/{groupId} + GET /lessons/my/group/{groupId}
  useEffect(() => {
    setLoading(true);
    Promise.all([
      groupsApi.getStudents(groupId).catch(() => null),
      lessonsApi.getByGroup(groupId).catch(() => null),
    ])
      .then(([studRes, lessonsRes]) => {
        const studentList = normalizeList(studRes, ["students"]);
        setStudents(studentList);

        const lessonList = normalizeList(lessonsRes, ["lessons"]);

        // 1) localStorage dan saqlangan lesson ID ni tekshir
        const savedKey = `lesson_${groupId}_${date}`;
        const savedLessonId = localStorage.getItem(savedKey);

        const todayLesson = lessonList.find((l) => {
          // a) Exact date match
          if (l.date && (l.date === date || l.date.startsWith(date)))
            return true;
          // b) localStorage da saqlangan ID bilan
          if (savedLessonId && String(l.id) === savedLessonId) return true;
          // c) created_at sana mos kelsa (backend date qaytarmasa)
          const createdAt = l.created_at ?? l.createdAt ?? "";
          if (createdAt.startsWith(date)) return true;
          return false;
        });

        const attMap = {};
        studentList.forEach((s) => {
          attMap[s.id] = false;
        });

        if (todayLesson) {
          setExistingLesson(todayLesson);
          setSaved(true);
          setTopic(todayLesson.topic ?? todayLesson.title ?? "");
          setDescription(todayLesson.description ?? "");
          setLessonType(todayLesson.type === "other" ? "other" : "plan");

          // lesson.attendance bo'sh bo'lsa → attendance API dan yuklaymiz
          const attList =
            Array.isArray(todayLesson.attendance) &&
            todayLesson.attendance.length > 0
              ? todayLesson.attendance
              : null;

          if (attList) {
            attList.forEach((a) => {
              if (a.student_id != null)
                attMap[a.student_id] = a.is_attended ?? a.isPresent ?? false;
            });
            setAttendance(attMap);
          } else {
            // Attendance API dan yuklash — swagger: GET /attendance/all
            attendanceApi
              .getAll()
              .then((attRes) => {
                const raw = Array.isArray(attRes)
                  ? attRes
                  : Array.isArray(attRes?.data)
                    ? attRes.data
                    : Array.isArray(attRes?.data?.attendances)
                      ? attRes.data.attendances
                      : Array.isArray(attRes?.attendances)
                        ? attRes.attendances
                        : [];
                const grouped = raw.filter(
                  (a) =>
                    Number(a.group_id) === Number(groupId) ||
                    a.Group?.id === Number(groupId),
                );
                grouped.forEach((a) => {
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
      })
      .finally(() => setLoading(false));
  }, [groupId, date]);

  function toggleAttendance(studentId) {
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  // POST /lessons + POST /attendance (swagger bo'yicha)
  async function handleSave() {
    if (!topic.trim()) {
      setTopicError(t("ld.topic_error"));
      return;
    }
    setTopicError("");
    setSaveError("");
    setSaving(true);
    try {
      // POST /lessons → {group_id, topic, description, date}
      // date yuboramiz — shunda har sana uchun bitta dars bo'ladi (takror oldini olish)
      const lessonRes = await lessonsApi.create({
        group_id: Number(groupId),
        topic: topic.trim(),
        description: description.trim(),
        date,
      });
      const lessonId = lessonRes?.data?.id ?? lessonRes?.id;

      // POST /attendance — swagger: {group_id, student_id, isPresent}
      await Promise.all(
        Object.entries(attendance).map(([studentId, came]) =>
          attendanceApi.create({
            group_id: Number(groupId),
            student_id: Number(studentId),
            isPresent: came,
          }),
        ),
      );
      setSaved(true);
      setExistingLesson({ id: lessonId });
      if (lessonId)
        localStorage.setItem(`lesson_${groupId}_${date}`, String(lessonId));
    } catch (err) {
      setSaveError(err.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  const displayDate = (() => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[13px] text-gray-400">
        {t("ld.loading")}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`${base}/groups/${groupId}`)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <span className="text-[15px] font-bold text-gray-800">
          Dars — {displayDate}
        </span>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {/* Save error */}
        {saveError && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-[13px] font-semibold px-4 py-3 rounded-xl">
            <span>⚠ {saveError}</span>
            <button
              onClick={() => setSaveError("")}
              className="ml-4 text-red-400 hover:text-red-600 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Lesson type */}
        <div className="flex items-center gap-6">
          <label
            className={`flex items-center gap-2 ${saved ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name="lessonType"
              value="plan"
              checked={lessonType === "plan"}
              onChange={() => !saved && setLessonType("plan")}
              disabled={saved}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-[13px] text-gray-600">{t("ld.plan")}</span>
          </label>
          <label
            className={`flex items-center gap-2 ${saved ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name="lessonType"
              value="other"
              checked={lessonType === "other"}
              onChange={() => !saved && setLessonType("other")}
              disabled={saved}
              className="accent-violet-600 w-4 h-4"
            />
            <span
              className={`text-[13px] font-semibold ${lessonType === "other" ? "text-green-500" : "text-gray-600"}`}
            >
              {t("ld.other")}
            </span>
          </label>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-[13px] font-semibold text-red-500 mb-1">
            * Mavzu
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              if (!saved) {
                setTopic(e.target.value);
                setTopicError("");
              }
            }}
            readOnly={saved}
            placeholder={t("ld.topic_ph")}
            className={`w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition-colors
              ${
                saved
                  ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : topicError
                    ? "border-red-400 bg-white"
                    : "border-gray-200 focus:border-violet-400 bg-white"
              }`}
          />
          {topicError && (
            <p className="text-[11px] text-red-500 mt-1">{topicError}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1">
            {t("ld.desc_label")}
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              if (!saved) setDescription(e.target.value);
            }}
            readOnly={saved}
            placeholder={t("ld.desc_ph")}
            rows={3}
            className={`w-full border rounded-xl px-4 py-2.5 text-[13px] outline-none transition-colors resize-none
              ${
                saved
                  ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "border-gray-200 focus:border-violet-400 bg-white"
              }`}
          />
        </div>

        {/* Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">
                  #
                </th>
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">
                  {t("ld.student_name")}
                </th>
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400 text-right pr-6">
                  {t("ld.attended")}
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-[13px] text-gray-400"
                  >
                    {t("ld.no_students")}
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const name = s.full_name ?? s.name ?? "—";
                  const photo = fixPhotoUrl(
                    s.image ?? s.photo ?? s.avatar ?? null,
                  );
                  const came = attendance[s.id] ?? false;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[13px] text-gray-500 w-10">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                              <span className="text-gray-600 text-[12px] font-semibold uppercase">
                                {name[0]}
                              </span>
                            </div>
                          )}
                          <span className="text-[13px] text-gray-800">
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 pr-6 text-right">
                        <button
                          onClick={() => !saved && toggleAttendance(s.id)}
                          disabled={saved}
                          className={
                            saved
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer"
                          }
                        >
                          {came ? (
                            <div className="w-6 h-6 rounded-full bg-green-500 shadow-sm" />
                          ) : (
                            <div className="w-11 h-6 rounded-full bg-gray-200 relative">
                              <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow" />
                            </div>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-4 py-2">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`text-[13px] font-semibold px-5 py-2 rounded-xl transition-colors
              ${
                saved
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
              }`}
          >
            {saving ? t("ld.saving") : saved ? t("ld.saved") : t("ld.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
