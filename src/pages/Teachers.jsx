import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import IosShareIcon from "@mui/icons-material/IosShare";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EmailIcon from "@mui/icons-material/Email";

const TEACHERS_MOCK = [
  {
    id: 1,
    name: "Mohirbek Toshmatov",
    groups: ["N26", "n105", "B2"],
    extra: 4,
    phone: "+998901234567",
    email: "mohirbek@gmail.com",
    address: "Toshkent",
    created: "12.05.2026",
  },
  {
    id: 2,
    name: "Sardor Rahimov",
    groups: ["N12"],
    extra: 0,
    phone: "+998907654321",
    email: "sardor@gmail.com",
    address: "Samarqand",
    created: "05.02.2023",
  },
  {
    id: 3,
    name: "Dilnoza Yusupova",
    groups: ["C3", "A1"],
    extra: 0,
    phone: "+998913334455",
    email: "dilnoza@gmail.com",
    address: "Buxoro",
    created: "18.03.2023",
  },
  {
    id: 4,
    name: "Jasur Mirzayev",
    groups: ["M7"],
    extra: 0,
    phone: "+998935556677",
    email: "jasur@gmail.com",
    address: "Namangan",
    created: "22.04.2023",
  },
  {
    id: 5,
    name: "Kamola Nazarova",
    groups: ["K9"],
    extra: 0,
    phone: "+998941112233",
    email: "kamola@gmail.com",
    address: "Andijon",
    created: "01.05.2023",
  },
  {
    id: 6,
    name: "Otabek Xasanov",
    groups: ["N26", "K9"],
    extra: 0,
    phone: "+998957778899",
    email: "otabek@gmail.com",
    address: "Toshkent",
    created: "15.06.2023",
  },
  {
    id: 7,
    name: "Feruza Abdullayeva",
    groups: ["B2"],
    extra: 0,
    phone: "+998919990011",
    email: "feruza@gmail.com",
    address: "Farg'ona",
    created: "20.07.2023",
  },
  {
    id: 8,
    name: "Sherzod Qodirov",
    groups: ["C3", "A1", "M7"],
    extra: 1,
    phone: "+998902221133",
    email: "sherzod@gmail.com",
    address: "Qarshi",
    created: "08.08.2023",
  },
  {
    id: 9,
    name: "Nilufar Ergasheva",
    groups: ["n105", "N12"],
    extra: 0,
    phone: "+998968884455",
    email: "nilufar@gmail.com",
    address: "Nukus",
    created: "14.09.2023",
  },
  {
    id: 10,
    name: "Bobur Usmonov",
    groups: ["N26", "B2", "K9"],
    extra: 0,
    phone: "+998977776655",
    email: "bobur@gmail.com",
    address: "Jizzax",
    created: "30.10.2023",
  },
];

const EMPTY_FORM = {
  phone: "+998",
  email: "",
  fio: "",
  birthDate: "1990-03-01",
  gender: "",
  address: "",
  photo: null,
  password: "",
  showPassword: false,
};

const AVAILABLE_GROUPS = ["N26", "n105", "N12", "B2", "C3", "A1", "M7", "K9"];

