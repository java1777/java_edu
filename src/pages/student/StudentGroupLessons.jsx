import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { groupsApi } from "../../api/groups";
import { useLanguage } from "../../contexts/LanguageContext";

function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "lessons", "result", "items"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}

/* ── Maydon ajratuvchilar (mudofaaviy) ───────────────── */
function topicOf(l) {
  return l.topic ?? l.name ?? l.title ?? l.lesson?.topic ?? "—";
}
function videoCountOf(l) {
  if (Array.isArray(l.videos)) return l.videos.length;
  return (
    l.videoCount ??
    l.video_count ??
    l.videosCount ??
    l.videos_count ??
    0
  );
}
function lessonDateOf(l) {
  return l.date ?? l.lesson_date ?? l.created_at ?? l.createdAt ?? null;
}
/* ── Takror darslarni birlashtirish (sana + mavzu) ─────
   Bazada bir xil dars bir necha marta yaratilib qolgan bo'lishi mumkin.
   Bir xil sana+mavzuli darslardan bittasini ko'rsatamiz; vazifasi
   bor (statusi "Berilmagan" emas) variantni afzal ko'ramiz. */
function dedupKey(l) {
  const d = lessonDateOf(l);
  let day = "";
  if (d) {
    const dt = new Date(d);
    day = Number.isNaN(dt.getTime()) ? String(d) : dt.toISOString().slice(0, 10);
  }
  const topic = String(topicOf(l)).trim().toLowerCase();
  return `${day}__${topic}`;
}
function dedupLessons(list) {
  const map = new Map();
  for (const l of list) {
    const key = dedupKey(l);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, l);
      continue;
    }
    // Vazifasi bor variantni saqlab qolamiz
    if (hwStatusRaw(existing) == null && hwStatusRaw(l) != null) map.set(key, l);
  }
  return [...map.values()];
}

