import { useState, useEffect } from "react";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import ArchiveIcon from "@mui/icons-material/Archive";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { groupsApi } from "../api/groups";
import { studentsApi } from "../api/students";
import { useLanguage } from "../contexts/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [stats, setStats] = useState({
    students: 0,
    groups: 0,
    payments: 0,
    debtors: 0,
    frozen: 0,
    archived: 0,
  });

  useEffect(() => {
    // GET /students — faol talabalar soni
    studentsApi.getAll(1, 1000)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.students ?? []);
        setStats((p) => ({ ...p, students: list.length }));
      })
      .catch(() => {});

    // GET /groups/all — guruhlar soni
    groupsApi.getAll()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.groups ?? []);
        setStats((p) => ({ ...p, groups: list.length }));
      })
      .catch(() => {});

    // GET /groups/archive — arxivdagi guruhlar soni
    groupsApi.getArchive()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.groups ?? []);
        setStats((p) => ({ ...p, archived: list.length }));
      })
      .catch(() => {});
  }, []);

  const CARDS = [
    {
      icon: <SchoolIcon sx={{ color: "#7C3AED", fontSize: 28 }} />,
      label: "Faol talabalar",
      value: stats.students,
    },
    {
      icon: <GroupsIcon sx={{ color: "#7C3AED", fontSize: 28 }} />,
      label: "Guruhlar",
      value: stats.groups,
    },
    {
      icon: <CreditCardIcon sx={{ color: "#7C3AED", fontSize: 28 }} />,
      label: "Joriy oy to'lovlar",
      value: stats.payments,
    },
    {
      icon: <WarningAmberIcon sx={{ color: "#7C3AED", fontSize: 28 }} />,
      label: "Qarzdorlar",
      value: stats.debtors,
    },
    {
      icon: <AcUnitIcon sx={{ color: "#7C3AED", fontSize: 28 }} />,
      label: "Muzlatilganlar",
      value: stats.frozen,
    },
    {
      icon: <ArchiveIcon sx={{ color: "#7C3AED", fontSize: 28 }} />,
      label: "Arxivdagilar",
      value: stats.archived,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">
          {t("dashboard.hello")}
        </h1>
        <p className="text-sm text-gray-400">{t("dashboard.welcome")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                       flex flex-col items-center gap-2
                       transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-violet-100"
          >
            <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-1">
              {card.icon}
            </div>
            <span className="text-[12px] text-gray-400 font-medium text-center">
              {card.label}
            </span>
            <span className="text-3xl font-extrabold text-gray-800">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span>{t("dashboard.schedule")}</span>
          {scheduleOpen ? (
            <ExpandLessIcon sx={{ color: "#7C3AED" }} />
          ) : (
            <ExpandMoreIcon sx={{ color: "#9CA3AF" }} />
          )}
        </button>
        {scheduleOpen && (
          <div className="px-5 py-8 text-sm text-gray-400 text-center border-t border-gray-50">
            {t("dashboard.no_schedule")}
          </div>
        )}
      </div>
    </>
  );
}
