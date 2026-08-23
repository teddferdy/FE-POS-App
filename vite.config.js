import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";

// ponytail: git SHA di-build-time → tag release Sentry, biar error bisa
// dikaitkan dengan deploy tertentu
let gitSha = "unknown";
try {
  gitSha = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  /* fallback tetap "unknown" */
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
    __GIT_SHA__: JSON.stringify(gitSha)
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
