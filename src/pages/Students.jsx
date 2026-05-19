import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const AVATAR_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#DB2777",
  "#0891B2",
];

const STUDENTS_MOCK = [
  {
    id: 1,
    name: "Ali Valiyev",
    groups: ["N26", "n105"],
    phone: "+998976541223",
    email: "ali@gmail.com",
    birth: "12.12.2010",
    address: "Sirdaryo",
    created: "12.05.2026",
  },
  {
    id: 2,
    name: "Salim Qodirov",
    groups: ["n105"],
    phone: "+998977777777",
    email: "salim@gmail.com",
    birth: "14.01.2007",
    address: "Buxoro",
    created: "14.05.2026",
  },
  {
    id: 3,
    name: "Bobur",
    groups: ["n105"],
    phone: "+998999999999",
    email: "bobur@gmail.com",
    birth: "14.03.2002",
    address: "Toshkent",
    created: "14.05.2026",
  },
  {
    id: 4,
    name: "Qodir Salimov",
    groups: ["n105"],
    phone: "+998911111111",
    email: "qodir@gmail.com",
    birth: "29.04.2026",
    address: "O'zbekcha",
    created: "14.05.2026",
  },
];

const AVAILABLE_GROUPS = ["N26", "n105", "N12", "B2", "C3", "A1", "M7", "K9"];

const STUDENT_EMPTY = {
  phone: "+998",
  email: "",
  fio: "",
  birthDate: "",
  address: "",
  password: "",
};

