import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// ponytail: translasi TIDAK di-inline (920KB JSON membuat entry chunk 921KB & LCP 8.3s).
// Dimuat runtime dari /locales/{lng}/translation.json — hanya bahasa aktif yang turun.
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    load: "languageOnly",
    supportedLngs: ["en", "id", "jpn"],
    keySeparator: false,
    interpolation: { escapeValue: false },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    react: { useSuspense: false }
  });
export default i18n;
