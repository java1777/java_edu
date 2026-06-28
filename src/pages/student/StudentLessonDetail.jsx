import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { groupsApi } from "../../api/groups";
import { studentsApi } from "../../api/students";
import { getToken } from "../../hooks/useAuth";
import { useLanguage } from "../../contexts/LanguageContext";
import logoImg from "../../assets/logo-md.png";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

/* ── Mudofaaviy yordamchilar ─────────────────────────── */
function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "result", "items", "lessons", "videos", "homeworks"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}
function toObject(res) {
  if (Array.isArray(res)) return res[0] ?? null;
  if (res && typeof res === "object") return res.data ?? res.result ?? res;
  return null;
}
function topicOf(l) {
  return l?.topic ?? l?.name ?? l?.title ?? "—";
}
function dateOf(l) {
  return l?.date ?? l?.lesson_date ?? l?.created_at ?? l?.createdAt ?? null;
}
function videoCountOf(l) {
  if (Array.isArray(l?.videos)) return l.videos.length;
  return l?.videoCount ?? l?.video_count ?? l?.videosCount ?? l?.videos_count ?? 0;
}
function fileUrl(u) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${SERVER_ORIGIN}${u}`;
  return `${SERVER_ORIGIN}/files/${u}`;
}
function filesOf(o) {
  if (!o) return [];
  const f =
    o.files ??
    o.file ??
    o.attachments ??
    o.attachment ??
    o.fileUrl ??
    o.file_url ??
    o.url ??
    o.path ??
    null;
  if (!f) return [];
  return Array.isArray(f) ? f : [f];
}
// Fayl obyekti/satridan ko'rinadigan nom
function fileNameOf(f) {
  if (typeof f === "string") return f.split("/").pop();
  const raw =
    f?.originalname ??
    f?.original_name ??
    f?.name ??
    f?.filename ??
    f?.path ??
    f?.url ??
    f?.file_url ??
    "";
  return String(raw).split("/").pop() || "Fayl";
}
// Fayl yuklab olish havolasi
function fileLinkOf(f) {
  const raw =
    typeof f === "string"
      ? f
      : f?.url ?? f?.path ?? f?.file_url ?? f?.filename ?? f?.name ?? null;
  return fileUrl(raw);
}
// Video fayl nomi (masalan "70.2.mov")
function videoLabelOf(v) {
  if (typeof v === "string") return v.split("/").pop();
  const raw =
    v?.originalname ??
    v?.original_name ??
    v?.name ??
    v?.filename ??
    v?.title ??
    v?.path ??
    v?.url ??
    "";
  return String(raw).split("/").pop() || "video";
}
// Video fayl manzili — backend `/files/files/...` ko'rinishida saqlaydi
function videoFullUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${SERVER_ORIGIN}/files/files/${raw}`;
}

