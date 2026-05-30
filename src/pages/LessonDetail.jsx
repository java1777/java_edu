import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { groupsApi } from "../api/groups";
import { lessonsApi } from "../api/lessons";
import { attendanceApi } from "../api/attendance";

function normalizeList(res, keys = []) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  for (const key of keys) {
    if (Array.isArray(res?.[key])) return res[key];
  }
  return [];
}

export default function LessonDetail() {
  const { groupId, date } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      groupsApi.getStudents(groupId).catch(() => null),
      lessonsApi.getByGroup(groupId).catch(() => null),
    ]).then(([studRes, lessonsRes]) => {
      const studentList = normalizeList(studRes, ["students"]);
      setStudents(studentList);

      const lessonList = normalizeList(lessonsRes, ["lessons"]);
      const todayLesson = lessonList.find(
        (l) => l.date === date || l.date?.startsWith(date)
      );

      const attMap = {};
      studentList.forEach((s) => { attMap[s.id] = false; });

      if (todayLesson) {
        setExistingLesson(todayLesson);
        setSaved(true);
        setTopic(todayLesson.topic ?? todayLesson.title ?? "");
        setDescription(todayLesson.description ?? "");
        setLessonType(todayLesson.type === "other" ? "other" : "plan");
        const attList = Array.isArray(todayLesson.attendance) ? todayLesson.attendance : [];
        attList.forEach((a) => {
          if (a.student_id != null) attMap[a.student_id] = a.is_attended ?? false;
        });
      }
      setAttendance(attMap);
    }).finally(() => setLoading(false));
  }, [groupId, date]);

  function toggleAttendance(studentId) {
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  async function handleSave() {
    if (!topic.trim()) {
      setTopicError("Mavzu kiritilishi shart");
      return;
    }
    setTopicError("");
    setSaving(true);
    try {
      const lessonRes = await lessonsApi.create({
        group_id: Number(groupId),
        date,
        topic: topic.trim(),
        description: description.trim(),
        type: lessonType,
      });
      const lessonId = lessonRes?.data?.id ?? lessonRes?.id;

      if (lessonId) {
        await attendanceApi.create({
          lesson_id: lessonId,
          attendance: Object.entries(attendance).map(([studentId, came]) => ({
            student_id: Number(studentId),
            is_attended: came,
          })),
        });
      }
      setSaved(true);
      setExistingLesson({ id: lessonId });
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const displayDate = (() => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    const months = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
    return `${Number(d)} ${months[Number(m) - 1]}, ${y}`;
  })();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`/dashboard/groups/${groupId}`)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <span className="text-[15px] font-bold text-gray-800">
          Dars — {displayDate}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col gap-4">

        {/* Lesson type radios */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lessonType"
              value="plan"
              checked={lessonType === "plan"}
              onChange={() => setLessonType("plan")}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-[13px] text-gray-600">O'quv reja bo'yicha</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="lessonType"
              value="other"
              checked={lessonType === "other"}
              onChange={() => setLessonType("other")}
              className="accent-violet-600 w-4 h-4"
            />
            <span className={`text-[13px] font-semibold ${lessonType === "other" ? "text-green-500" : "text-gray-600"}`}>
              Boshqa
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
            onChange={(e) => { setTopic(e.target.value); setTopicError(""); }}
            placeholder="Dars mavzusini kiriting"
            className={`w-full border rounded-xl px-4 py-2.5 text-[13px] bg-white outline-none transition-colors
              ${topicError ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
          />
          {topicError && (
            <p className="text-[11px] text-red-500 mt-1">{topicError}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1">
            Tavsif (ixtiyoriy)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dars haqida qo'shimcha ma'lumot..."
            rows={3}
            className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-4 py-2.5 text-[13px] bg-white outline-none transition-colors resize-none"
          />
        </div>

        {/* Students table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400 w-10">#</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400">
                  O'quvchi ismi
                </th>
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400 text-right pr-6">
                  Keldi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-[13px] text-gray-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-[13px] text-gray-400">
                    O'quvchilar topilmadi
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const name = s.full_name ?? s.name ?? "—";
                  const photo = s.image ?? s.photo ?? s.avatar ?? null;
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
                          <span className="text-[13px] text-gray-800">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 pr-6 text-right">
                        {/* Toggle */}
                        <button
                          onClick={() => toggleAttendance(s.id)}
                          className="cursor-pointer"
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

        {/* Bottom save row */}
        <div className="flex items-center justify-end gap-4 py-2">
          {saved && (
            <span className="text-[13px] text-gray-400">
              Dars allaqachon saqlangan
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !!existingLesson}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

      </div>
    </div>
  );
}
