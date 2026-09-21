import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterOpenClose from "../page/cash-register/CashRegisterOpenClose";
import CashRegisterCurrent from "../page/cash-register/CashRegisterCurrent";
import {
  openCashRegister,
  getOpenRegisters,
  getCurrentCashRegister
} from "@/services/cash-register";
import { getAllLocation, getLocationDetail } from "@/services/location";
import { toast } from "sonner";
import { getStoreNowParts, getTodayScheduleMinutes } from "@/utils/storeTimezone";

// Phase 39 Batch 6F: informational-only early-opening / overtime-closing
// banners on the register Open and Close screens. Both must compare the
// STORE's local time (never the browser/test-runner's), never block the
// action, stay silent on a closed day (open/close both null), and never
// interfere with the pre-existing "store already has an open register"
// guard on the Open screen.
//
// Fixtures below anchor today's opening hours to the REAL current time in
// a deliberately non-default timezone (America/New_York, never Asia/
// Jakarta, this suite's own system timezone) with a safety margin, rather
// than faking global timers — faking Date/setTimeout would fight React
// Query's internal polling (getWhatsAppStatus refetches every 5s) and
// testing-library's own async waitFor loop.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => (opts?.time != null ? `${k}:${opts.time}` : k)
  })
}));

// A mutable holder so each test can pick cashier vs. super_admin without
// re-mocking the module (jest.mock factories run once per file).
const mockCookieState = {
  value: [{ activeStore: "1", user: { id: 1, roleType: "cashier", store: "1" } }]
};
jest.mock("react-cookie", () => ({
  useCookies: () => mockCookieState.value
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));

jest.mock("@/services/cash-register", () => ({
  openCashRegister: jest.fn(() => Promise.resolve({})),
  getOpenRegisters: jest.fn(),
  getCurrentCashRegister: jest.fn(),
  closeCashRegister: jest.fn(() => Promise.resolve({}))
}));

jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(),
  getLocationDetail: jest.fn()
}));