export default function Students() {
  const [students, setStudents] = useState(STUDENTS_MOCK);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(STUDENT_EMPTY);
  const [groups, setGroups] = useState([]);
  const [groupInput, setGroupInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [groupModal, setGroupModal] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [tempGroups, setTempGroups] = useState([]);

  const allChecked = selected.length === students.length;
  function toggleAll() {
    setSelected(allChecked ? [] : students.map((s) => s.id));
  }
  function toggleOne(id) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }
  function handleDelete(id) {
    setStudents((p) => p.filter((s) => s.id !== id));
  }

  function openDrawer() {
    setForm(STUDENT_EMPTY);
    setGroups([]);
    setGroupInput("");
    setPhotoPreview(null);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function addGroup() {
    if (groupInput.trim()) {
      setGroups((p) => [...p, groupInput.trim()]);
      setGroupInput("");
    }
  }
  function removeGroup(i) {
    setGroups((p) => p.filter((_, idx) => idx !== i));
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function validate() {
    const e = {};
    if (!form.phone.trim() || form.phone === "+998")
      e.phone = "Telefon kiritilishi shart";
    if (!form.fio.trim()) e.fio = "FIO kiritilishi shart";
    if (!form.address.trim()) e.address = "Manzil kiritilishi shart";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const today = new Date().toLocaleDateString("ru-RU").replace(/\//g, ".");
    setStudents((p) => [
      ...p,
      {
        id: Date.now(),
        name: form.fio,
        groups,
        phone: form.phone,
        email: form.email,
        birth: form.birthDate || "—",
        address: form.address,
        created: today,
      },
    ]);
    closeDrawer();
  }

  const inp = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${err ? "border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            Talabalar
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini
            topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari
            keltirilgan.
          </p>
        </div>
        <button
          onClick={openDrawer}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <span className="text-base leading-none">+</span> Talaba qo'shish
        </button>
      </div>

      {/* White card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search + filter bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-52 hover:border-violet-300 transition-colors">
            <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <FilterListIcon sx={{ fontSize: 16 }} /> Filters
            </button>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <ArchiveIcon sx={{ fontSize: 16 }} /> Arxiv
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  <span className="flex items-center gap-1 cursor-pointer select-none">
                    Nomi <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                  </span>
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Guruh</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Telefon raqamlari</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Email</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Tug'ilgan sanasi</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Manzil</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Yaratilgan sana</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => {
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-50 transition-colors ${selected.includes(s.id) ? "bg-violet-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(s.id)}
                        onChange={() => toggleOne(s.id)}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
                          style={{ background: color }}
                        >
                          {s.name[0].toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-gray-800">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.groups.map((g, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{s.phone}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{s.birth}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{s.address}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{s.created}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          <VisibilityIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          <DeleteIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 cursor-pointer transition-colors">
                          <EditIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            ← Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${p === 1 ? "bg-violet-600 text-white" : p === "..." ? "text-gray-400 cursor-default" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            Next →
          </button>
        </div>
      </div>

      {/* Backdrop */}
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
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-bold text-gray-800">
              Talaba qo'shish
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            Bu yerda siz yangi Talaba qo'shishingiz mumkin.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Telefon */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Telefon raqam
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => {
                setForm((p) => ({ ...p, phone: e.target.value }));
                setErrors((p) => ({ ...p, phone: "" }));
              }}
              className={inp(errors.phone)}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Mail */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Mail
            </label>
            <input
              type="email"
              placeholder="Elektron pochtani kiriting"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          {/* FIO */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Talaba FIO
            </label>
            <input
              type="text"
              placeholder="Ma'lumotni kiriting"
              value={form.fio}
              onChange={(e) => {
                setForm((p) => ({ ...p, fio: e.target.value }));
                setErrors((p) => ({ ...p, fio: "" }));
              }}
              className={inp(errors.fio)}
            />
            {errors.fio && (
              <p className="text-[11px] text-red-500 mt-1">{errors.fio}</p>
            )}
          </div>

          {/* Tug'ilgan sanasi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Tug'ilgan sanasi
            </label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, birthDate: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          {/* Manzil */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Manzil
            </label>
            <input
              type="text"
              placeholder="Manzilni kiriting"
              value={form.address}
              onChange={(e) => {
                setForm((p) => ({ ...p, address: e.target.value }));
                setErrors((p) => ({ ...p, address: "" }));
              }}
              className={inp(errors.address)}
            />
            {errors.address && (
              <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Parol */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Parol
            </label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              className={inp(false)}
            />
          </div>

          {/* Guruh */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Guruh
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-10.5 focus-within:border-violet-400 transition-colors">
              {groups.map((g, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-gray-100 text-gray-600 text-[12px] px-2 py-0.5 rounded-lg"
                >
                  {g}{" "}
                  <button
                    onClick={() => removeGroup(i)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Guruh nomi..."
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                className="text-[13px] outline-none bg-transparent flex-1 min-w-20 placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => {
                setTempGroups([...groups]);
                setGroupSearch("");
                setGroupModal(true);
              }}
              className="flex items-center gap-1 mt-2 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
            >
              + Guruh qo'shish
            </button>
          </div>

          {/* Surati */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Surati
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-violet-400 transition-colors">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl"
                />
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 28, color: "#6B7280" }} />
                  <p className="text-[13px] mt-2">
                    <span className="text-violet-600 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-400"> or drag and drop</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG or PNG (max. 2 MB)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
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

      {/* Group modal */}
      {groupModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setGroupModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-[15px] font-bold text-gray-800">
                  Guruhga biriktirish
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Bir yoki bir nechta guruhni tanlang
                </p>
              </div>
              <button
                onClick={() => setGroupModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-violet-400 transition-colors">
                <SearchIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Guruh qidirish..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
                />
              </div>
            </div>

            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {AVAILABLE_GROUPS.filter((g) =>
                g.toLowerCase().includes(groupSearch.toLowerCase()),
              ).map((g, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempGroups.includes(g)}
                    onChange={() =>
                      setTempGroups((p) =>
                        p.includes(g) ? p.filter((x) => x !== g) : [...p, g],
                      )
                    }
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700">{g}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setGroupModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setGroups(tempGroups);
                  setGroupModal(false);
                }}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
