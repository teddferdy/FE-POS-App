/* global __GIT_SHA__, __TRANSLATION_REV__ */
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
// ponytail: cache-buster pakai __GIT_SHA__ + __TRANSLATION_REV__ (di-inject
// vite.config.js). /locales pernah di-cache Vercel 1 hari, browser pegang
// translation.json lama → key baru muncul mentah. rev = MD5 mtime keempat file
// locale, jadi lokasi ini berubah setiap kali file bahasa berubah walau belum
// di-commit (git SHA saja statis antar-commit).
//
// ponytail: di dev, __TRANSLATION_REV__ dihitung saat vite.config di-eval (awal
// server) → server jalan berhari-hari + edit file bahasa → rev lama dipakai,
// browser serv file basi → key baru mentah lagi. Solusi: dev selalu pakai
// timestamp per-reload (URL berubah → fetch fresh), prod tetap git-sha+rev dgn
// cache permanen.
const baseRef =
  typeof __GIT_SHA__ !== "undefined" && __GIT_SHA__
    ? __GIT_SHA__
    : new Date().valueOf().toString(36);
const translationRev =
  typeof __TRANSLATION_REV__ !== "undefined" && __TRANSLATION_REV__ ? __TRANSLATION_REV__ : "0";
const liveRef = import.meta.env && import.meta.env.DEV ? new Date().valueOf().toString(36) : "";
const buildRef = `${liveRef || baseRef}-${translationRev}`;
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
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${buildRef}`
    },
    react: { useSuspense: false }
  });
export default i18n;
