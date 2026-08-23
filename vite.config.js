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
        // ponytail: manualChunks dinonaktifkan — chunking default Rollup
        // tidak membuat re-export lintas-chunk seperti config manual sebelumnya
        manualChunksDisabled(id) {
          if (!id.includes("node_modules")) return;
          // ponytail: prop-types dipakai eager & oleh dep recharts — wajib
          // terpisah agar entry tidak menyeret chunk charts
          if (
            id.includes("/node_modules/prop-types/") ||
            id.includes("/node_modules/react-is/")
          )
            return "pt";
          if (chartDeps.some((n) => id.includes(n))) return "charts";
          if (id.includes("@sentry")) return "sentry";
          if (id.includes("/leaflet") || id.includes("react-leaflet"))
            return "map";
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
