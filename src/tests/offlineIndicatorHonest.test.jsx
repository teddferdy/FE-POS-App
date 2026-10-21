/* global __dirname */
import React from "react";
import fs from "fs";
import path from "path";
import { render, screen, act } from "@testing-library/react";
import { toast } from "sonner";
import { OfflineIndicator, OfflineBanner } from "@/components/ui/OfflineIndicator";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), warning: jest.fn() } }));

// DR-25: the POS has no offline mode. The indicators used to promise
// "data saved locally" and a sync queue that never existed (FG-UX-09).

const setOnline = (online) => {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: online });
  act(() => {
    window.dispatchEvent(new Event(online ? "online" : "offline"));
  });
};

afterEach(() => {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  jest.clearAllMocks();
});

test("going offline warns that actions are blocked, coming back says so", () => {
  render(<OfflineIndicator />);
  expect(screen.queryByRole("status")).toBeNull();

  setOnline(false);
  expect(toast.warning).toHaveBeenCalledWith("offline.goneOffline", {
    description: "offline.actionsBlocked"
  });
  expect(screen.getByRole("status").textContent).toContain("offline.offlineMode");

  setOnline(true);
  expect(toast.success).toHaveBeenCalledWith("offline.backOnline", {
    description: "offline.backOnlineHint"
  });
  expect(screen.queryByRole("status")).toBeNull();
});

test("the dashboard banner shows only while offline", () => {
  render(<OfflineBanner />);
  expect(screen.queryByRole("alert")).toBeNull();
  setOnline(false);
  expect(screen.getByRole("alert").textContent).toContain("offline.offlineBanner");
});

describe.each([
  "public/locales/id/translation.json",
  "public/locales/en/translation.json",
  "src/i18n/id.json",
  "src/i18n/en.json"
])("%s", (file) => {
  const translations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8"));
  const offline = Object.entries(translations).filter(([k]) => k.startsWith("offline."));

  test("resolves every key the indicators use", () => {
    [
      "offline.offlineMode",
      "offline.offlineBanner",
      "offline.goneOffline",
      "offline.actionsBlocked",
      "offline.backOnline",
      "offline.backOnlineHint"
    ].forEach((key) => expect(translations[key]?.trim()).toBeTruthy());
  });

  test("promises no local saving or syncing", () => {
    offline.forEach(([, value]) => {
      expect(value).not.toMatch(
        /tersimpan lokal|disimpan di perangkat, akan|saved locally|saved on device|sinkron|sync/i
      );
    });
  });
});
