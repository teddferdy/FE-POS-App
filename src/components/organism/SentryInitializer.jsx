import { sentryReactOptions } from "@/sentry.react.config";
import * as Sentry from "@sentry/react";

const SentryInitializer = () => {
  if (typeof window !== "undefined") {
    Sentry.init(sentryReactOptions);
  }
  return null;
};

export default SentryInitializer;
