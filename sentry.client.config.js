import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";

import { sentryReactOptions } from "./sentry.react.config";
export default defineConfig({
  plugins: [sentryVitePlugin(sentryReactOptions)],
});