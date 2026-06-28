import { useEffect, useState } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import { teachersApi } from "../../api/teachers";

// Turli o'ralgan javoblardan massiv/obyektni ajratib olish
function toArray(res) {
  if (Array.isArray(res)) return res;
  for (const k of ["data", "groups", "result", "items"])
    if (Array.isArray(res?.[k])) return res[k];
  return [];
}
function toObject(res) {
  if (res && !Array.isArray(res) && typeof res === "object") {
    return res.data && typeof res.data === "object" ? res.data : res;
  }
  return null;
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [profRes, groupsRes] = await Promise.all([
          teachersApi.getMyProfile().catch(() => null),
          teachersApi.getMyGroups().catch(() => null),
        ]);
        if (!active) return;
        setProfile(toObject(profRes));
        setGroups(toArray(groupsRes));
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

  const fullName =
    profile?.full_name ||
    profile?.fullName ||
    profile?.name ||
    localStorage.getItem("user_name") ||
    "O'qituvchi";

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-1">
        Xush kelibsiz, {fullName}!
      </h1>
      <p className="text-sm text-gray-500 mb-6">O'qituvchi paneli</p>

      {/* Profil kartasi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
          <PersonIcon />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{fullName}</p>
          {profile?.phone && (
            <p className="text-sm text-gray-500">{profile.phone}</p>
          )}
          {profile?.email && (
            <p className="text-sm text-gray-500">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Guruhlar */}
      <div className="flex items-center gap-2 mb-3">
        <GroupsIcon fontSize="small" className="text-violet-600" />
        <h2 className="font-semibold text-gray-800">Mening guruhlarim</h2>
        <span className="text-xs text-gray-400">({groups.length})</span>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500 text-sm">Hozircha guruhlar yo'q.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g, i) => (
            <div
              key={g.id ?? i}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-gray-800 mb-1">
                {g.name || g.title || `Guruh #${g.id ?? i + 1}`}
              </p>
              {g.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {g.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                <GroupsIcon sx={{ fontSize: 14 }} />
                {(g.students?.length ?? g.studentsCount ?? g.student_count ?? 0)}{" "}
                ta talaba
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
