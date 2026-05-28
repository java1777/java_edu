import { useState, useEffect } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { groupsApi } from "../api/groups";
import { teachersApi } from "../api/teachers";
import { studentsApi } from "../api/students";
import { coursesApi } from "../api/courses";
import { useLanguage } from "../contexts/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [stats, setStats] = useState({
    groups: 0,
    courses: 0,
    students: 0,
    payments: 0,
    teachers: 0,
  });

  useEffect(() => {
    groupsApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.groups ?? []);
        setStats((p) => ({ ...p, groups: list.length }));
      })
      .catch(() => {});
    coursesApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.courses ?? []);
        setStats((p) => ({ ...p, courses: list.length }));
      })
      .catch(() => {});
    studentsApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.students ?? []);
        setStats((p) => ({ ...p, students: list.length }));
      })
      .catch(() => {});
    teachersApi
      .getAll()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res?.data ?? res?.teachers ?? []);
        setStats((p) => ({ ...p, teachers: list.length }));
      })
      .catch(() => {});
  }, []);

  const STATS = [
    {
      icon: <GroupsIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
      labelKey: "dashboard.groups",
      value: stats.groups,
    },
    {
      icon: <MenuBookIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
      labelKey: "dashboard.courses",
      value: stats.courses,
    },
    {
      icon: <SchoolIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
      labelKey: "dashboard.students",
      value: stats.students,
    },
    {
      icon: <CardGiftcardIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
      labelKey: "dashboard.payments",
      value: stats.payments,
    },
    {
      icon: <PersonIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
      labelKey: "dashboard.teachers",
      value: stats.teachers,
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                       flex flex-col items-center gap-2 cursor-pointer
                       transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-violet-100"
          >
            <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-1">
              {stat.icon}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {t(stat.labelKey)}
            </span>
            <span className="text-3xl font-extrabold text-gray-800">
              {stat.value}
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