export default function Teachers() {
  const [teachers, setTeachers] = useState(TEACHERS_MOCK);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [groups, setGroups] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalSearch, setGroupModalSearch] = useState("");
  const [tempGroupModal, setTempGroupModal] = useState([]);

  const allChecked = selected.length === teachers.length;
  function toggleAll() {
    setSelected(allChecked ? [] : teachers.map((t) => t.id));
  }
  function toggleOne(id) {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openDrawer() {
    setForm(EMPTY_FORM);
    setGroups([]);
    setPhotoPreview(null);
    setErrors({});
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removeGroup(i) {
    setGroups((p) => p.filter((_, idx) => idx !== i));
  }

  function openGroupModal() {
    setTempGroupModal([...groups]);
    setGroupModalSearch("");
    setGroupModalOpen(true);
  }
  function confirmGroupModal() {
    setGroups(tempGroupModal);
    setGroupModalOpen(false);
  }

  function validate() {
    const e = {};
    if (!form.phone.trim() || form.phone === "+998")
      e.phone = "Telefon kiritilishi shart";
    if (!form.fio.trim()) e.fio = "FIO kiritilishi shart";
    if (!form.gender) e.gender = "Jinsni tanlang";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const today = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setTeachers((p) => [
      ...p,
      {
        id: Date.now(),
        name: form.fio,
        groups,
        extra: 0,
        phone: form.phone,
        birth: form.birthDate,
        created: today,
      },
    ]);
    closeDrawer();
  }

  function handleDelete(id) {
    setTeachers((p) => p.filter((t) => t.id !== id));
  }

  const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-violet-400"}`;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            O'qituvchilar
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning
            ma'lumotlarini topasiz.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <IosShareIcon sx={{ fontSize: 16 }} /> Export
          </button>
          <button
            onClick={openDrawer}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <span className="text-base leading-none">+</span> O'qituvchi
            qo'shish
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header: filters + search */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <FilterListIcon sx={{ fontSize: 17 }} /> Filters
          </button>
          <div className="flex items-center gap-2">
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
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <ArchiveIcon sx={{ fontSize: 16 }} /> Arxiv
            </button>
          </div>
        </div>

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
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Guruh
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Telefon raqamlari
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Manzil
                </th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">
                  Yaratilgan sana
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 transition-colors ${selected.includes(t.id) ? "bg-violet-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleOne(t.id)}
                      className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 shrink-0" />
                      <span className="text-[13px] font-semibold text-gray-800">
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.groups.map((g, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500"
                        >
                          {g}
                        </span>
                      ))}
                      {t.extra > 0 && (
                        <span className="px-2 py-0.5 border border-gray-200 rounded text-[11px] text-gray-500">
                          +{t.extra}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.phone}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.email}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.address}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600">
                    {t.created}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <VisibilityIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
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
        {/* Drawer header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px] font-bold text-gray-800">
              O'qituvchi qo'shish
            </span>
            <button
              onClick={closeDrawer}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: "#6B7280" }} />
            </button>
          </div>
          <p className="text-[12px] text-gray-400">
            Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.
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
              className={inputCls(errors.phone)}
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
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 ${errors.email ? "border-red-400" : "border-gray-200 focus-within:border-violet-400"} transition-colors`}
            >
              <EmailIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              <input
                type="email"
                placeholder="Elektron pochtani kiriting"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="text-[13px] text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
              />
            </div>
          </div>

          {/* FIO */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              O'qituvchi FIO
            </label>
            <input
              type="text"
              placeholder="Ma'lumotni kiriting"
              value={form.fio}
              onChange={(e) => {
                setForm((p) => ({ ...p, fio: e.target.value }));
                setErrors((p) => ({ ...p, fio: "" }));
              }}
              className={inputCls(errors.fio)}
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
            <div className="flex items-center gap-2 border border-gray-200 focus-within:border-violet-400 rounded-xl px-3 py-2.5 transition-colors">
              <CalendarTodayIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, birthDate: e.target.value }))
                }
                className="text-[13px] text-gray-600 outline-none bg-transparent w-full"
              />
            </div>
          </div>

          {/* Guruh */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Guruh
            </label>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 min-h-11">
              {groups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {groups.map((g, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-violet-50 text-violet-700 text-[12px] px-2 py-0.5 rounded-lg"
                    >
                      {g}
                      <button
                        onClick={() => removeGroup(i)}
                        className="text-violet-400 hover:text-red-500 cursor-pointer leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={openGroupModal}
                className="flex items-center gap-1 text-violet-600 text-[13px] font-semibold cursor-pointer hover:underline"
              >
                + Qo'shish
              </button>
            </div>
          </div>

          {/* Jinsi */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Jinsi
            </label>
            <div className="flex gap-5">
              {["Erkak", "Ayol"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => {
                      setForm((p) => ({ ...p, gender: g }));
                      setErrors((p) => ({ ...p, gender: "" }));
                    }}
                    className="accent-violet-600"
                  />
                  <span className="text-[13px] text-gray-700">{g}</span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="text-[11px] text-red-500 mt-1">{errors.gender}</p>
            )}
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
                  <CloudUploadIcon sx={{ fontSize: 30, color: "#7C3AED" }} />
                  <p className="text-[13px] mt-2">
                    <span className="text-violet-600 font-semibold">
                      Click to upload
                    </span>
                    <span className="text-gray-400"> or drag and drop</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG or PNG (max. 800x800px)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/jpg,image/jpeg,image/png"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
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
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
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
              className="w-full border border-gray-200 focus:border-violet-400 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={closeDrawer}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
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

      {/* Guruh tanlash modali */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setGroupModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 flex flex-col z-10">
            {/* Header */}
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
                onClick={() => setGroupModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              >
                <CloseIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder="Guruh qidirish..."
                value={groupModalSearch}
                onChange={(e) => setGroupModalSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            {/* List */}
            <div className="px-5 pb-3 flex flex-col gap-1 max-h-52 overflow-y-auto">
              {AVAILABLE_GROUPS.filter((g) =>
                g.toLowerCase().includes(groupModalSearch.toLowerCase()),
              ).map((g, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={tempGroupModal.includes(g)}
                    onChange={() =>
                      setTempGroupModal((p) =>
                        p.includes(g) ? p.filter((x) => x !== g) : [...p, g],
                      )
                    }
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    {g}
                  </span>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setGroupModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmGroupModal}
                className="px-5 py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl cursor-pointer transition-colors"
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
