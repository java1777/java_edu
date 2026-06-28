import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { lessonsApi } from "../api/lessons";
import { homeworkApi } from "../api/homework";
import { usePanelBase } from "../hooks/usePanelBase";

// ── Rich text editor toolbar commands ────────────────────────────────────────
const FONT_FAMILIES = ["Sans Serif", "Serif", "Monospace"];
const FONT_SIZES = ["Normal", "Small", "Large", "Huge"];
const FONT_SIZE_MAP = { Normal: "3", Small: "1", Large: "5", Huge: "7" };

function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [fontFamily, setFontFamily] = useState("Sans Serif");
  const [fontSize, setFontSize] = useState("Normal");

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  }, []);

  function handleInput() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function applyFontFamily(f) {
    setFontFamily(f);
    exec(
      "fontName",
      f === "Sans Serif"
        ? "Arial, sans-serif"
        : f === "Serif"
          ? "Georgia, serif"
          : "monospace",
    );
  }

  function applyFontSize(s) {
    setFontSize(s);
    exec("fontSize", FONT_SIZE_MAP[s]);
  }

  const ToolBtn = ({ onClick, children, title }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer text-[13px] font-semibold"
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-violet-400 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <ToolBtn onClick={() => exec("formatBlock", "h1")} title="H1">
          H1
        </ToolBtn>
        <ToolBtn onClick={() => exec("formatBlock", "h2")} title="H2">
          H2
        </ToolBtn>
        <Divider />

        {/* Font family */}
        <select
          value={fontFamily}
          onChange={(e) => applyFontFamily(e.target.value)}
          className="h-7 px-2 text-[12px] text-gray-600 border border-gray-200 rounded bg-white cursor-pointer outline-none"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          value={fontSize}
          onChange={(e) => applyFontSize(e.target.value)}
          className="h-7 px-2 text-[12px] text-gray-600 border border-gray-200 rounded bg-white cursor-pointer outline-none ml-1"
        >
          {FONT_SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <Divider />
        <ToolBtn onClick={() => exec("bold")} title="Bold">
          <b>B</b>
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic">
          <i>I</i>
        </ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Underline">
          <u>U</u>
        </ToolBtn>
        <ToolBtn onClick={() => exec("strikeThrough")} title="Strikethrough">
          <s>S</s>
        </ToolBtn>
        <Divider />
        <ToolBtn
          onClick={() => exec("formatBlock", "blockquote")}
          title="Quote"
        >
          ❝
        </ToolBtn>
        <ToolBtn onClick={() => exec("formatBlock", "pre")} title="Code">
          {"</>"}
        </ToolBtn>
        <Divider />
        <ToolBtn
          onClick={() => exec("insertUnorderedList")}
          title="Bullet list"
        >
          ≡
        </ToolBtn>
        <ToolBtn
          onClick={() => exec("insertOrderedList")}
          title="Numbered list"
        >
          №
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("justifyLeft")} title="Align left">
          ⬜
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Center">
          ⬛
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Align right">
          ⬜
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyFull")} title="Justify">
          ⬛
        </ToolBtn>
        <Divider />
        <ToolBtn
          onClick={() => {
            const url = prompt("Havola URL:");
            if (url) exec("createLink", url);
          }}
          title="Link"
        >
          🔗
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
        className="min-h-40 px-4 py-3 text-[13px] text-gray-700 outline-none"
        style={{ whiteSpace: "pre-wrap" }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function normalizeList(res) {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.lessons ?? [];
}

export default function HomeworkCreate() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const base = usePanelBase();

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Default: hozir + 36 soat
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 36 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  });

  const fileRef = useRef(null);

  // GET /lessons/my/group/{groupId} — barcha darslar
  useEffect(() => {
    lessonsApi
      .getByGroup(groupId)
      .then((res) => setLessons(normalizeList(res)))
      .catch(() => setLessons([]))
      .finally(() => setLessonsLoading(false));
  }, [groupId]);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function handleSubmit() {
    if (!lessonId) {
      setError("Dars mavzusini tanlang");
      return;
    }
    if (!title.trim()) {
      setError("Sarlavha kiriting");
      return;
    }
    if (!description.trim()) {
      setError("Izoh kiriting");
      return;
    }
    if (!file) {
      setError("Fayl yuklang");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const body = new FormData();
      body.append("lesson_id", Number(lessonId));
      body.append("group_id", Number(groupId));
      body.append("title", title.trim());
      body.append("description", description);
      body.append("deadline", deadline);
      if (file) body.append("file", file);
      await homeworkApi.create(body);
      navigate(`${base}/groups/${groupId}?tab=1`);
    } catch (err) {
      setError(err.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="py-6 px-4 w-1/2">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <h1 className="text-[20px] font-bold text-gray-800">
          Yangi uyga vazifa yaratish
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-[13px] font-semibold px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Mavzu — GET /groups/{groupId}/lesson */}
        <div>
          <label className="block text-[13px] font-bold text-red-500 mb-2">
            * Mavzu
          </label>
          <div className="relative">
            <select
              value={lessonId}
              onChange={(e) => {
                setLessonId(e.target.value);
                const found = lessons.find(
                  (l) => String(l.id) === e.target.value,
                );
                if (found) setTitle(found.topic ?? found.title ?? "");
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 bg-white outline-none focus:border-violet-400 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Mavzulardan birini tanlang</option>
              {lessonsLoading ? (
                <option disabled>Yuklanmoqda...</option>
              ) : lessons.length === 0 ? (
                <option disabled>Darslar topilmadi</option>
              ) : (
                lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.topic ?? l.title ?? `Dars #${l.id}`}
                  </option>
                ))
              )}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[11px]">
              ▼
            </span>
          </div>
        </div>

        {/* Sarlavha */}
        <div>
          <label className="block text-[13px] font-bold text-red-500 mb-2">
            * Sarlavha
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Uyga vazifa sarlavhasi"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-violet-400 transition-colors"
          />
        </div>

        {/* Izoh — Rich text editor */}
        <div>
          <label className="block text-[13px] font-bold text-red-500 mb-2">
            * Izoh
          </label>
          <RichEditor value={description} onChange={setDescription} />
        </div>

        {/* Fayl yuklash */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
            ${dragging ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-300 bg-gray-50"}`}
        >
          <CloudUploadIcon
            sx={{ fontSize: 36, color: dragging ? "#7C3AED" : "#9CA3AF" }}
          />
          {file ? (
            <div className="text-center">
              <p className="text-[13px] font-semibold text-violet-600">
                {file.name}
              </p>
              <p className="text-[12px] text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">
              Faylni tanlash yoki shu yerga tashlang
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => {
              if (e.target.files[0]) setFile(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>

        {/* Tugash vaqti — default 36 soat */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2">
            Tugash vaqti{" "}
            <span className="text-[11px] text-gray-400 font-normal">
              (default: 36 soat)
            </span>
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-violet-400 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 text-[13px] font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
          >
            {saving ? "Saqlanmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}