/* ── Sana formatlash: "21 Iyun, 2026" / "20:55 21 Iyun, 2026" ─ */
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
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} ${fmtDate(d)}`;
}

/* ── Uy vazifa muddati: dars + 24 soat (backend bermasa) ─ */
function deadlineOf(hw, lesson) {
  const explicit =
    hw?.deadline ?? hw?.end_date ?? hw?.due_date ?? hw?.dueDate ?? null;
  if (explicit) return explicit;
  const base = dateOf(lesson);
  if (!base) return null;
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

/* ── Uy vazifa holati → til-mustaqil kalit + rang ─────── */
const LD_STATUS_LABEL = {
  accepted: "sp.st_accepted",
  returned: "sp.st_returned",
  pending: "sp.st_pending",
  failed: "sp.st_failed",
};
function statusMeta(raw) {
  const s = String(raw ?? "").trim().toUpperCase();
  const map = {
    ACCEPTED: { key: "accepted", cls: "text-green-600" },
    CHECKED: { key: "accepted", cls: "text-green-600" },
    "QABUL QILINGAN": { key: "accepted", cls: "text-green-600" },
    REJECTED: { key: "returned", cls: "text-amber-600" },
    RETURNED: { key: "returned", cls: "text-amber-600" },
    QAYTARILGAN: { key: "returned", cls: "text-amber-600" },
    PENDING: { key: "pending", cls: "text-blue-600" },
    FAILED: { key: "failed", cls: "text-red-600" },
    BAJARILMAGAN: { key: "failed", cls: "text-red-600" },
  };
  if (map[s]) return map[s];
  return null;
}

/* ── Fayl quticha (skrinshotdek) — token bilan ochadi ── */
function FileChip({ file, variant }) {
  const name = fileNameOf(file);
  const url = fileLinkOf(file);

  async function open(e) {
    e.preventDefault();
    if (!url) return;
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      window.open(url, "_blank", "noopener"); // fallback
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      title={name}
      className="inline-flex items-center gap-2 max-w-60 border border-gray-200 bg-white rounded-lg px-3 py-2 hover:border-violet-300 hover:bg-violet-50/40 transition-colors cursor-pointer"
    >
      {variant === "attach" ? (
        <AttachFileIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
      ) : (
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
      )}
      <span className="text-[13px] text-gray-700 truncate">{name}</span>
    </button>
  );
}

export default function StudentLessonDetail() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [homework, setHomework] = useState(null); // vazifa (o'qituvchi bergan)
  const [own, setOwn] = useState(null); // talabaning javobi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [videoErr, setVideoErr] = useState(false);
  const [videoIdx, setVideoIdx] = useState(0); // default: 1-chi video
  const [refreshKey, setRefreshKey] = useState(0); // topshirgandan keyin qayta yuklash
  // Topshirish formasi
  const [subTitle, setSubTitle] = useState("");
  const [subFile, setSubFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [subError, setSubError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      setVideoIdx(0); // yangi darsda doim 1-chi video
      setSubError("");
      const [lRes, vRes, hRes, oRes] = await Promise.allSettled([
        groupsApi.getStudentLessonsAll(id),
        groupsApi.getLessonVideos(id, lessonId),
        groupsApi.getLessonHomeworks(id, lessonId),
        studentsApi.getOwnHomework(lessonId),
      ]);
      if (!active) return;
      if (lRes.status === "fulfilled") setLessons(toArray(lRes.value));
      if (vRes.status === "fulfilled") setVideos(toArray(vRes.value));
      // Ikkalasi ham { data: { homework, answer, result } } qaytaradi
      if (hRes.status === "fulfilled") setHomework(toObject(hRes.value));
      if (oRes.status === "fulfilled") setOwn(toObject(oRes.value));
      if (lRes.status === "rejected" && vRes.status === "rejected")
        setError(t("sp.load_error"));
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [id, lessonId, refreshKey]);

  const currentLesson = lessons.find((l) => String(l.id) === String(lessonId));
  // Dars videoCount = 0 bo'lsa — video yo'q (darslar yuklangach darrov bilamiz)
  const noVideo = currentLesson != null && videoCountOf(currentLesson) === 0;
  // Default: 1-chi video. videoIdx noto'g'ri bo'lsa ham 1-chiga tushadi.
  const selectedVideo = videos[videoIdx] ?? videos[0] ?? null;
  const videoUrl = videoFullUrl(
    selectedVideo &&
      (selectedVideo.video_url ??
        selectedVideo.url ??
        selectedVideo.file_url ??
        selectedVideo.path ??
        selectedVideo.link ??
        selectedVideo.videoUrl ??
        selectedVideo.src ??
        null),
  );

  // Video faylni Authorization (Bearer token) bilan olib, blob URL yasaymiz —
  // server faylni tokensiz bermaydi, shuning uchun to'g'ridan-to'g'ri <video src> ishlamaydi.
  useEffect(() => {
    let active = true;
    let revoked = null;
    (async () => {
      setVideoBlobUrl(null);
      setVideoErr(false);
      if (!videoUrl) return;
      try {
        const r = await fetch(videoUrl, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!r.ok) throw new Error(String(r.status));
        const blob = await r.blob();
        if (!active) return;
        const url = URL.createObjectURL(blob);
        revoked = url;
        setVideoBlobUrl(url);
      } catch {
        if (active) setVideoErr(true);
      }
    })();

    return () => {
      active = false;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [videoUrl]);

  // Video fayl nomi (masalan "2026-04-08 15.25.39.mp4")
  const videoName =
    selectedVideo &&
    (selectedVideo.originalname ??
      selectedVideo.original_name ??
      selectedVideo.name ??
      selectedVideo.filename ??
      selectedVideo.title ??
      null);

  // Ikkala endpoint ham bir xil shaklda: data = { homework, answer, result }
  // own = /homework/own, homework = /homeworks (zaxira)
  const homeworkObj = own?.homework ?? homework?.homework ?? homework ?? null;
  const answerObj = own?.answer ?? homework?.answer ?? null;
  const resultObj = own?.result ?? homework?.result ?? null;
  const homeworkId = homeworkObj?.id ?? null;

  // ── Uy vazifani topshirish (POST /students/homeworkAnswer/{homeworkId}) ──
  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!homeworkId) return;
    if (!subTitle.trim() && !subFile) {
      setSubError(t("sp.sub_error"));
      return;
    }
    setSubError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (subTitle.trim()) fd.append("title", subTitle.trim());
      if (subFile) fd.append("file", subFile);
      await studentsApi.homeworkAnswer(homeworkId, fd);
      setSubTitle("");
      setSubFile(null);
      setRefreshKey((k) => k + 1); // qayta yuklab, jo'natmani ko'rsatamiz
    } catch (err) {
      setSubError(err?.message || t("sp.submit_error"));
    } finally {
      setSubmitting(false);
    }
  }

  // ── Uyga vazifa ──
  const hwText =
    homeworkObj?.title ??
    homeworkObj?.task ??
    homeworkObj?.description ??
    homeworkObj?.text ??
    null;
  const hwFiles = filesOf(homeworkObj);
  const hwDate = homeworkObj?.created_at ?? homeworkObj?.createdAt ?? dateOf(currentLesson);
  // muddat: vazifa berilgandan keyin 24 soat
  const deadline = deadlineOf(homeworkObj, { created_at: hwDate });

  // ── Mening jo'natmalarim ──
  const ownText =
    answerObj?.title ??
    answerObj?.text ??
    answerObj?.answer ??
    answerObj?.description ??
    null;
  const ownFiles = filesOf(answerObj);
  const ownDate = answerObj?.created_at ?? answerObj?.createdAt ?? null;

  // ── O'qituvchi izohi (result) ──
  const ball =
    resultObj?.ball ?? resultObj?.score ?? resultObj?.grade ?? resultObj?.mark ?? null;
  const ownStatus = statusMeta(
    resultObj?.homeworkStatus ??
      resultObj?.status ??
      answerObj?.status ??
      null,
  );
  const teacherComment =
    resultObj?.comment ??
    resultObj?.text ??
    resultObj?.feedback ??
    resultObj?.reason ??
    resultObj?.title ??
    null;
  const reviewerRaw =
    resultObj?.reviewer?.name ??
    resultObj?.checker?.name ??
    resultObj?.teacher?.name ??
    resultObj?.checked_by?.name ??
    resultObj?.checker ??
    resultObj?.reviewer ??
    resultObj?.reviewerName ??
    resultObj?.checker_name ??
    resultObj?.teacher_name ??
    null;
  const reviewer = typeof reviewerRaw === "string" ? reviewerRaw : null;
  const reviewDate =
    resultObj?.created_at ?? resultObj?.updated_at ?? resultObj?.checked_at ?? null;

  return (
    <div className="h-full flex flex-col">
      {/* Title + back */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <button
          onClick={() => navigate(`/student/my-groups/${id}`)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
          title={t("sp.back")}
        >
          <ArrowBackIcon fontSize="small" />
        </button>
        <h1 className="text-lg font-bold text-gray-700">
          {topicOf(currentLesson) !== "—" ? topicOf(currentLesson) : t("sp.lesson")}
        </h1>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 shrink-0">
          {error}
        </div>
      )}

      {/* Ikki mustaqil scroll (lg+): chap (asosiy) va o'ng (darslar) */}
      <div className="lg:flex-1 lg:min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* ── Asosiy ustun (alohida scroll) ───────────── */}
        <div className="space-y-5 lg:overflow-y-auto lg:pr-1 pb-2">
          {/* Video */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {noVideo ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3">
                <img src={logoImg} alt="NajotEdu" className="w-20 h-20 object-contain opacity-90" />
                <p className="text-gray-500 font-semibold">{t("sp.no_video")}</p>
              </div>
            ) : loading ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                {t("common.loading")}
              </div>
            ) : videoUrl && videoBlobUrl ? (
              <div>
                <video
                  src={videoBlobUrl}
                  controls
                  className="w-full rounded-lg bg-black max-h-105"
                />
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  {topicOf(currentLesson)}
                  {videoName ? ` (${videoName})` : ""}
                </p>
              </div>
            ) : videoUrl && videoErr ? (
              <div className="h-56 flex flex-col items-center justify-center gap-2">
                <p className="text-red-500 font-semibold">{t("sp.video_failed")}</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-violet-600 hover:underline"
                >
                  {t("sp.open_new_tab")}
                </a>
              </div>
            ) : videoUrl ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                {t("sp.video_loading")}
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center gap-3">
                <img src={logoImg} alt="NajotEdu" className="w-20 h-20 object-contain opacity-90" />
                <p className="text-gray-500 font-semibold">{t("sp.no_video")}</p>
              </div>
            )}
          </div>

          {/* Vazifalarim */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-orange-500 font-bold">{t("sp.my_tasks")}</h2>
              {ball != null && (
                <span className="text-orange-500 font-bold text-sm">
                  {t("sp.score")}: {ball}
                </span>
              )}
            </div>

            {loading ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                {t("common.loading")}
              </div>
            ) : !homeworkObj && !answerObj && !resultObj ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                {t("sp.no_hw")}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Uyga vazifa */}
                {hwText && (
                  <div className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{t("sp.homework")}</h3>
                      {deadline && (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-1.5">
                          <WarningAmberIcon sx={{ fontSize: 16 }} />
                          {t("sp.hw_deadline")}: {fmtDateTime(deadline)}
                        </span>
                      )}
                      <span className="text-[13px] text-gray-400">
                        {t("sp.files_count")}: {hwFiles.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{hwText}</p>
                    {hwFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {hwFiles.map((f, i) => (
                          <FileChip key={i} file={f} variant="file" />
                        ))}
                      </div>
                    )}
                    <p className="text-right text-[13px] text-gray-400 mt-2">
                      {fmtDateTime(hwDate)}
                    </p>
                  </div>
                )}

                {/* Mening jo'natmalarim — jo'natilgan bo'lsa ko'rsatamiz */}
                {answerObj ? (
                  <div className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {t("sp.my_submissions")}
                      </h3>
                      <span className="text-[13px] text-gray-400">
                        {t("sp.files_count")}: {ownFiles.length}
                      </span>
                    </div>
                    {ownText && <p className="text-sm text-gray-600">{ownText}</p>}
                    {ownFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ownFiles.map((f, i) => (
                          <FileChip key={i} file={f} variant="attach" />
                        ))}
                      </div>
                    )}
                    <p className="text-right text-[13px] text-gray-400 mt-2">
                      {fmtDateTime(ownDate)}
                    </p>
                  </div>
                ) : (
                  homeworkId && (
                    /* Hali jo'natilmagan — topshirish formasi */
                    <form onSubmit={handleSubmitAnswer} className="px-5 py-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {t("sp.submit_hw")}
                      </h3>
                      <textarea
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                        placeholder={t("sp.comment_ph")}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-300 resize-y"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-[13px] text-violet-600 border border-violet-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-violet-50">
                          <AttachFileIcon sx={{ fontSize: 16 }} />
                          {subFile ? subFile.name : t("sp.choose_file")}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setSubFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {subFile && (
                          <button
                            type="button"
                            onClick={() => setSubFile(null)}
                            className="text-[13px] text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            {t("common.delete")}
                          </button>
                        )}
                      </div>
                      {subError && (
                        <p className="mt-2 text-[13px] text-red-500">{subError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="mt-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer"
                      >
                        {submitting ? t("sp.submitting") : t("sp.submit")}
                      </button>
                    </form>
                  )
                )}

                {/* O'qituvchi izohi */}
                {(teacherComment || ownStatus || reviewer) && (
                  <div className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {t("sp.teacher_comment")}
                      </h3>
                      {ownStatus && (
                        <span className={`text-[13px] font-semibold ${ownStatus.cls}`}>
                          {t(LD_STATUS_LABEL[ownStatus.key])}
                        </span>
                      )}
                    </div>
                    {teacherComment && (
                      <p className="text-sm text-gray-600">{teacherComment}</p>
                    )}
                    {reviewer && (
                      <p className="text-[13px] text-gray-400 mt-1">
                        {t("sp.reviewer")}: {reviewer}
                      </p>
                    )}
                    <p className="text-right text-[13px] text-gray-400 mt-2">
                      {fmtDateTime(reviewDate)}
                    </p>
                  </div>
                )}

                {/* Jo'natilgan bo'lsa — qayta topshirib bo'lmaydi */}
                {answerObj && (
                  <p className="px-5 py-3 text-center text-[13px] text-gray-400">
                    {t("sp.no_resubmit")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Darslar ro'yxati (o'ng panel, alohida scroll) ── */}
        <div className="space-y-2.5 lg:overflow-y-auto lg:pr-1 pb-2">
          {lessons.map((l) => {
            const active = String(l.id) === String(lessonId);
            const hasVideo = videoCountOf(l) > 0;

            // Joriy dars — ochilgan (akkordion), videolar radio ko'rinishida
            if (active) {
              return (
                <div
                  key={l.id}
                  className="rounded-xl border border-orange-200 bg-orange-100 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                    <div>
                      <p className="font-bold text-gray-800 text-[15px]">{topicOf(l)}</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        {t("sp.col_lesson_date")}: {fmtDate(dateOf(l))}
                      </p>
                    </div>
                    {hasVideo && (
                      <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                    )}
                  </div>

                  {videos.length > 0 && (
                    <div className="px-3 pb-3 space-y-2">
                      {videos.map((v, i) => {
                        const sel = i === videoIdx;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setVideoIdx(i)}
                            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left border transition-colors cursor-pointer
                              ${sel
                                ? "bg-orange-200/70 border-orange-300"
                                : "bg-orange-50 border-orange-100 hover:bg-orange-100"}`}
                          >
                            {sel ? (
                              <PlayCircleFilledIcon sx={{ fontSize: 18, color: "#F97316" }} />
                            ) : (
                              <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                            )}
                            <span className="text-[14px] font-semibold text-gray-700 truncate">
                              {i + 1}-video: {videoLabelOf(v)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Boshqa darslar — bosilsa o'sha darsga o'tadi
            return (
              <button
                key={l.id}
                onClick={() => navigate(`/student/my-groups/${id}/lessons/${l.id}`)}
                className="w-full text-left rounded-xl border bg-orange-50/40 border-orange-50 hover:bg-orange-50 px-4 py-3.5 transition-colors cursor-pointer flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-bold text-gray-800 text-[15px]">{topicOf(l)}</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    Dars sanasi: {fmtDate(dateOf(l))}
                  </p>
                </div>
                {hasVideo && (
                  <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
