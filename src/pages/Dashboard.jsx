import { useState } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const STATS = [
  {
    icon: <GroupsIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
    label: "Guruhlar",
    value: 0,
  },
  {
    icon: <MenuBookIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
    label: "Fanlar",
    value: 0,
  },
  {
    icon: <SchoolIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
    label: "Talabalar",
    value: 1,
  },
  {
    icon: <CardGiftcardIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
    label: "To'lovlar",
    value: 3,
  },
  {
    icon: <PersonIcon sx={{ color: "#7C3AED", fontSize: 30 }} />,
    label: "O'qituvchilar",
    value: 0,
  },
];

export default function Dashboard() {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">
          Salom, creator!
        </h1>
        <p className="text-sm text-gray-400">
          EduJava platformasiga xush kelibsiz!
        </p>
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
              {stat.label}
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
          className="w-full flex items-center justify-between px-5 py-4
                     text-gray-700 font-semibold hover:bg-gray-50
                     transition-colors cursor-pointer"
        >
          <span>Dars Jadvali</span>
          {scheduleOpen ? (
            <ExpandLessIcon sx={{ color: "#7C3AED" }} />
          ) : (
            <ExpandMoreIcon sx={{ color: "#9CA3AF" }} />
          )}
        </button>
        {scheduleOpen && (
          <div className="px-5 py-8 text-sm text-gray-400 text-center border-t border-gray-50">
            Hozircha dars jadvali mavjud emas.
          </div>
        )}
      </div>
    </>
  );
}
