import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { studentsApi } from "../../api/students";
import { useLanguage } from "../../contexts/LanguageContext";

function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "groups", "result", "items"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}

export default function StudentHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [count, setCount] = useState(null);
  const userName = localStorage.getItem("user_name") || t("sp.role");

  useEffect(() => {
    let active = true;
    studentsApi
      .getMyGroups()
      .then((res) => {
        if (active) setCount(toArray(res).length);
      })
      .catch(() => {
        if (active) setCount(0);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-gray-800 mb-1">
        {t("sp.welcome")}, {userName}!
      </h1>
      <p className="text-sm text-gray-500 mb-6">{t("sp.cabinet")}</p>

      <button
        onClick={() => navigate("/student/my-groups")}
        className="w-full sm:w-72 text-left bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <GroupsIcon />
          </div>
          <ArrowForwardIcon className="text-gray-300" fontSize="small" />
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-800">
          {count === null ? "…" : count}
        </p>
        <p className="text-sm text-gray-500">{t("sp.my_groups")}</p>
      </button>
    </div>
  );
}
