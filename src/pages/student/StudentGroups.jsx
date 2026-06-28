import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentsApi } from "../../api/students";
import GroupTeachersModal from "./GroupTeachersModal";
import { useLanguage } from "../../contexts/LanguageContext";

function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "groups", "result", "items"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}

function idOf(g) {
  return (
    g.id ??
    g.group_id ??
    g.groupId ??
    g.group?.id ??
    g.groupID ??
    null
  );
}

function nameOf(g) {
  return (
    g.name ??
    g.title ??
    g.group_name ??
    g.groupName ??
    g.group?.name ??
    g.group?.title ??
    g.nomi ??
    null
  );
}

function directionOf(g) {
  return (
    g.course?.name ??
    g.group?.course?.name ??
    g.direction ??
    g.courseName ??
    g.yonalish ??
    "—"
  );
}

function teachersOf(g) {
  return Array.isArray(g.teachers) ? g.teachers : [];
}

function startOf(g) {
  const d = g.start_date ?? g.startDate ?? g.start_time ?? null;
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isFinished(g) {
  const s = String(g.status ?? "").toUpperCase();
  if (s) return ["FINISHED", "TUGAGAN", "INACTIVE", "CLOSED"].includes(s);
  if (typeof g.is_active === "boolean") return !g.is_active;
  if (typeof g.active === "boolean") return !g.active;
  return false;
}

export default function StudentGroups() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("faol"); // faol | tugagan
  const [selected, setSelected] = useState(null); // o'qituvchilar modali uchun

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await studentsApi.getMyGroups();
        if (active) setGroups(toArray(res));
      } catch (err) {
        if (active) setError(err?.message || "Ma'lumotlarni yuklab bo'lmadi");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = groups.filter((g) =>
    tab === "tugagan" ? isFinished(g) : !isFinished(g),
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-5">
        {[
          { key: "faol", label: t("sp.tab_active") },
          { key: "tugagan", label: t("sp.tab_finished") },
        ].map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`pb-3 text-[15px] font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
              tab === tb.key
                ? "text-orange-500 border-orange-500"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[13px]">
                <th className="px-5 py-4 font-semibold w-16">#</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_group")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_direction")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_teacher")}</th>
                <th className="px-5 py-4 font-semibold">{t("sp.col_start")}</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {tab === "tugagan" ? t("sp.no_finished") : t("sp.no_active")}
                  </td>
                </tr>
              ) : (
                filtered.map((g, i) => {
                  const teachers = teachersOf(g);
                  const gid = idOf(g);
                  return (
                    <tr
                      key={gid ?? i}
                      onClick={() => gid != null && navigate(`/student/my-groups/${gid}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-violet-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 text-gray-500 text-sm">{i + 1}</td>
                      <td className="px-5 py-4 font-semibold text-violet-700 text-sm">
                        {nameOf(g) || `Guruh #${gid ?? i + 1}`}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">
                        {directionOf(g)}
                      </td>
                      <td className="px-5 py-4">
                        {teachers.length > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(g);
                            }}
                            title={t("sp.view_teachers")}
                            className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[12px] font-bold hover:bg-orange-200 transition-colors cursor-pointer"
                          >
                            {teachers.length}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{startOf(g)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <GroupTeachersModal group={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
