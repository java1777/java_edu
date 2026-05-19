import { useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

const STUDENTS_MOCK_NAMES = [
  "Ali Valiyev",
  "Salim Qodirov",
  "Bobur",
  "Qodir Salimov",
];

const TEACHERS_MOCK_NAMES = [
  "Mohirbek Toshmatov",
  "Sardor Rahimov",
  "Dilnoza Yusupova",
  "Jasur Mirzayev",
  "Kamola Nazarova",
  "Otabek Xasanov",
  "Feruza Abdullayeva",
  "Sherzod Qodirov",
  "Nilufar Ergasheva",
  "Bobur Usmonov",
];

const GROUPS_DATA = [
  {
    id: 1,
    active: true,
    name: "N26",
    course: "Backend",
    duration: "6 oy",
    time: "09:30",
    days: "Du. Se. Chor. Pay. Ju",
    room: "Autodesk",
    teacher: "Mohirbek",
    students: 1,
  },
  {
    id: 2,
    active: true,
    name: "n105",
    course: "Backend",
    duration: "6 oy",
    time: "16:00",
    days: "Se. Pay. Shan",
    room: "Autodesk",
    teacher: "Mohirbek",
    students: 4,
  },
];

const DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

const GROUP_EMPTY = {
  name: "",
  course: "",
  room: "",
  days: [],
  time: "09:00",
  startDate: "",
  tavsif: "",
  teachers: [],
  students: [],
};

export default function Groups() {
  const [activeTab, setActiveTab] = useState(0);
  const [groups, setGroups] = useState(GROUPS_DATA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(GROUP_EMPTY);
  const [errors, setErrors] = useState({});

  // Student modal
  const [studentModal, setStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [tempStudents, setTempStudents] = useState([]);

  // Teacher modal
  const [teacherModal, setTeacherModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [tempTeachers, setTempTeachers] = useState([]);

  function toggleActive(id) {
    setGroups((p) =>
      p.map((g) => (g.id === id ? { ...g, active: !g.active } : g)),
    );
  }

  function openDrawer() {
    setForm(GROUP_EMPTY);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function toggleDay(day) {
    setForm((p) => ({
      ...p,
      days: p.days.includes(day)
        ? p.days.filter((d) => d !== day)
        : [...p.days, day],
    }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Guruh nomi kiritilishi shart";
    if (!form.course.trim()) e.course = "Kurs tanlanishi shart";
    if (!form.room.trim()) e.room = "Xona tanlanishi shart";
    if (form.days.length === 0) e.days = "Kamida bir kun tanlang";
    if (!form.startDate) e.startDate = "Boshlanish sanasini kiriting";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setGroups((p) => [
      ...p,
      {
        id: Date.now(),
        active: true,
        name: form.name,
        course: form.course,
        duration: "6 oy",
        time: form.time,
        days: form.days.map((d) => d.slice(0, 3)).join(". "),
        room: form.room,
        teacher: form.teachers[0] || "—",
        students: form.students.length,
      },
    ]);
    closeDrawer();
  }

  const totalTeachers = [...new Set(groups.map((g) => g.teacher))].length;
  const totalStudents = groups.reduce((sum, g) => sum + g.students, 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold text-gray-800">Guruhlar</h1>
        <button
          onClick={openDrawer}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <span className="text-base leading-none">+</span> Guruh qo'shish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
            ${activeTab === 0 ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        >
          <PeopleIcon sx={{ fontSize: 16 }} /> Guruhlar
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer
            ${activeTab === 1 ? "bg-white border border-gray-200 shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
        >
          <CalendarTodayIcon sx={{ fontSize: 14 }} /> Arxiv
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Jami guruhlar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <PeopleIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">Jami guruhlar</p>
          <p className="text-3xl font-extrabold text-gray-800">{groups.length}</p>
        </div>

        {/* O'qituvchilar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <PeopleIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">O'qituvchilar</p>
          <p className="text-3xl font-extrabold text-gray-800">{totalTeachers}</p>
        </div>

        {/* O'quvchilar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <SchoolIcon sx={{ fontSize: 22, color: "#6B7280" }} />
            <button className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-[13px] text-gray-500 mb-1">O'quvchilar</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-gray-800">{totalStudents}</p>
            <div className="flex -space-x-2">
              {["#7C3AED", "#EA580C", "#16A34A"].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Guruh nomi</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Kurs</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Davomiyligi</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Dars vaqti</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Xona</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">O'qituvchi</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Talabalar</th>
                <th className="px-4 py-3">
                  <RefreshIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(g.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${g.active ? "bg-violet-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${g.active ? "translate-x-4.5" : "translate-x-0.5"}`}
                        />
                      </button>
                      <span className={`text-[11px] font-bold ${g.active ? "text-green-500" : "text-gray-400"}`}>
                        {g.active ? "FAOL" : "NOFAOL"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">{g.name}</td>
                  <td className="px-4 py-4">
                    <span className="text-[13px] font-semibold text-violet-600">{g.course}</span>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-gray-600">{g.duration}</td>
                  <td className="px-4 py-4">
                    <p className="text-[13px] font-semibold text-gray-800">{g.time}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{g.days}</p>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-gray-600">{g.room}</td>
                  <td className="px-4 py-4 text-[13px] text-gray-600">{g.teacher}</td>
                  <td className="px-4 py-4 text-[13px] font-semibold text-gray-800">{g.students}</td>
                  <td className="px-4 py-4">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <MoreVertIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: drawerOpen ? "rgba(0,0,0,0.2)" : "transparent",
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Drawer header */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[16px] font-bold text-gray-800">
              Guruh qo'shish
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {/* Guruh nomi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Guruh nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Frontend 2024"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.name ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Kurs */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Kurs <span className="text-red-500">*</span>
            </label>
            <select
              value={form.course}
              onChange={(e) => {
                setForm((p) => ({ ...p, course: e.target.value }));
                setErrors((p) => ({ ...p, course: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors bg-white ${errors.course ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            >
              <option value="">Tanlang</option>
              {["Backend", "Frontend", "Mobile", "UI/UX", "DevOps"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.course && (
              <p className="text-[11px] text-red-500 mt-1">{errors.course}</p>
            )}
          </div>

          {/* Xona */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Xona <span className="text-red-500">*</span>
            </label>
            <select
              value={form.room}
              onChange={(e) => {
                setForm((p) => ({ ...p, room: e.target.value }));
                setErrors((p) => ({ ...p, room: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors bg-white ${errors.room ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            >
              <option value="">Tanlang</option>
              {["Autodesk", "Room 1", "Room 2", "Aula"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.room && (
              <p className="text-[11px] text-red-500 mt-1">{errors.room}</p>
            )}
          </div>

          {/* Dars kunlari */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Dars kunlari <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.days.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-700">{day}</span>
                </label>
              ))}
            </div>
            {errors.days && (
              <p className="text-[11px] text-red-500 mt-1">{errors.days}</p>
            )}
          </div>

          {/* Dars vaqti */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Dars vaqti <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>

          {/* Boshlanish sanasi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Boshlanish sanasi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => {
                setForm((p) => ({ ...p, startDate: e.target.value }));
                setErrors((p) => ({ ...p, startDate: "" }));
              }}
              className={`w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${errors.startDate ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`}
            />
            {errors.startDate && (
              <p className="text-[11px] text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Tavsif
            </label>
            <textarea
              rows={3}
              placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
              value={form.tavsif}
              onChange={(e) =>
                setForm((p) => ({ ...p, tavsif: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors resize-none"
            />
          </div>

          {/* O'qituvchilar */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              O'qituvchilar
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 min-h-10.5">
              {form.teachers.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.teachers.map((t, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {t}{" "}
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            teachers: p.teachers.filter((x) => x !== t),
                          }))
                        }
                        className="text-violet-400 hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setTempTeachers([...form.teachers]);
                  setTeacherSearch("");
                  setTeacherModal(true);
                }}
                className="flex items-center gap-1 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
              >
                + Qo'shish
              </button>
            </div>
          </div>

          {/* Talabalar */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Talabalar
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 min-h-10.5">
              {form.students.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.students.map((s, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {s}{" "}
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            students: p.students.filter((x) => x !== s),
                          }))
                        }
                        className="text-violet-400 hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setTempStudents([...form.students]);
                  setStudentSearch("");
                  setStudentModal(true);
                }}
                className="flex items-center gap-1 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
              >
                + Qo'shish
              </button>
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>
      </div>

      {/* Student modal */}
      {studentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setStudentModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">Talaba qo'shish</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bitta yoki bir nechta talabani tanlang
                </p>
              </div>
              <button
                onClick={() => setStudentModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="Talaba qidirish..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {STUDENTS_MOCK_NAMES.filter((s) =>
                s.toLowerCase().includes(studentSearch.toLowerCase()),
              ).map((s, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempStudents.includes(s)}
                    onChange={() =>
                      setTempStudents((p) =>
                        p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                      )
                    }
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setStudentModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, students: tempStudents }));
                  setStudentModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher modal */}
      {teacherModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setTeacherModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">O'qituvchi qo'shish</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bitta yoki bir nechta o'qituvchini tanlang
                </p>
              </div>
              <button
                onClick={() => setTeacherModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="O'qituvchi qidirish..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {TEACHERS_MOCK_NAMES.filter((t) =>
                t.toLowerCase().includes(teacherSearch.toLowerCase()),
              ).map((t, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempTeachers.includes(t)}
                    onChange={() =>
                      setTempTeachers((p) =>
                        p.includes(t) ? p.filter((x) => x !== t) : [...p, t],
                      )
                    }
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-700">{t}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setTeacherModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, teachers: tempTeachers }));
                  setTeacherModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
