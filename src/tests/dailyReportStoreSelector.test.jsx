import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { format } from "date-fns";
import DailyReport from "../page/report/DailyReport";
import { getDailyReport } from "../services/report";
import { getAllLocation } from "../services/location";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

let mockCookieUser = { roleType: "super_admin" };

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn()
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockCookieUser }]
}));
jest.mock("@/services/report", () => ({
  getDailyReport: jest.fn()
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn()
}));
jest.mock("@/hooks/useGlobalStoreFilter", () => {
  const { useState: hookUseState } = jest.requireActual("react");
  return {
    useGlobalStoreFilter: () => {
      const [value, setValue] = hookUseState("all");
      const setFilter = (v) => setValue(v === "all" ? "all" : v);
      return [String(value), setFilter];
    }
  };
});
jest.mock("@/components/organism/abort-controller", () => {
  const AbortControllerStub = () => <div data-testid="abort-controller" />;
  AbortControllerStub.displayName = "AbortControllerStub";
  return AbortControllerStub;
});
jest.mock("@/components/organism/ExportButtons", () => {
  const ExportButtonsStub = () => <div data-testid="export-buttons" />;
  ExportButtonsStub.displayName = "ExportButtonsStub";
  return ExportButtonsStub;
});

const seedStores = () => {
  getAllLocation.mockResolvedValue({
    data: [
      { id: 1, name: "Toko A" },
      { id: 2, name: "Toko B" }
    ]
  });
};

const renderPage = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, cacheTime: 0 } }
  });
  return render(
    <QueryClientProvider client={qc}>
      <DailyReport />
    </QueryClientProvider>
  );
};

const selectStore = async (storeName) => {
  fireEvent.pointerDown(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("combobox"));
  const option = await screen.findByRole("option", { name: storeName });
  fireEvent.click(option);
};

beforeEach(() => {
  getDailyReport.mockReset();
  getAllLocation.mockReset();
});

describe("Daily Report — super admin store selector", () => {
  test("Test 1: super_admin sees a store selector with All Stores + store options", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getDailyReport.mockResolvedValue({ data: [] });

    renderPage();

    const trigger = await screen.findByRole("combobox");
    expect(trigger).toHaveTextContent("page.category.form.storeSection.allStores");

    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    expect(await screen.findByRole("option", { name: "Toko A" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Toko B" })).toBeInTheDocument();
  });

  test("Test 2: super_admin selecting a specific store scopes the request", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getDailyReport.mockResolvedValue({ data: [] });

    renderPage();
    await screen.findByRole("combobox");

    await selectStore("Toko A");

    await waitFor(() =>
      expect(getDailyReport).toHaveBeenCalledWith(expect.objectContaining({ store: "1" }))
    );
  });

  test("Test 3: super_admin with All Stores sends no store param", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getDailyReport.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => expect(getDailyReport).toHaveBeenCalled());
    const call = getDailyReport.mock.calls[0][0];
    expect(call.store).toBeUndefined();
    const today = format(new Date(), "yyyy-MM-dd");
    expect(call).toEqual({ startDate: today, endDate: today });
  });

  test("Test 4: admin (own store) sees no selector and no explicit store param", async () => {
    mockCookieUser = { roleType: "admin", store: 1 };
    seedStores();
    getDailyReport.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => expect(getDailyReport).toHaveBeenCalled());
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("page.category.form.storeSection.allStores")).not.toBeInTheDocument();
    const call = getDailyReport.mock.calls[0][0];
    expect(call.store).toBeUndefined();
  });

  test("Test 5: user (own store) sees no selector and no explicit store param", async () => {
    mockCookieUser = { roleType: "user", store: 1 };
    seedStores();
    getDailyReport.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => expect(getDailyReport).toHaveBeenCalled());
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("page.category.form.storeSection.allStores")).not.toBeInTheDocument();
    const call = getDailyReport.mock.calls[0][0];
    expect(call.store).toBeUndefined();
  });

  test("Test 6: existing daily report behavior preserved for super_admin", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getDailyReport.mockResolvedValue({
      data: [
        {
          id: 1,
          tanggal: "2026-09-13",
          totalTransaksi: 5,
          totalPenjualanBersih: 100000,
          totalHpp: 40000,
          foodCostPersen: 40,
          grossProfit: 60000,
          netProfit: 50000,
          totalCovers: 8
        }
      ]
    });

    renderPage();

    await screen.findByText("2026-09-13");
    const today = format(new Date(), "yyyy-MM-dd");
    expect(getDailyReport).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: today, endDate: today })
    );
  });
});
