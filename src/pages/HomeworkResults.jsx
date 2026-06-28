import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { homeworkApi } from "../api/homework";
import { useLanguage } from "../contexts/LanguageContext";
import { usePanelBase } from "../hooks/usePanelBase";

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

export default function HomeworkResults() {
  const { groupId, homeworkId } = useParams();
  const { t } = useLanguage();
  const base = usePanelBase();

  const TABS = [
    { key: "PENDING", label: t("hr.tab_pending") },
    { key: "REJECTED", label: t("hr.tab_rejected") },
    { key: "ACCEPTED", label: t("hr.tab_accepted") },
    { key: "CHECKED", label: t("hr.tab_checked") },
  ];
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("PENDING");
  const [counts, setCounts] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [homework, setHomework] = useState(null);

  // Homework ma'lumotlarini (title, deadline) group ro'yxatidan olish
  useEffect(() => {
    homeworkApi
      .getByGroup(groupId)
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.homeworks)
              ? res.data.homeworks
              : Array.isArray(res?.homeworks)
                ? res.homeworks
                : [];
        // homeworkId = submission ID (hw.homework[0].id) yoki assignment ID (hw.id)
        const hw = list.find(
          (h) =>
            String(h.id) === String(homeworkId) ||
            (Array.isArray(h.homework) &&
              h.homework.some((s) => String(s.id) === String(homeworkId))),
        );
        if (hw) setHomework(hw);
      })
      .catch(() => {});
  }, [groupId, homeworkId]);

  // CHECKED uchun status yubormaymiz — backend statussiz bajarilmaganlarni qaytaradi
  function apiStatus(key) {
    return key === "CHECKED" ? null : key;
  }

  // Har bir tab uchun sonni bir vaqtda yuklaymiz
  useEffect(() => {
    TABS.forEach(({ key }) => {
      homeworkApi
        .getResults(groupId, homeworkId, apiStatus(key))
        .then((res) => {
          const raw =
            res?.data?.students ??
            res?.data ??
            res?.students ??
            (Array.isArray(res) ? res : []);
          const list = Array.isArray(raw) ? raw : [];
          setCounts((p) => ({ ...p, [key]: list.length }));
          if (key === "PENDING") {
            setResults((p) => ({ ...p, PENDING: list }));
          }
        })
        .catch(() => setCounts((p) => ({ ...p, [key]: 0 })));
    });
  }, [groupId, homeworkId]);

  // Tab bosiganda ma'lumot yuklash (har bir tab bir marta yuklanadi)
  const loadTab = useCallback(
    async (key) => {
      if (results[key] !== undefined) return;
      setLoading(true);
      try {
        const res = await homeworkApi.getResults(
          groupId,
          homeworkId,
          apiStatus(key),
        );
        const raw =
          res?.data?.students ??
          res?.data ??
          res?.students ??
          (Array.isArray(res) ? res : []);
        let list = Array.isArray(raw) ? raw : [];

        // ACCEPTED uchun har bir student'ning grade'ini getResult orqali olamiz
        if (key === "ACCEPTED" && list.length > 0) {
          const enriched = await Promise.all(
            list.map(async (r) => {
              try {
                const detail = await homeworkApi.getResult(
                  groupId,
                  homeworkId,
                  r.id,
                );
                const grade =
                  detail?.data?.grade ??
                  detail?.data?.score ??
                  detail?.grade ??
                  detail?.score ??
                  null;
                const checkedAt =
                  detail?.data?.checked_at ??
                  detail?.data?.updated_at ??
                  detail?.checked_at ??
                  detail?.updated_at ??
                  null;
                return { ...r, grade, checked_at: checkedAt };
              } catch {
                return r;
              }
            }),
          );
          list = enriched;
        }

        setResults((p) => ({ ...p, [key]: list }));
      } catch {
        setResults((p) => ({ ...p, [key]: [] }));
      } finally {
        setLoading(false);
      }
    },
    [groupId, homeworkId, results],
  );

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  const list = results[activeTab] ?? [];
  // Baholash uchun kerak: GET .../lesson/{lessonId}/homework/{homeworkId}/student/{studentId}
  // getByGroup javobida tashqi obyekt = DARS (lesson), uning .id = lessonId,
  // ichki homework[].id = homeworkId. Shuning uchun lessonId = matched.id.
  const lessonId =
    homework?.lesson?.id ?? homework?.lesson_id ?? homework?.id ?? null;

  return (
    <div className="py-6 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <h1 className="text-[20px] font-bold text-gray-800">
          {homework?.topic ?? homework?.title ?? t("hr.homework")}
        </h1>
      </div>

      {/* Meta card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-5 flex items-center justify-between">
        <div className="flex gap-12">
          <div>
            <p className="text-[12px] text-gray-400 mb-1">{t("hr.topic")}</p>
            <p className="text-[15px] font-bold text-gray-800">
              {homework?.topic ?? homework?.title ?? "—"}
            </p>
          </div>
          {(homework?.deadline ?? homework?.due_date) && (
            <div>
              <p className="text-[12px] text-gray-400 mb-1">
                {t("hr.deadline")}
              </p>
              <p className="text-[14px] font-semibold text-gray-700">
                {fmt(homework.deadline ?? homework.due_date)}
              </p>
            </div>
          )}
        </div>
        <button className="border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 px-4 py-1.5 rounded-lg cursor-pointer transition-colors">
          {t("hr.announce")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 mb-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap
              ${
                activeTab === key
                  ? "text-green-600 border-green-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
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
          <p className="text-center text-[13px] text-gray-400 py-10">
            {t("hr.loading")}
          </p>
        ) : list.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-10">
            {t("hr.no_data")}
          </p>
        ) : activeTab === "PENDING" ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">
                  {t("hr.student_name")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400 text-right pr-6">
                  {t("hr.submitted_at")}
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const name =
                  r.student?.full_name ??
                  r.Student?.full_name ??
                  r.full_name ??
                  `#${i + 1}`;
                const answerId = r.id;
                const studentId =
                  r.student?.id ??
                  r.Student?.id ??
                  r.student_id ??
                  r.user_id ??
                  r.id;
                return (
                  <tr
                    key={r.id ?? i}
                    onClick={() =>
                      navigate(
                        `${base}/groups/${groupId}/homework/${homeworkId}/student/${answerId}/review`,
                        {
                          state: {
                            studentName: name,
                            submittedAt: r.created_at ?? r.submitted_at,
                            answerId,
                            studentId,
                            lessonId,
                            status: "PENDING",
                          },
                        },
                      )
                    }
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-[13px] text-gray-800">
                      {name}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 text-right pr-6">
                      {fmt(r.created_at ?? r.submitted_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : activeTab === "REJECTED" ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">
                  {t("hr.student_name")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">
                  {t("hr.submitted_time")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">
                  {t("hr.deadline_col")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400 text-right pr-6">
                  {t("hr.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const name =
                  r.student?.full_name ??
                  r.Student?.full_name ??
                  r.full_name ??
                  `#${i + 1}`;
                const studentId =
                  r.student?.id ?? r.Student?.id ?? r.student_id ?? r.id;
                const deadline =
                  r.homework?.deadline ??
                  r.homework?.due_date ??
                  r.deadline ??
                  homework?.deadline ??
                  homework?.due_date ??
                  null;
                const goReview = () =>
                  navigate(
                    `${base}/groups/${groupId}/homework/${homeworkId}/student/${r.id}/review`,
                    {
                      state: {
                        studentName: name,
                        submittedAt: r.created_at ?? r.submitted_at,
                        answerId: r.id,
                        studentId,
                        lessonId,
                        grade: r.grade ?? r.score ?? r.ball ?? null,
                        status: "REJECTED",
                      },
                    },
                  );
                return (
                  <tr
                    key={r.id ?? i}
                    onClick={goReview}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-[13px] text-gray-800">
                      {name}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">
                      {fmt(r.created_at ?? r.submitted_at)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">
                      {fmt(deadline)}
                    </td>
                    <td className="px-5 py-3.5 text-right pr-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goReview();
                        }}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl font-bold"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : activeTab === "ACCEPTED" ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-[12px] font-semibold text-teal-500">
                  {t("hr.student_name")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-teal-500">
                  {t("hr.checked_time")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-teal-500">
                  {t("hr.grade")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400 text-right pr-6">
                  {t("hr.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const name =
                  r.student?.full_name ??
                  r.Student?.full_name ??
                  r.full_name ??
                  `#${i + 1}`;
                const studentId =
                  r.student?.id ?? r.Student?.id ?? r.student_id ?? r.id;
                const grade = r.grade ?? r.score ?? r.ball ?? null;
                const checkedAt =
                  r.checked_at ??
                  r.reviewed_at ??
                  r.updated_at ??
                  r.created_at ??
                  null;
                return (
                  <tr
                    key={r.id ?? i}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[13px] text-gray-800 font-medium">
                      {name}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">
                      {fmt(checkedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-bold text-teal-600">
                      {grade != null ? grade : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right pr-6">
                      <button
                        onClick={() =>
                          navigate(
                            `${base}/groups/${groupId}/homework/${homeworkId}/student/${studentId}/review`,
                          )
                        }
                        className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl font-bold"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          // CHECKED — Bajarilmagan
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400">
                  {t("hr.student_name")}
                </th>
                <th className="px-5 py-3.5 text-[12px] font-semibold text-gray-400 text-right pr-6">
                  {t("hr.deadline_col")}
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const name =
                  r.student?.full_name ??
                  r.Student?.full_name ??
                  r.full_name ??
                  `#${i + 1}`;
                const deadline =
                  r.homework?.deadline ??
                  r.deadline ??
                  homework?.deadline ??
                  null;
                return (
                  <tr
                    key={r.id ?? i}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[13px] text-gray-800">
                      {name}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 text-right pr-6">
                      {fmt(deadline)}
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
