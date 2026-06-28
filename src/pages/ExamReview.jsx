import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { examsApi } from "../api/exams";

const STATUS_MAP = {
  1: {
    label: "Kutayabti",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  2: {
    label: "Qabul qilindi",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  3: { label: "Rad etildi", color: "bg-red-100 text-red-700 border-red-300" },
};

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

function formatDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ExamReview() {
  const { groupId, examId, studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = Number(searchParams.get("status") ?? 1);

  const [exam, setExam] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    // GET /exams/{examId} — imtihon ma'lumotlari
    // GET /group/{groupId}/exams/{examId}/student/{studentId}/review — o'quvchi javobi
    Promise.all([
      examsApi.getOne(examId).catch(() => null),
      examsApi
        .getStudentReview(groupId, examId, studentId, status)
        .catch(() => null),
    ])
      .then(([examRes, reviewRes]) => {
        setExam(examRes?.data ?? examRes);
        setReview(reviewRes?.data ?? reviewRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [groupId, examId, studentId, status]);

  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP[1];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-[13px]">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <span className="text-[13px] text-gray-400">Kutayotganlar</span>
        <span className="text-gray-300">›</span>
        <span className="text-[13px] font-semibold text-gray-700">Imtihon</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Imtihon vazifasi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="text-[15px] font-bold text-gray-800 mb-3">
          Imtihon vazifasi
        </h2>
        {exam ? (
          <>
            <p className="text-[13px] text-gray-500 mb-1">Imtihon izohi:</p>
            <div
              className="text-[13px] text-gray-700"
              dangerouslySetInnerHTML={{
                __html: exam.description ?? exam.title ?? "—",
              }}
            />
          </>
        ) : (
          <p className="text-[13px] text-gray-400">Ma'lumot topilmadi</p>
        )}
      </div>

      {/* O'quvchi javobi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-[15px] font-bold text-gray-800 mb-4">
          {review?.student?.full_name ??
            review?.studentName ??
            `O'quvchi #${studentId}`}
        </h2>

        <div className="flex items-center gap-8 mb-4">
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Vaqti:</p>
            <p className="text-[13px] font-semibold text-gray-800">
              {formatDateTime(review?.created_at ?? review?.submitted_at)}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Fayllar soni:</p>
            <p className="text-[13px] font-semibold text-gray-800">
              {review?.files?.length ?? review?.file_count ?? 0}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 mb-0.5">Status:</p>
            <span
              className={`text-[12px] font-semibold px-3 py-1 rounded-lg border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Javob matni */}
        {(review?.description ?? review?.answer ?? review?.text) && (
          <div className="border-l-4 border-violet-300 pl-4 mt-3">
            <p className="text-[12px] text-gray-400 mb-1">Uyga vazifa izohi:</p>
            <p className="text-[13px] text-gray-700">
              {review?.description ?? review?.answer ?? review?.text}
            </p>
          </div>
        )}

        {/* Fayllar */}
        {Array.isArray(review?.files) && review.files.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {review.files.map((f, i) => (
              <a
                key={i}
                href={f.url ?? f.path ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[13px] text-blue-500 hover:underline"
              >
                📎 {f.name ?? f.filename ?? `Fayl ${i + 1}`}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
