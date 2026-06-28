import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { homeworkApi } from "../api/homework";
import { useLanguage } from "../contexts/LanguageContext";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

const MONTHS = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyun",
  "Iyul",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

function fmt(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fixUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${SERVER_ORIGIN}/files/${url}`;
}

export default function HomeworkReview() {
  const { groupId, homeworkId, studentId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useLanguage();

  const STATUS = {
    PENDING: {
      label: t("hrv.pending"),
      cls: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    CHECKED: {
      label: t("hrv.checked"),
      cls: "bg-blue-100 text-blue-700 border-blue-300",
    },
    ACCEPTED: {
      label: t("hrv.accepted"),
      cls: "bg-green-100 text-green-700 border-green-300",
    },
    REJECTED: {
      label: t("hrv.rejected_status"),
      cls: "bg-red-100 text-red-700 border-red-300",
    },
  };

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [grade, setGrade] = useState(60);
  const [comment, setComment] = useState("");
  const [checkDone, setCheckDone] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [reviewFile, setReviewFile] = useState(null);
  const [reviewDragging, setReviewDragging] = useState(false);

  // O'quvchi topshirig'ini yuklaymiz (fayl, izoh, status ko'rsatish + qayta baholash)
  useEffect(() => {
    const lessonId = state?.lessonId;
    const sid = Number(state?.studentId ?? studentId ?? 0);
    if (!lessonId || !sid) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await homeworkApi.getStudentHomework(
          groupId,
          lessonId,
          homeworkId,
          sid,
        );
        if (!alive) return;
        const d = res?.data ?? res;
        setResult(d);
        // Oldin qaytarilgan bo'lsa — o'sha ballni sliderga qo'yamiz.
        // Ball data.homeworkResult.grade da turadi.
        const hr = d?.homeworkResult ?? d?.result ?? {};
        const prev =
          hr.grade ??
          hr.ball ??
          hr.score ??
          d?.ball ??
          d?.grade ??
          d?.score ??
          state?.grade;
        if (prev != null && !Number.isNaN(Number(prev))) setGrade(Number(prev));
      } catch {
        // ma'lumot kelmasa state'dagi bilan ishlaymiz
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [groupId, homeworkId, studentId, state]);

  // state orqali kelgan ma'lumotlar (PENDING list dan)
  const answerId = state?.answerId ?? Number(studentId);
  const statusKey = state?.status ?? result?.status ?? "PENDING";
  const studentName =
    state?.studentName ??
    result?.students?.full_name ??
    result?.student?.full_name ??
    result?.full_name ??
    `O'quvchi`;
  const submittedAt = state?.submittedAt ?? result?.created_at;

  async function handleCheck() {
    const sid = Number(state?.answerId ?? studentId ?? 0);
    const realStudentId = Number(state?.studentId ?? studentId ?? 0);
    const lessonId = state?.lessonId ?? null;
    if (!sid && !realStudentId) {
      setError("Student ID topilmadi — baholab bo'lmaydi.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      // To'g'ri homework_answer_id ni o'quvchining topshirig'idan olamiz:
      // GET /group/{g}/lesson/{l}/homework/{h}/student/{s} → data.answer.id
      let hwAnswerId = sid || realStudentId;
      if (lessonId && realStudentId) {
        try {
          const res = await homeworkApi.getStudentHomework(
            groupId,
            lessonId,
            homeworkId,
            realStudentId,
          );
          // Javob: { data: { id: <homework_answer_id>, students, homework, ... } }
          const d = res?.data ?? res;
          const found =
            d?.id ??
            d?.answer?.id ??
            d?.homework_answer_id ??
            d?.answer?.homework_answer_id;
          if (found) hwAnswerId = Number(found);
        } catch {
          // topa olmasak — eski qiymat bilan urinib ko'ramiz
        }
      }

      await homeworkApi.check(groupId, homeworkId, {
        grade: Number(grade),
        title: comment || " ",
        homework_answer_id: hwAnswerId,
      });
      setCheckDone(true);
    } catch (err) {
      setError(err.message ?? "Baholashda xatolik yuz berdi.");
    } finally {
      setChecking(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-[13px]">
        Yuklanmoqda...
      </div>
    );

  const statusInfo = STATUS[statusKey] ?? STATUS.PENDING;
  const answerText =
    result?.title ?? result?.answer ?? result?.description ?? result?.text;
  const files = (
    Array.isArray(result?.files)
      ? result.files
      : result?.file
        ? [result.file]
        : []
  ).map((f) => (typeof f === "string" ? { filename: f, name: f } : f));
  const homeworkDesc =
    result?.homework?.description ??
    result?.homework?.title ??
    state?.homeworkTopic ??
    null;

  const isImage = (f) => {
    const name = (f.name ?? f.filename ?? f.original_name ?? "").toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
  };

  return (
    <div className="py-6 px-4 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 18, color: "#374151" }} />
        </button>
        <span
          className="text-[13px] text-gray-500 cursor-pointer hover:underline"
          onClick={() => navigate(-1)}
        >
          Kutayotganlar
        </span>
        <span className="text-gray-300">›</span>
        <span className="text-[13px] text-teal-500 font-medium">
          {t("hrv.homework_task")}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      {checkDone && (
        <div className="bg-green-50 text-green-700 text-[13px] font-semibold px-4 py-3 rounded-xl mb-4">
          ✓ {t("hrv.success")}
        </div>
      )}

      {/* Homework task */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-[15px] font-bold text-gray-800 mb-3">
          {t("hrv.homework_task")}
        </h2>
        {homeworkDesc ? (
          <>
            <p className="text-[13px] text-gray-400 mb-1">Izoh:</p>
            <p className="text-[14px] text-gray-700">{homeworkDesc}</p>
          </>
        ) : (
          <p className="text-[13px] text-gray-400">{t("hrv.no_comment")}</p>
        )}
      </div>

      {/* Student submission */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-[17px] font-bold text-gray-800 mb-4">
          {studentName}
        </h2>

        {/* Meta */}
        <div className="bg-white rounded-xl p-4 flex flex-wrap gap-6 mb-4 border border-gray-100">
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">{t("hrv.time")}</p>
            <p className="text-[14px] font-bold text-gray-800">
              {fmt(submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">
              {t("hrv.files_count")}
            </p>
            <p className="text-[14px] font-bold text-gray-800">
              {files.length}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">
              {t("hrv.status")}
            </p>
            <span
              className={`text-[12px] font-semibold px-3 py-1 rounded-lg border ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Files */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
            <p className="text-[13px] text-gray-500 mb-3">
              Fayl:{" "}
              <span className="font-bold text-gray-800">{files.length}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => {
                const url = fixUrl(f.url ?? f.path ?? f.filename ?? f.file_url);
                const name =
                  f.name ?? f.original_name ?? f.filename ?? `Fayl ${i + 1}`;
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
                  <a
                    key={i}
                    href={url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[13px] text-blue-500 hover:underline"
                  >
                    📎 {name}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Answer text */}
        {answerText && (
          <div
            className="bg-white rounded-xl pl-4 pr-4 py-3"
            style={{
              borderLeft: "4px solid #C4B5FD",
              border: "1px solid #F3F4F6",
              borderLeft: "4px solid #C4B5FD",
            }}
          >
            <p className="text-[12px] text-gray-400 mb-1">Uyga vazifa izohi:</p>
            <p className="text-[13px] text-blue-500 break-all whitespace-pre-wrap">
              {answerText}
            </p>
          </div>
        )}
      </div>

      {/* Grade section */}
      {!checkDone && (statusKey === "PENDING" || statusKey === "REJECTED") && (
        <>
          {/* Info */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-700 text-[13px] px-4 py-3 rounded-xl mb-4">
            <span className="text-blue-500 text-[16px] mt-0.5 shrink-0">ℹ</span>
            <span>{t("hrv.info_text")}</span>
          </div>

          {/* Ball card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p className="text-[15px] font-bold text-gray-800 mb-4">
              {t("hrv.ball")}
            </p>
            <div className="flex items-center gap-4 mb-2">
              <input
                type="range"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${Number(grade) >= 60 ? "#10B981" : "#EF4444"} ${grade}%, #E5E7EB ${grade}%)`,
                }}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) =>
                  setGrade(Math.min(100, Math.max(0, Number(e.target.value))))
                }
                className="w-16 border border-gray-200 rounded-xl px-2 py-1.5 text-[14px] font-bold text-center outline-none focus:border-teal-400"
              />
            </div>
            <p className="text-[12px] text-gray-400 text-center mb-4">
              {t("hrv.pass_mark")}
            </p>
            <div
              className={`w-full py-3 rounded-xl text-[14px] font-semibold text-center
              ${Number(grade) >= 60 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
            >
              {Number(grade) >= 60
                ? t("hrv.will_accept")
                : t("hrv.will_reject")}
            </div>
          </div>

          {/* Fayllar card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p className="text-[15px] font-bold text-gray-800 mb-4">
              {t("hrv.files")}
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setReviewDragging(true);
              }}
              onDragLeave={() => setReviewDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setReviewDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) setReviewFile(f);
              }}
              onClick={() => document.getElementById("review-file-inp").click()}
              className={`border-2 border-dashed rounded-2xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                ${reviewDragging ? "border-teal-400 bg-teal-50" : reviewFile ? "border-teal-400 bg-teal-50" : "border-teal-300 hover:border-teal-400"}`}
            >
              {reviewFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-600 text-[22px]">✓</span>
                  </div>
                  <p className="text-[13px] font-semibold text-teal-600">
                    {reviewFile.name}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    {(reviewFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4v12M8 8l4-4 4 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 18c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-gray-700 text-center px-6">
                    {t("hrv.upload_hint")}
                  </p>
                  <p className="text-[12px] text-gray-400 text-center px-6">
                    {t("hrv.upload_formats")}
                  </p>
                </>
              )}
              <input
                id="review-file-inp"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files[0]) setReviewFile(e.target.files[0]);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Izoh card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 relative">
            <textarea
              placeholder={t("hrv.comment")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full text-[13px] outline-none resize-none text-gray-700 placeholder-gray-400"
            />
            <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shadow cursor-pointer hover:bg-teal-600 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                  fill="white"
                />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Xato — tugmalar yonida ham ko'rsatamiz (tepaga scroll shart emas) */}
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-3">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer"
            >
              {t("hrv.cancel")}
            </button>
            <button
              onClick={handleCheck}
              disabled={checking}
              className="px-6 py-2.5 text-[13px] font-semibold text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-60 rounded-2xl cursor-pointer transition-colors"
            >
              {checking ? t("hrv.submitting") : t("hrv.submit")}
            </button>
          </div>
        </>
      )}

      {/* Image preview modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
