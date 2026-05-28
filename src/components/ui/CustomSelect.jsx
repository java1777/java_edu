import { useState, useRef, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full border rounded-xl px-3 py-2.5 pr-9 text-[13px] text-left outline-none transition-colors bg-white cursor-pointer flex items-center justify-between
          ${error ? "border-red-400" : open ? "border-violet-400" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span
          className="absolute inset-y-0 right-3 flex items-center transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ExpandMoreIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
        </span>
      </button>

      <div
        className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        style={{
          top: "calc(100% + 4px)",
          maxHeight: open ? "200px" : "0px",
          opacity: open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="py-1">
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-[13px] text-gray-400 hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer transition-colors
                ${value === opt ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
