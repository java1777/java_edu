import { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useLanguage } from "../../contexts/LanguageContext";

const DAY_ABBR = {
  monday: "Du",
  tuesday: "Se",
  wednesday: "Ch",
  thursday: "Pa",
  friday: "Ju",
  saturday: "Sha",
  sunday: "Ya",
};

function daysOf(group) {
  const raw =
    group.week_day ?? group.weekDays ?? group.week_days ?? group.days ?? [];
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((d) => DAY_ABBR[String(d).toLowerCase()] ?? d).join(", ") || "—";
}

function fmtTime(t) {
  return t ? String(t).slice(0, 5) : null; // "16:00:00" -> "16:00"
}

function timeOf(group) {
  const s = fmtTime(group.start_time ?? group.startTime);
  const e = fmtTime(group.end_time ?? group.endTime);
  if (s && e) return `${s} - ${e}`;
  return s ?? "—";
}

function teachersOf(group) {
  return Array.isArray(group.teachers) ? group.teachers : [];
}

function isFinished(g) {
  const s = String(g.status ?? "").toUpperCase();
  if (s) return ["FINISHED", "TUGAGAN", "INACTIVE", "CLOSED"].includes(s);
  if (typeof g.is_active === "boolean") return !g.is_active;
  if (typeof g.active === "boolean") return !g.active;
  return false;
}

export default function GroupTeachersModal({ group, onClose }) {
  const { t } = useLanguage();
  // Esc bilan yopish
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const teachers = teachersOf(group);
  const days = daysOf(group);
  const time = timeOf(group);
  const status = isFinished(group)
    ? t("sp.status_finished")
    : t("sp.status_active");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {group.name || group.title || "Guruh"}
            </h2>
            <p className="text-sm text-violet-500 font-medium mt-0.5">{status}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Table */}
        <div className="px-6 pb-6 overflow-y-auto">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[13px]">
                    <th className="px-5 py-3.5 font-semibold">{t("sp.col_teacher")}</th>
                    <th className="px-5 py-3.5 font-semibold">{t("sp.tm_role")}</th>
                    <th className="px-5 py-3.5 font-semibold">{t("sp.tm_days")}</th>
                    <th className="px-5 py-3.5 font-semibold">{t("sp.tm_time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-gray-400 text-sm"
                      >
                        {t("sp.tm_none")}
                      </td>
                    </tr>
                  ) : (
                    teachers.map((tc, i) => (
                      <tr
                        key={tc.id ?? i}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-gray-800 font-medium text-sm">
                          {tc.full_name ?? tc.name ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 text-sm">
                          {(tc.role ?? tc.position ?? "TEACHER")
                            .toString()
                            .toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 text-sm">{days}</td>
                        <td className="px-5 py-3.5 text-gray-600 text-sm">{time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
