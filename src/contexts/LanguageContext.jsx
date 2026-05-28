import { createContext, useContext, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

const LANG_LABELS = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("lang") ?? "uz",
  );

  function setLang(l) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  function t(key) {
    return translations[lang]?.[key] ?? translations["uz"]?.[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANG_LABELS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}
