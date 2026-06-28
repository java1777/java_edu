import { useEffect, useState } from "react";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import { teachersApi } from "../../api/teachers";
import { useLanguage } from "../../contexts/LanguageContext";

const SERVER_ORIGIN = "https://najot-edu.softwareengineer.uz";

function toObject(res) {
  if (res && !Array.isArray(res) && typeof res === "object") {
    return res.data && typeof res.data === "object" ? res.data : res;
  }
  return null;
}

function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "groups", "result", "items"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}

function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return String(str);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function avatarUrl(p) {
  const img =
    p?.image ?? p?.avatar ?? p?.photo ?? p?.image_url ?? p?.file ?? null;
  if (!img) return null;
  if (String(img).startsWith("http")) return img;
  return `${SERVER_ORIGIN}/files/${img}`;
}

function groupName(g, i) {
  if (typeof g === "string" || typeof g === "number") return String(g);
  return (
    g.name ??
    g.group?.name ??
    g.group_name ??
    g.groupName ??
    g.title ??
    `Guruh ${i + 1}`
  );
}

export default function TeacherProfile() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [prof, grp] = await Promise.all([
          teachersApi.getMyProfile().catch(() => null),
          teachersApi.getMyGroups().catch(() => null),
        ]);
        if (!alive) return;
        const pObj = toObject(prof);
        setProfile(pObj);
        // Guruh nomlari my/groups dan ishonchli keladi (jadvalda ham shu).
        // U bo'sh bo'lsagina profil javobidagi groups ga qaytamiz.
        const myGroups = toArray(grp);
        setGroups(
          myGroups.length
            ? myGroups
            : Array.isArray(pObj?.groups)
              ? pObj.groups
              : [],
        );
      } catch (err) {
        if (alive) setError(err?.message || "Profilni yuklab bo'lmadi");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fullName =
    profile?.full_name ||
    profile?.fullName ||
    profile?.name ||
    localStorage.getItem("user_name") ||
    "O'qituvchi";

  const img = avatarUrl(profile);
  const initial = fullName[0]?.toUpperCase() ?? "O";

  const info = [
    {
      icon: <EmailIcon sx={{ fontSize: 20 }} />,
      label: t("tp.email"),
      value: profile?.email ?? "—",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 20 }} />,
      label: t("common.phone"),
      value: profile?.phone ?? "—",
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 20 }} />,
      label: t("common.address"),
      value: profile?.address ?? "—",
    },
    {
      icon: <CalendarMonthIcon sx={{ fontSize: 20 }} />,
      label: t("tp.reg_date"),
      value: fmtDate(profile?.created_at ?? profile?.createdAt),
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold text-gray-800 mb-5">
        {t("tp.profile")}
      </h1>

      {loading ? (
        <p className="text-gray-400 text-sm">{t("common.loading")}</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {/* Chap karta — avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full lg:w-72 shrink-0">
            <div className="h-28 bg-linear-to-br from-emerald-400 to-teal-500" />
            <div className="flex flex-col items-center px-5 pb-6 -mt-14">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-violet-100 flex items-center justify-center">
                {img && imgOk ? (
                  <img
                    src={img}
                    alt={fullName}
                    onError={() => setImgOk(false)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-violet-700">
                    {initial}
                  </span>
                )}
              </div>
              <p className="mt-3 text-lg font-bold text-gray-800 text-center">
                {fullName}
              </p>
              <p className="text-[13px] text-gray-400">{t("tp.role")}</p>
            </div>
          </div>

          {/* O'ng karta — ma'lumotlar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 p-6">
            <h2 className="text-[16px] font-bold text-gray-800 mb-5">
              {t("tp.personal_info")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {info.map((it) => (
                <div key={it.label} className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5 shrink-0">
                    {it.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-gray-400 mb-0.5">
                      {it.label}
                    </p>
                    <p className="text-[14px] font-bold text-gray-800 wrap-break-word">
                      {it.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-6 border-gray-100" />

            <h2 className="text-[16px] font-bold text-gray-800 mb-4">
              {t("nav.groups")}
            </h2>
            {groups.length === 0 ? (
              <p className="text-[13px] text-gray-400">{t("groups.no_groups")}</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {groups.map((g, i) => (
                  <span
                    key={g.id ?? i}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[13px] font-semibold px-3 py-1.5 rounded-lg"
                  >
                    <GroupsIcon sx={{ fontSize: 16 }} />
                    {groupName(g, i)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
