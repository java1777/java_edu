import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { homeworkApi } from "../api/homework";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];

function formatDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function fixUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${SERVER_ORIGIN}/media/${url}`;
}

const STATUS_LABELS = {
  PENDING:  { label: "Kutayabti",      color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  CHECKED:  { label: "Tekshirildi",    color: "bg-blue-100 text-blue-700 border-blue-300" },
  ACCEPTED: { label: "Qabul qilindi",  color: "bg-green-100 text-green-700 border-green-300" },
  REJECTED: { label: "Rad etildi",     color: "bg-red-100 text-red-700 border-red-300" },
};

export default function HomeworkReview() {
  const { groupId, homeworkId, studentId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");
  const [checkSuccess, setCheckSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    // GET /group/{groupId}/homework/{homeworkId}/result/{studentId}
    homeworkApi.getResult(groupId, homeworkId, studentId)
      .then((res) => setResult(res?.data ?? res))
      .catch((err) => setError(err.message ?? "Ma'lumot topilmadi"))
      .finally(() => setLoading(false));
  }, [groupId, homeworkId, studentId]);

  async function handleCheck() {
    if (!grade) return;
    setChecking(true);
    try {
      // POST /group/{groupId}/homework/{homeworkId}/check
      await homeworkApi.check(groupId, homeworkId, {
        grade: Number(grade),
        title: comment,
        homework_answer_id: result?.id ?? result?.homework_answer_id,
      });
      setCheckSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-[13px]">Yuklanmoqda...</div>
  );

  const statusKey = result?.status ?? "PENDING";
  const statusInfo = STATUS_LABELS[statusKey] ?? STATUS_LABELS.PENDING;
  const studentName = result?.student?.full_name ?? result?.Student?.full_name ?? `O'quvchi #${studentId}`;
  const submittedAt = result?.created_at ?? result?.submitted_at;
  const answerText = result?.title ?? result?.answer ?? result?.description ?? result?.text;
  const files = Array.isArray(result?.files) ? result.files : [];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <span className="text-[13px] text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => navigate(-1)}>
          Kutayotganlar
        </span>
        <span className="text-gray-300">›</span>
        <span className="text-[13px] font-semibold text-gray-700">Uy ishi</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">{error}</div>
      )}
      {checkSuccess && (
        <div className="bg-green-50 text-green-700 text-[13px] font-semibold px-4 py-3 rounded-xl mb-4">
          ✓ Uy ishi muvaffaqiyatli baholandi!
        </div>
      )}

      {/* Homework task */}
      {result?.homework && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="text-[15px] font-bold text-gray-800 mb-3">Uyga vazifa</h2>
          <p className="text-[13px] text-gray-500 mb-1">Mavzu:</p>
          <p className="text-[14px] font-semibold text-gray-800 mb-2">
            {result.homework?.title ?? result.homework?.topic ?? "—"}
          </p>
          {result.homework?.description && (
            <div className="text-[13px] text-gray-700 mt-2"
              dangerouslySetInnerHTML={{ __html: result.homework.description }} />
          )}
        </div>
      )}

      {/* Student submission */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-[15px] font-bold text-gray-800 mb-4">{studentName}</h2>

        <div className="flex flex-wrap items-center gap-6 mb-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Vaqti</p>
            <p className="text-[13px] font-semibold text-gray-800">{formatDateTime(submittedAt)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Fayllar soni</p>
            <p className="text-[13px] font-semibold text-gray-800">{files.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Status</p>
            <span className={`text-[12px] font-semibold px-3 py-1 rounded-lg border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Answer text */}
        {answerText && (
          <div className="border-l-4 border-violet-300 pl-4 mb-4">
            <p className="text-[12px] text-gray-400 mb-1">Uy ishi izohi:</p>
            <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{answerText}</p>
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            <p className="text-[12px] text-gray-400 font-semibold">Fayllar:</p>
            {files.map((f, i) => (
              <a key={i} href={fixUrl(f.url ?? f.path ?? f.filename)}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[13px] text-blue-500 hover:underline">
                📎 {f.name ?? f.original_name ?? f.filename ?? `Fayl ${i + 1}`}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Check / grade section — POST /group/{groupId}/homework/{homeworkId}/check */}
      {!checkSuccess && statusKey === "PENDING" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-700 text-[13px] px-4 py-3 rounded-xl mb-5">
            <span className="text-blue-500 text-[16px] mt-0.5 shrink-0">ℹ</span>
            <span>
              60-100 oralig'ida ball qo'yilgan vazifa <b>'Qabul qilingan'</b>, 0-59 oralig'ida ball qo'yilgan vazifa <b>'Qaytarilgan'</b> hisoblanadi.
            </span>
          </div>

          {/* Slider */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] font-bold text-gray-800">Ball</label>
              <input
                type="number" min="0" max="100" value={grade || 0}
                onChange={(e) => setGrade(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-[13px] text-center outline-none focus:border-violet-400"
              />
            </div>
            <input
              type="range" min="0" max="100" value={grade || 0}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${Number(grade || 0) >= 60 ? "#10B981" : "#EF4444"} ${grade || 0}%, #E5E7EB ${grade || 0}%)`
              }}
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>0</span>
              <span className={`font-semibold ${Number(grade || 0) >= 60 ? "text-green-600" : "text-red-500"}`}>
                O'tish bali: 60
              </span>
              <span>100</span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-5">
            <textarea
              placeholder="Izohingiz"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-violet-400 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              Bekor qilish
            </button>
            <button onClick={handleCheck} disabled={checking}
              className="px-6 py-2.5 text-[13px] font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 rounded-xl cursor-pointer transition-colors">
              {checking ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
