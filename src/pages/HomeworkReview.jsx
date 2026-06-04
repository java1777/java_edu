import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { homeworkApi } from "../api/homework";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

const MONTHS = ["Yan","Fev","Mar","Apr","May","Iyun","Iyul","Avg","Sen","Okt","Noy","Dek"];

function fmt(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function fixUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${SERVER_ORIGIN}/files/${url}`;
}

const STATUS = {
  PENDING:  { label: "Kutayabti",     cls: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  CHECKED:  { label: "Tekshirildi",   cls: "bg-blue-100 text-blue-700 border-blue-300" },
  ACCEPTED: { label: "Qabul qilindi", cls: "bg-green-100 text-green-700 border-green-300" },
  REJECTED: { label: "Rad etildi",    cls: "bg-red-100 text-red-700 border-red-300" },
};

export default function HomeworkReview() {
  const { groupId, homeworkId, studentId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [grade, setGrade] = useState(60);
  const [comment, setComment] = useState("");
  const [checkDone, setCheckDone] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [reviewFile, setReviewFile] = useState(null);
  const [reviewDragging, setReviewDragging] = useState(false);

  useEffect(() => {
    setLoading(true);
    // GET /group/{groupId}/homework/{homeworkId}/result/{studentId}
    homeworkApi.getResult(groupId, homeworkId, studentId)
      .then((res) => setResult(res?.data ?? res))
      .catch((err) => setError(err.message ?? "Ma'lumot topilmadi"))
      .finally(() => setLoading(false));
  }, [groupId, homeworkId, studentId]);

  async function handleCheck() {
    setChecking(true);
    try {
      // POST /group/{groupId}/homework/{homeworkId}/check
      let body;
      if (reviewFile) {
        body = new FormData();
        body.append("grade", Number(grade));
        body.append("title", comment);
        body.append("homework_answer_id", result?.id ?? result?.homework_answer_id ?? "");
        body.append("file", reviewFile);
      } else {
        body = {
          grade: Number(grade),
          title: comment,
          homework_answer_id: result?.id ?? result?.homework_answer_id,
        };
      }
      await homeworkApi.check(groupId, homeworkId, body);
      setCheckDone(true);
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
  const statusInfo = STATUS[statusKey] ?? STATUS.PENDING;
  const studentName = result?.student?.full_name ?? result?.Student?.full_name ?? `O'quvchi #${studentId}`;
  const submittedAt = result?.created_at ?? result?.submitted_at;
  const answerText = result?.title ?? result?.answer ?? result?.description ?? result?.text;
  const files = Array.isArray(result?.files) ? result.files : [];
  const homeworkDesc = result?.homework?.description ?? result?.homework?.title ?? null;

  const isImage = (f) => {
    const name = (f.name ?? f.filename ?? f.original_name ?? "").toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
  };

  return (
    <div className="py-6 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <ArrowBackIcon sx={{ fontSize: 18, color: "#374151" }} />
        </button>
        <span className="text-[13px] text-gray-500 cursor-pointer hover:underline" onClick={() => navigate(-1)}>
          Kutayotganlar
        </span>
        <span className="text-gray-300">›</span>
        <span className="text-[13px] text-teal-500 font-medium">Uyga vazifa</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">{error}</div>
      )}
      {checkDone && (
        <div className="bg-green-50 text-green-700 text-[13px] font-semibold px-4 py-3 rounded-xl mb-4">
          ✓ Muvaffaqiyatli baholandi!
        </div>
      )}

      {/* Homework task */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-[15px] font-bold text-gray-800 mb-3">Uy vazifasi</h2>
        {homeworkDesc ? (
          <>
            <p className="text-[13px] text-gray-400 mb-1">Izoh:</p>
            <p className="text-[14px] text-gray-700">{homeworkDesc}</p>
          </>
        ) : (
          <p className="text-[13px] text-gray-400">Izoh yo'q</p>
        )}
      </div>

      {/* Student submission */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-[17px] font-bold text-gray-800 mb-4">{studentName}</h2>

        {/* Meta */}
        <div className="bg-white rounded-xl p-4 flex flex-wrap gap-6 mb-4 border border-gray-100">
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Vaqti:</p>
            <p className="text-[14px] font-bold text-gray-800">{fmt(submittedAt)}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Fayllar soni:</p>
            <p className="text-[14px] font-bold text-gray-800">{files.length}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Status:</p>
            <span className={`text-[12px] font-semibold px-3 py-1 rounded-lg border ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Files */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
            <p className="text-[13px] text-gray-500 mb-3">
              Fayl: <span className="font-bold text-gray-800">{files.length}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => {
                const url = fixUrl(f.url ?? f.path ?? f.filename ?? f.file_url);
                const name = f.name ?? f.original_name ?? f.filename ?? `Fayl ${i+1}`;
                if (isImage(f) && url) {
                  return (
                    <img
                      key={i}
                      src={url}
                      alt={name}
                      onClick={() => setPreviewImg(url)}
                      className="w-40 h-28 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    />
                  );
                }
                return (
                  <a key={i} href={url ?? "#"} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-[13px] text-blue-500 hover:underline">
                    📎 {name}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Answer text */}
        {answerText && (
          <div className="bg-white rounded-xl pl-4 pr-4 py-3" style={{ borderLeft: "4px solid #C4B5FD", border: "1px solid #F3F4F6", borderLeft: "4px solid #C4B5FD" }}>
            <p className="text-[12px] text-gray-400 mb-1">Uyga vazifa izohi:</p>
            <p className="text-[13px] text-blue-500 break-all whitespace-pre-wrap">{answerText}</p>
          </div>
        )}
      </div>

      {/* Grade section */}
      {!checkDone && statusKey === "PENDING" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-700 text-[13px] px-4 py-3 rounded-xl mb-5">
            <span className="text-blue-500 text-[16px] mt-0.5 shrink-0">ℹ</span>
            <span>60-100 oralig'ida ball qo'yilgan vazifa <b>'Qabul qilingan'</b>, 0-59 oralig'ida <b>'Qaytarilgan'</b> hisoblanadi.</span>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] font-bold text-gray-800">Ball</label>
              <input type="number" min="0" max="100" value={grade}
                onChange={(e) => setGrade(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-[13px] text-center outline-none focus:border-violet-400" />
            </div>
            <input type="range" min="0" max="100" value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${Number(grade) >= 60 ? "#10B981" : "#EF4444"} ${grade}%, #E5E7EB ${grade}%)` }} />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>0</span>
              <span className={`font-semibold ${Number(grade) >= 60 ? "text-green-600" : "text-red-500"}`}>O'tish bali: 60</span>
              <span>100</span>
            </div>
          </div>

          {/* Fayllar upload */}
          <div className="mb-5">
            <p className="text-[14px] font-bold text-gray-800 mb-3">Fayllar</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setReviewDragging(true); }}
              onDragLeave={() => setReviewDragging(false)}
              onDrop={(e) => { e.preventDefault(); setReviewDragging(false); const f = e.dataTransfer.files[0]; if (f) setReviewFile(f); }}
              onClick={() => document.getElementById("review-file-inp").click()}
              className={`border-2 border-dashed rounded-2xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                ${reviewDragging ? "border-teal-400 bg-teal-50" : reviewFile ? "border-teal-400 bg-teal-50" : "border-teal-300 bg-gray-50 hover:border-teal-400"}`}
            >
              {reviewFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-600 text-[22px]">✓</span>
                  </div>
                  <p className="text-[13px] font-semibold text-teal-600">{reviewFile.name}</p>
                  <p className="text-[12px] text-gray-400">{(reviewFile.size/1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <path d="M24 8v24M16 16l8-8 8 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 36c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-gray-700 text-center px-6">
                    Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
                  </p>
                  <p className="text-[12px] text-gray-400 text-center px-6">
                    .jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin
                  </p>
                </>
              )}
              <input id="review-file-inp" type="file"
                accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx"
                onChange={(e) => { if (e.target.files[0]) setReviewFile(e.target.files[0]); }}
                className="hidden" />
            </div>
          </div>

          {/* Izoh */}
          <textarea placeholder="Izohingiz" value={comment} onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-teal-400 resize-none mb-4" />

          <div className="flex items-center justify-end gap-3">
            <button onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
              Bekor qilish
            </button>
            <button onClick={handleCheck} disabled={checking}
              className="px-6 py-2.5 text-[13px] font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 rounded-xl cursor-pointer transition-colors">
              {checking ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
