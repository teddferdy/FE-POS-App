import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const sentryReactOptions = {
  dsn: "https://8ef705f2d617308ee20d72e17ec27204@o4508045420421952.ingest.us.sentry.io/4508045432255488",
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", "127.0.0.1", "https://pos-app.duckdns.org"],
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
};

const SentryInitializer = () => {
  const location = useLocation();

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent);

    Sentry.setUser({
      segment: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
      device_name: isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop",
      browser_name: navigator.userAgentData?.brands?.
        map((brand) => brand.brand).
        join(", "),
      email: "admin@pos-app.duckdns.org",
    });
  }, [location]);

  return null;
};

export { SentryInitializer };