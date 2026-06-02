import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { homeworkApi } from "../api/homework";

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];

function fmt(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// swagger bo'yicha status lar
const TABS = [
  { key: "PENDING",  label: "Kutayotganlar" },
  { key: "REJECTED", label: "Qaytarilganlar" },
  { key: "ACCEPTED", label: "Qabul qilinganlar" },
  { key: "CHECKED",  label: "Bajarilmagan" },
];

export default function HomeworkResults() {
  const { groupId, homeworkId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("PENDING");
  const [results, setResults] = useState({});
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [homework, setHomework] = useState(null);

  // Barcha tablar sonini bir vaqtda olish
  useEffect(() => {
    TABS.forEach(({ key }) => {
      homeworkApi.getResults(groupId, homeworkId, key)
        .then((res) => {
          const list = Array.isArray(res) ? res : (res?.data ?? res?.results ?? []);
          setCounts((p) => ({ ...p, [key]: list.length }));
          if (key === "PENDING") {
            setResults((p) => ({ ...p, [key]: list }));
            if (list[0]?.homework) setHomework(list[0].homework);
          }
        })
        .catch(() => setCounts((p) => ({ ...p, [key]: 0 })));
    });
  }, [groupId, homeworkId]);

  // Tab o'zgarganda lazim bo'lsa yuklash
  const loadTab = useCallback(async (key) => {
    if (results[key]) return;
    setLoading(true);
    try {
      const res = await homeworkApi.getResults(groupId, homeworkId, key);
      const list = Array.isArray(res) ? res : (res?.data ?? res?.results ?? []);
      setResults((p) => ({ ...p, [key]: list }));
    } catch {
      setResults((p) => ({ ...p, [key]: [] }));
    } finally {
      setLoading(false);
    }
  }, [groupId, homeworkId, results]);

  useEffect(() => { loadTab(activeTab); }, [activeTab]);

  const list = results[activeTab] ?? [];
  const showBall = activeTab === "ACCEPTED" || activeTab === "CHECKED";

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <h1 className="text-[20px] font-bold text-gray-800">
          {homework?.title ?? homework?.topic ?? "Uyga vazifa"}
        </h1>
      </div>

      {/* Meta card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-5 flex items-start justify-between">
        <div className="flex gap-10">
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Mavzu</p>
            <p className="text-[15px] font-bold text-gray-800">
              {homework?.title ?? homework?.topic ?? "—"}
            </p>
          </div>
          {(homework?.deadline ?? homework?.created_at) && (
            <div>
              <p className="text-[12px] text-gray-400 mb-0.5">Imtihon vaqti</p>
              <p className="text-[14px] font-semibold text-gray-700">
                {fmt(homework?.created_at)} – {fmt(homework?.deadline)}
              </p>
            </div>
          )}
        </div>
        <button className="border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 px-4 py-1.5 rounded-lg cursor-pointer transition-colors shrink-0">
          E'lon qilish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 mb-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap
              ${activeTab === key
                ? "text-green-600 border-green-500"
                : "text-gray-400 border-transparent hover:text-gray-600"}`}
          >
            {label}
            {counts[key] > 0 && (
              <span className="text-[11px] font-bold w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center">
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-[13px] text-gray-400 py-10">Yuklanmoqda...</p>
        ) : list.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-10">Ma'lumot yo'q</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-[12px] font-semibold text-teal-500">O'quvchi ismi</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-teal-500">Topshirilgan vaqti</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-teal-500">Tekshirilgan vaqti</th>
                {showBall ? (
                  <th className="px-5 py-3 text-[12px] font-semibold text-teal-500">Ball</th>
                ) : (
                  <th className="px-5 py-3 text-[12px] font-semibold text-teal-500">Tugash vaqti</th>
                )}
                <th className="px-5 py-3 text-[12px] font-semibold text-gray-400 text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const name = r.student?.full_name ?? r.Student?.full_name ?? r.full_name ?? `#${i+1}`;
                const studentId = r.student?.id ?? r.Student?.id ?? r.student_id;
                const submittedAt = r.created_at ?? r.submitted_at;
                const checkedAt = r.updated_at ?? r.checked_at;
                const deadline = r.homework?.deadline ?? r.deadline;
                const ball = r.grade ?? r.ball ?? r.score;
                return (
                  <tr key={r.id ?? i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] text-gray-800 font-medium">{name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{fmt(submittedAt)}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{fmt(checkedAt)}</td>
                    {showBall ? (
                      <td className="px-5 py-3.5">
                        {ball != null ? (
                          <span className="flex items-center gap-1 text-[13px] font-bold text-amber-500">
                            ⚡ {ball}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                    ) : (
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">{fmt(deadline)}</td>
                    )}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(
                          `/dashboard/groups/${groupId}/homework/${homeworkId}/student/${studentId}/review`
                        )}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl font-bold leading-none"
                      >⋮</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
