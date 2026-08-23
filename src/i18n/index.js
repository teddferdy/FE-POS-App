import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { translationSelect } from "@/state/translation";

// ponytail: translasi TIDAK di-inline (920KB JSON membuat entry chunk 921KB & LCP 8.3s).
// Dimuat runtime dari /locales/{lng}/translation.json — hanya bahasa aktif yang turun.
//
// ponytail: LanguageDetector dihapus — zustand translationSelect adalah satu-satunya
// sumber kebenaran bahasa (default "id", persist di sessionStorage). Tanpa ini,
// deteksi browser memuat satu file lalu changeLanguage memuat file kedua (~180KB dobel).
const initialLng = translationSelect.getState().translation || "id";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    debug: false,
    lng: initialLng,
    // ponytail: en & id sudah 100% paralel — tanpa fallback kedua file
    // translation.json (~180KB) tidak ikut termuat; jpn tetap fallback ke en
    fallbackLng: (code) => (code === "en" || code === "id" ? [] : ["en"]),
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
