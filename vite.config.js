import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

// ponytail: git SHA di-build-time → tag release Sentry, biar error bisa
// dikaitkan dengan deploy tertentu
let gitSha = "unknown";
try {
  gitSha = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  /* fallback tetap "unknown" */
}

// ponytail: revisi translasi = MD5 mtime keempat file locale. Cache-buster
// /locales berubah kalau file bahasa berubah walaupun BELUM di-commit
// (git SHA saja tidak cukup: key baru muncul mentah karena URL lama tetap
// sama dan browser/Vercel memakai respons JSON basi).
// Safety: setiap path ditulis literal (tanpa iterasi array) supaya static
// analyzer tidak menganggap argumen fs/path berasal dari input eksternal.
let translationRev = "0";
try {
  const revSeed = [
    fs.statSync(path.resolve(__dirname, "src/i18n/id.json")).mtimeMs.toString(),
    fs.statSync(path.resolve(__dirname, "src/i18n/en.json")).mtimeMs.toString(),
    fs.statSync(path.resolve(__dirname, "public/locales/id/translation.json")).mtimeMs.toString(),
    fs.statSync(path.resolve(__dirname, "public/locales/en/translation.json")).mtimeMs.toString()
  ].join("|");
  translationRev = crypto.createHash("md5").update(revSeed).digest("hex").slice(0, 8);
} catch {
  /* fallback tetap "0" */
}

// ponytail: HANYA isolasi lib super-heavy ke chunk sendiri beserta seluruh
// dependensinya; sisanya default Rollup. Object-form/manualChunks granuler
// terbukti membuat simbol lintas-chunk diekspor lewat chunk charts sehingga
// SEMUA halaman ikut memuat recharts (423KB).
const chartDeps = [
  "/node_modules/recharts/",
  "/node_modules/react-resizable-panels/",
  "/node_modules/react-smooth/",
  "/node_modules/victory-vendor/",
  "/node_modules/victory/",
  "/node_modules/d3-",
  "/node_modules/internmap/",
  "/node_modules/lodash/",
  "/node_modules/react-transition-group/",
  "/node_modules/recharts-scale/"
];

export default defineConfig({
  plugins: [react()],
  define: {
    __GIT_SHA__: JSON.stringify(gitSha),
    __TRANSLATION_REV__: JSON.stringify(translationRev)
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // ponytail: lucide-react dipecah jadi ±150 file ikon 0.5KB oleh default
        // splitting — digabung 1 chunk agar critical chain page dalam tidak
        // menumpuk request kecil. Leaf dep (hanya butuh react), aman dari bleeding.
        manualChunks(id) {
          if (id.includes("/node_modules/lucide-react/")) return "icons";
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
