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
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "zustand", "lucide-react"],
          query: ["react-query", "axios"],
          i18n: [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
            "i18next-http-backend"
          ],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "cmdk",
            "vaul"
          ],
          charts: ["recharts", "react-resizable-panels"],
          sentry: ["@sentry/react"],
          misc: [
            "socket.io-client",
            "sonner",
            "qrcode.react",
            "date-fns",
            "next-themes",
            "react-cookie"
          ],
          form: ["react-hook-form", "@hookform/resolvers", "zod"],
          map: ["leaflet", "react-leaflet"]
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