jest.mock("@/services/invoice", () => ({
  getWhatsAppStatus: jest.fn(() => Promise.resolve({ data: { ready: true } })),
  restartWhatsApp: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

const STORE_TZ = "America/New_York";
const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const minutesToHHMM = (mins) => {
  const wrapped = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Anchors today's (in STORE_TZ) open/close to the real current moment,
// offset by a safety-margin number of minutes, so the fixture is correct
// no matter when the test actually runs.
const buildTodayOpeningHours = ({ openOffsetMin, closeOffsetMin, closedToday = false }) => {
  const { dayName, minutes: nowMinutes } = getStoreNowParts(STORE_TZ);
  return ALL_DAYS.map((day) => {
    if (day !== dayName) return { day, open: "09:00", close: "21:00", isOpen: true };
    if (closedToday) return { day, open: null, close: null, isOpen: false };
    return {
      day,
      open: minutesToHHMM(nowMinutes + openOffsetMin),
      close: minutesToHHMM(nowMinutes + closeOffsetMin),
      isOpen: true
    };
  });
};

const renderWithQuery = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe("Phase 39 Batch 6F — operating-hours informational banners", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockCookieState.value = [
      { activeStore: "1", user: { id: 1, roleType: "cashier", store: "1" } }
    ];
  });

  describe("CashRegisterOpenClose — early-opening notice", () => {
    beforeEach(() => {
      getAllLocation.mockResolvedValue({ data: [{ id: 1, name: "Store A" }] });
      getOpenRegisters.mockResolvedValue({ data: [] });
    });

    test("Test 1 — early opening: shows the notice, keeps Open Register enabled", async () => {
      getLocationDetail.mockResolvedValue({
        data: {
          id: 1,
          timezone: STORE_TZ,
          openingHours: buildTodayOpeningHours({ openOffsetMin: 30, closeOffsetMin: 600 })
        }
      });
      renderWithQuery(<CashRegisterOpenClose />);
      fireEvent.click(await screen.findByText("Rp 100.000"));

      expect(
        await screen.findByText(/page\.cashRegister\.openClose\.earlyOpeningNotice/)
      ).toBeInTheDocument();
      const openBtn = screen.getByText(/page\.cashRegister\.openClose\.openWithAmount/);
      expect(openBtn.closest("button")).not.toBeDisabled();
    });

    test("Test 2 — opening at/after scheduled time: no notice, Open Register enabled", async () => {
      getLocationDetail.mockResolvedValue({
        data: {
          id: 1,
          timezone: STORE_TZ,
          openingHours: buildTodayOpeningHours({ openOffsetMin: -5, closeOffsetMin: 600 })
        }
      });
      renderWithQuery(<CashRegisterOpenClose />);
      fireEvent.click(await screen.findByText("Rp 100.000"));
      await waitFor(() => expect(getLocationDetail).toHaveBeenCalled());

      expect(
        screen.queryByText(/page\.cashRegister\.openClose\.earlyOpeningNotice/)
      ).not.toBeInTheDocument();
      const openBtn = screen.getByText(/page\.cashRegister\.openClose\.openWithAmount/);
      expect(openBtn.closest("button")).not.toBeDisabled();
    });

    test("Test 3 — late opening: no warning, Open Register enabled", async () => {
      getLocationDetail.mockResolvedValue({
        data: {
          id: 1,
          timezone: STORE_TZ,
          openingHours: buildTodayOpeningHours({ openOffsetMin: -120, closeOffsetMin: 600 })
        }
      });
      renderWithQuery(<CashRegisterOpenClose />);
      fireEvent.click(await screen.findByText("Rp 100.000"));
      await waitFor(() => expect(getLocationDetail).toHaveBeenCalled());

      expect(
        screen.queryByText(/page\.cashRegister\.openClose\.earlyOpeningNotice/)
      ).not.toBeInTheDocument();
      const openBtn = screen.getByText(/page\.cashRegister\.openClose\.openWithAmount/);
      expect(openBtn.closest("button")).not.toBeDisabled();
    });

    test("Test 4 — closed day (open/close both null): no notice, no crash, Open Register enabled", async () => {
      getLocationDetail.mockResolvedValue({
        data: {
          id: 1,
          timezone: STORE_TZ,
          openingHours: buildTodayOpeningHours({ closedToday: true })
        }
      });
      renderWithQuery(<CashRegisterOpenClose />);
      fireEvent.click(await screen.findByText("Rp 100.000"));
      await waitFor(() => expect(getLocationDetail).toHaveBeenCalled());

      expect(
        screen.queryByText(/page\.cashRegister\.openClose\.earlyOpeningNotice/)
      ).not.toBeInTheDocument();
      const openBtn = screen.getByText(/page\.cashRegister\.openClose\.openWithAmount/);
      expect(openBtn.closest("button")).not.toBeDisabled();
    });

    test("Test 8 — the existing 'store already open' guard is unaffected by the hours notice", async () => {
      mockCookieState.value = [
        { activeStore: "1", user: { id: 1, roleType: "super_admin", store: "1" } }
      ];
      // Deliberately ALSO early-opening, to prove the two conditions
      // coexist independently rather than one masking the other.
      getLocationDetail.mockResolvedValue({
        data: {
          id: 1,
          timezone: STORE_TZ,
          openingHours: buildTodayOpeningHours({ openOffsetMin: 30, closeOffsetMin: 600 })
        }
      });
      getOpenRegisters.mockResolvedValue({ data: [{ store: 1 }] });
      renderWithQuery(<CashRegisterOpenClose />);

      // Existing guard's warning still renders exactly as before.
      expect(
        await screen.findByText("page.cashRegister.openClose.storeOpenWarning")
      ).toBeInTheDocument();
      // The unrelated operating-hours notice renders alongside it.
      expect(
        await screen.findByText(/page\.cashRegister\.openClose\.earlyOpeningNotice/)
      ).toBeInTheDocument();

      fireEvent.click(await screen.findByText("Rp 100.000"));
      fireEvent.click(screen.getByText(/page\.cashRegister\.openClose\.openWithAmount/));

      // The guard still blocks the mutation exactly as before — an
      // operating-hours notice must never suppress or replace it.
      expect(toast.error).toHaveBeenCalledWith(
        "page.cashRegister.openClose.fail",
        expect.objectContaining({ description: "page.cashRegister.openClose.storeOpenError" })
      );
      expect(openCashRegister).not.toHaveBeenCalled();
    });
  });

  describe("CashRegisterCurrent — overtime-closing notice", () => {
    const mockRegister = (openingHours) => {
      getCurrentCashRegister.mockResolvedValue({
        data: {
          register: {
            id: 9001,
            status: "open",
            openedAt: "2026-09-12T10:00:00.000Z",
            openingBalance: 100000,
            notes: null,
            userData: { fullName: "angga" },
            storeData: { name: "Store A", timezone: STORE_TZ, openingHours }
          },
          currentSales: 0,
          totalExpenses: 0,
          expectedCash: 100000
        }
      });
    };

    test("Test 5 — overtime closing: shows the notice, Close Register remains enabled", async () => {
      mockRegister(buildTodayOpeningHours({ openOffsetMin: -600, closeOffsetMin: -30 }));
      renderWithQuery(<CashRegisterCurrent />);

      expect(
        await screen.findByText(/page\.cashRegister\.current\.overtimeNotice/)
      ).toBeInTheDocument();
      const closeBtn = screen.getByText("page.cashRegister.current.closeBtn");
      expect(closeBtn.closest("button")).not.toBeDisabled();
    });

    test("Test 6 — closing before/at scheduled time: no overtime notice, Close Register enabled", async () => {
      mockRegister(buildTodayOpeningHours({ openOffsetMin: -600, closeOffsetMin: 5 }));
      renderWithQuery(<CashRegisterCurrent />);
      await screen.findByText("page.cashRegister.current.closeBtn");

      expect(
        screen.queryByText(/page\.cashRegister\.current\.overtimeNotice/)
      ).not.toBeInTheDocument();
      const closeBtn = screen.getByText("page.cashRegister.current.closeBtn");
      expect(closeBtn.closest("button")).not.toBeDisabled();
    });
  });

  // Test 7 — direct, deterministic proof that the schedule comparison uses
  // the STORE timezone, never the test runner's local one. Uses a fixed
  // instant and an explicit timezone (never relies on system/local TZ).
  describe("storeTimezone.js — schedule comparison uses the store timezone (Test 7)", () => {
    test("a fixed UTC instant resolves to different day/time depending on the timezone passed in", () => {
      // 2026-09-12T22:30:00.000Z:
      //  - in America/New_York (EDT, UTC-4 in September): 18:30 the same day.
      //  - in Asia/Jakarta (UTC+7, this suite's own system timezone): 05:30
      //    the NEXT calendar day — a different day AND a different
      //    time-of-day, so using the wrong timezone would misclassify
      //    both which schedule entry applies and the early/late result.
      const now = new Date("2026-09-12T22:30:00.000Z");

      const nyParts = getStoreNowParts("America/New_York", now);
      const jakartaParts = getStoreNowParts("Asia/Jakarta", now);

      expect(nyParts.minutes).toBe(18 * 60 + 30);
      expect(jakartaParts.minutes).toBe(5 * 60 + 30);
      expect(nyParts.dayName).not.toBe(jakartaParts.dayName);

      const openingHours = [{ day: nyParts.dayName, open: "18:00", close: "23:00", isOpen: true }];
      const result = getTodayScheduleMinutes(openingHours, "America/New_York", now);
      expect(result).toEqual({
        nowMinutes: 18 * 60 + 30,
        openMinutes: 18 * 60,
        closeMinutes: 23 * 60
      });

      // The same openingHours array, read under Jakarta's day name, finds
      // no matching entry at all (proves it isn't silently falling back to
      // a hardcoded/default timezone that would happen to "work").
      const wrongTzResult = getTodayScheduleMinutes(openingHours, "Asia/Jakarta", now);
      expect(wrongTzResult).toBeNull();
    });
  });
});
