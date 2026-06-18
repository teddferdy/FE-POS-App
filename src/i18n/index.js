import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import Language
import translationEn from "./en.json";
import translationJpn from "./jpn.json";
import translationId from "./id.json";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    load: "languageOnly",
    supportedLngs: ["en", "id", "jpn"],
    preload: ["en", "id", "jpn"],
    keySeparator: false,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: translationEn
      },
      jpn: {
        translation: translationJpn
      },
      id: {
        translation: translationId
      }
    }
  });
export default i18n;