function hwStatusRaw(l) {
  return (
    l.homework_status ??
    l.hw_status ??
    l.status ??
    l.homework?.status ??
    (Array.isArray(l.homework) ? l.homework[0]?.status : null) ??
    l.homeworkStatus ??
    null
  );
}
function hwDeadlineOf(l) {
  // Backend bevosita deadline qaytarsa — o'shani ishlatamiz
  const explicit =
    l.homework_deadline ??
    l.deadline ??
    l.homework?.deadline ??
    (Array.isArray(l.homework) ? l.homework[0]?.deadline : null) ??
    l.homework?.end_date ??
    null;
  if (explicit) return explicit;

  // Aks holda: uy vazifa dars berilgandan keyin 24 soat ichida yuklanadi
  const base = lessonDateOf(l);
  if (!base) return null;
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

/* ── Sana formatlash: "11 Iyun, 2026" / "11 Iyun, 2026 20:00" ─ */
const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}
function fmtDateTime(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${fmtDate(d)} ${hh}:${mm}`;
}

/* ── Uy vazifa holati → label + rang ─────────────────── */
// Status → til-mustaqil kalit + rang. Label t() bilan render paytida olinadi.
const HW_STATUS_LABEL = {
  accepted: "sp.st_accepted",
  returned: "sp.st_returned",
  pending: "sp.st_pending",
  failed: "sp.st_failed",
  not_given: "sp.st_not_given",
};

function hwStatusMeta(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  const green = "bg-green-500 text-white";
  const amber = "bg-amber-500 text-white";
  const red = "bg-red-500 text-white";
  const gray = "bg-gray-400 text-white";
  const blue = "bg-blue-500 text-white";

  const map = {
    ACCEPTED: { key: "accepted", cls: green },
    CHECKED: { key: "accepted", cls: green },
    "QABUL QILINGAN": { key: "accepted", cls: green },
    REJECTED: { key: "returned", cls: amber },
    RETURNED: { key: "returned", cls: amber },
    QAYTARILGAN: { key: "returned", cls: amber },
    PENDING: { key: "pending", cls: blue },
    WAITING: { key: "pending", cls: blue },
    KUTAYOTGANLAR: { key: "pending", cls: blue },
    FAILED: { key: "failed", cls: red },
    EXPIRED: { key: "failed", cls: red },
    NOT_DONE: { key: "failed", cls: red },
    BAJARILMAGAN: { key: "failed", cls: red },
  };
  if (map[s]) return map[s];
  return { key: "not_given", cls: gray };
}

/* ── Filtr variantlari (til-mustaqil kalit) + dropdown rangi ─ */
const FILTERS = [
  { key: "all", i18n: "sp.f_all", cls: "bg-white text-gray-800" },
  { key: "accepted", i18n: "sp.st_accepted", cls: "bg-green-500 text-white" },
  { key: "not_given", i18n: "sp.st_not_given", cls: "bg-gray-400 text-white" },
  { key: "returned", i18n: "sp.st_returned", cls: "bg-amber-500 text-white" },
  { key: "failed", i18n: "sp.st_failed", cls: "bg-red-500 text-white" },
  { key: "pending", i18n: "sp.st_pending", cls: "bg-blue-500 text-white" },
];

export default function StudentGroupLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await groupsApi.getStudentLessonsAll(id);
        if (active) setLessons(toArray(res));
      } catch (err) {
        if (active) setError(err?.message || t("sp.lessons_error"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const rows = dedupLessons(lessons).filter((l) => {
    if (filter === "all") return true;
    return hwStatusMeta(hwStatusRaw(l)).key === filter;
  });
  const selectedFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  return (
    <div>
      {/* Title + back */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/student/my-groups")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
          title={t("sp.back")}
        >
          <ArrowBackIcon fontSize="small" />
        </button>
        <h1 className="text-lg font-bold text-gray-700">
          {t("sp.hw_status_title")}
        </h1>
      </div>

      {/* Filter */}
      <div className="mb-5" ref={ddRef}>
        <div className="relative w-full sm:w-64">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between border-2 border-orange-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-orange-400 cursor-pointer"
          >
            <span>{t(selectedFilter.i18n)}</span>
            <KeyboardArrowDownIcon
              fontSize="small"
              className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1">
              {FILTERS.map((f) => (
                <li key={f.key} className="px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter(f.key);
                      setOpen(false);
                    }}
                    className={`w-full text-left text-sm font-medium px-3 py-2 rounded-md cursor-pointer ${f.cls} ${
                      filter === f.key ? "ring-2 ring-offset-1 ring-orange-300" : ""
                    }`}
                  >
                    {t(f.i18n)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[13px]">
                <th className="px-5 py-4 font-semibold">{t("sp.col_topics")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_video")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_hw_status")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_hw_deadline")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_lesson_date")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {t("sp.no_lessons")}
                  </td>
                </tr>
              ) : (
                rows.map((l, i) => {
                  const meta = hwStatusMeta(hwStatusRaw(l));
                  // "Berilmagan" darsda vazifa yo'q — tugash vaqti ham bo'lmaydi
                  const deadline =
                    meta.key === "not_given" ? null : hwDeadlineOf(l);
                  return (
                    <tr
                      key={l.id ?? i}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() =>
                            l.id != null &&
                            navigate(`/student/my-groups/${id}/lessons/${l.id}`)
                          }
                          className="font-medium text-orange-500 hover:text-orange-600 hover:underline text-left cursor-pointer"
                        >
                          {topicOf(l)}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex w-7 h-7 rounded-full border border-blue-300 text-blue-500 items-center justify-center text-[12px] font-semibold">
                          {videoCountOf(l)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block text-[12px] font-medium px-3 py-1.5 rounded-md ${meta.cls}`}
                        >
                          {t(HW_STATUS_LABEL[meta.key])}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                        {deadline ? fmtDateTime(deadline) : "-"}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                        {fmtDate(lessonDateOf(l))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
