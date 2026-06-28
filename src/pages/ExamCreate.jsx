import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { lessonsApi } from "../api/lessons";
import { examsApi } from "../api/exams";
import { usePanelBase } from "../hooks/usePanelBase";

function normalizeList(res) {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.lessons ?? [];
}

function RichEditor({ onChange }) {
  const editorRef = useRef(null);
  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const Btn = ({ onClick, children, title }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 cursor-pointer text-[13px] font-semibold transition-colors"
    >
      {children}
    </button>
  );
  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-violet-400 transition-colors">
      <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <Btn onClick={() => exec("formatBlock", "h1")}>H1</Btn>
        <Btn onClick={() => exec("formatBlock", "h2")}>H2</Btn>
        <Sep />
        <select
          onChange={(e) => exec("fontName", e.target.value)}
          className="h-7 px-2 text-[12px] text-gray-600 border border-gray-200 rounded bg-white cursor-pointer outline-none"
        >
          <option>Sans Serif</option>
          <option>Serif</option>
          <option>Monospace</option>
        </select>
        <select
          onChange={(e) =>
            exec(
              "fontSize",
              { Normal: "3", Small: "1", Large: "5" }[e.target.value] ?? "3",
            )
          }
          className="h-7 px-2 text-[12px] text-gray-600 border border-gray-200 rounded bg-white cursor-pointer outline-none ml-1"
        >
          <option>Normal</option>
          <option>Small</option>
          <option>Large</option>
        </select>
        <Sep />
        <Btn onClick={() => exec("bold")}>
          <b>B</b>
        </Btn>
        <Btn onClick={() => exec("italic")}>
          <i>I</i>
        </Btn>
        <Btn onClick={() => exec("underline")}>
          <u>U</u>
        </Btn>
        <Btn onClick={() => exec("strikeThrough")}>
          <s>S</s>
        </Btn>
        <Btn onClick={() => exec("formatBlock", "blockquote")}>❝</Btn>
        <Btn onClick={() => exec("formatBlock", "pre")}>{"</>"}</Btn>
        <Sep />
        <Btn onClick={() => exec("insertUnorderedList")}>≡</Btn>
        <Btn onClick={() => exec("insertOrderedList")}>№</Btn>
        <Btn onClick={() => exec("justifyLeft")}>⬜</Btn>
        <Btn onClick={() => exec("justifyCenter")}>⬛</Btn>
        <Btn onClick={() => exec("justifyRight")}>⬜</Btn>
        <Btn onClick={() => exec("justifyFull")}>⬛</Btn>
        <Sep />
        <Btn
          onClick={() => {
            const url = prompt("URL:");
            if (url) exec("createLink", url);
          }}
        >
          🔗
        </Btn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        data-placeholder="Imtihon haqida ma'lumot kiriting..."
        className="min-h-28 px-4 py-3 text-[13px] text-gray-700 outline-none"
        style={{ whiteSpace: "pre-wrap" }}
      />
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9CA3AF;pointer-events:none}`}</style>
    </div>
  );
}

export default function ExamCreate() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const base = usePanelBase();

  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonId, setLessonId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    lessonsApi
      .getByGroup(groupId)
      .then((res) => setLessons(normalizeList(res)))
      .catch(() => setLessons([]))
      .finally(() => setLessonsLoading(false));
  }, [groupId]);

  async function handleSubmit() {
    if (!lessonId) {
      setError("Dars mavzusini tanlang");
      return;
    }
    if (!endDate) {
      setError("Tugash sanasini kiriting");
      return;
    }
    if (!endTime) {
      setError("Tugash vaqtini kiriting");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const body = new FormData();
      body.append("group_id", Number(groupId));
      body.append("lesson_id", Number(lessonId));
      body.append("description", description);
      body.append("end_date", endDate);
      body.append("end_time", endTime);
      if (file) body.append("file", file);
      await examsApi.create(body);
      navigate(`${base}/groups/${groupId}?tab=1`);
    } catch (err) {
      setError(err.message ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="py-6 px-4 w-1/2">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 20, color: "#374151" }} />
        </button>
        <h1 className="text-[20px] font-bold text-gray-800">
          Imtihon yaratish
        </h1>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-[13px] px-4 py-3 rounded-xl mb-5">
        <InfoOutlinedIcon
          sx={{ fontSize: 18, marginTop: "1px", flexShrink: 0 }}
        />
        <span>
          Oxirgi 7 kundagi uyga vazifa berilmagan mavzularni tanlay olasiz!
        </span>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-[13px] font-semibold px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Mavzu */}
        <div>
          <label className="block text-[13px] font-bold text-red-500 mb-2">
            * Mavzu
          </label>
          <div className="relative">
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 bg-white outline-none focus:border-violet-400 appearance-none cursor-pointer"
            >
              <option value="">Mavzulardan birini tanlang</option>
              {lessonsLoading ? (
                <option disabled>Yuklanmoqda...</option>
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

        {/* Izoh */}
        <div>
          <label className="block text-[13px] font-bold text-red-500 mb-2">
            * Izoh
          </label>
          <RichEditor onChange={setDescription} />
        </div>

        {/* File upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) setFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl py-6 flex items-center justify-center gap-2 cursor-pointer transition-colors
            ${dragging ? "border-violet-400 bg-violet-50" : file ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}
        >
          <CloudUploadIcon
            sx={{ fontSize: 20, color: file ? "#7C3AED" : "#9CA3AF" }}
          />
          <span className="text-[13px] text-gray-500 font-semibold">
            {file ? file.name : "Yuklash"}
          </span>
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => {
              if (e.target.files[0]) setFile(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>

        {/* Tugash sanasi va vaqti */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-red-500 mb-2">
              * Tugash sanasi
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sanani kiriting"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-red-500 mb-2">
              * Tugash vaqti
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="Vaqtni kiriting"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 text-[13px] font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 rounded-xl cursor-pointer transition-colors"
          >
            {saving ? "Saqlanmoqda..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}
