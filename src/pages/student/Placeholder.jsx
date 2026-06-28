import ConstructionIcon from "@mui/icons-material/Construction";
import { useLanguage } from "../../contexts/LanguageContext";

// To'lov / Reyting / Do'kon kabi hali API'si yo'q bo'limlar uchun
export default function Placeholder({ titleKey }) {
  const { t } = useLanguage();
  const title = t(titleKey);
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">{title}</h1>
      <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <ConstructionIcon sx={{ color: "#7C3AED", fontSize: 30 }} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-500">{t("sp.coming_soon")}</p>
      </div>
    </div>
  );
}
