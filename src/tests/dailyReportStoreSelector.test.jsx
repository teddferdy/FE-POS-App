import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { format } from "date-fns";
import DailyReport from "../page/report/DailyReport";
import { getReportData } from "../services/reportData";
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
  useNavigate: () => jest.fn(),

  Link: ({ to, children }) => <a href={to}>{children}</a>
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
// The table loads GET /report/data/daily — the rows the export holds.
jest.mock("@/services/reportData", () => ({
  getReportData: jest.fn()
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
  getReportData.mockReset();
  getAllLocation.mockReset();
});

describe("Daily Report — super admin store selector", () => {
  test("Test 1: super_admin sees a store selector with All Stores + store options", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getReportData.mockResolvedValue({ columns: [], rows: [] });

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
    getReportData.mockResolvedValue({ columns: [], rows: [] });

    renderPage();
    await screen.findByRole("combobox");

    await selectStore("Toko A");

    await waitFor(() =>
      expect(getReportData).toHaveBeenCalledWith("daily", expect.objectContaining({ store: "1" }))
    );
  });

  test("Test 3: super_admin with All Stores sends no store param", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getReportData.mockResolvedValue({ columns: [], rows: [] });

    renderPage();

    await waitFor(() => expect(getReportData).toHaveBeenCalled());
    const call = getReportData.mock.calls[0][1];
    expect(call.store).toBeUndefined();
    const today = format(new Date(), "yyyy-MM-dd");
    expect(call).toEqual({ startDate: today, endDate: today });
  });

  test("Test 4: admin (own store) sees no selector and no explicit store param", async () => {
    mockCookieUser = { roleType: "admin", store: 1 };
    seedStores();
    getReportData.mockResolvedValue({ columns: [], rows: [] });

    renderPage();

    await waitFor(() => expect(getReportData).toHaveBeenCalled());
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("page.category.form.storeSection.allStores")).not.toBeInTheDocument();
    const call = getReportData.mock.calls[0][1];
    expect(call.store).toBeUndefined();
  });

  test("Test 5: user (own store) sees no selector and no explicit store param", async () => {
    mockCookieUser = { roleType: "user", store: 1 };
    seedStores();
    getReportData.mockResolvedValue({ columns: [], rows: [] });

    renderPage();

    await waitFor(() => expect(getReportData).toHaveBeenCalled());
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("page.category.form.storeSection.allStores")).not.toBeInTheDocument();
    const call = getReportData.mock.calls[0][1];
    expect(call.store).toBeUndefined();
  });

  test("Test 6: the table shows the settings columns, in order, with export formatting", async () => {
    mockCookieUser = { roleType: "super_admin" };
    seedStores();
    getReportData.mockResolvedValue({
      columns: [
        { key: "netProfit", label: "Laba Bersih", type: "currency", align: "right" },
        { key: "date", label: "Tanggal", type: "date", align: "left" }
      ],
      rows: [{ date: "2026-09-13", netProfit: 50000, totalHpp: 40000 }],
      totals: { netProfit: 50000 },
      accentColor: "#1d4ed8"
    });

    renderPage();

    await screen.findByText("13 Sep 2026");
    const headers = screen.getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers).toEqual([
      "page.reportSettings.columnLabels.daily.netProfit",
      "page.reportSettings.columnLabels.daily.date"
    ]);
    // hidden columns are not rendered even though the row carries them
    expect(screen.queryByText("Rp 40.000")).not.toBeInTheDocument();
    expect(screen.getAllByText("Rp 50.000")).toHaveLength(2); // row + totals
    const today = format(new Date(), "yyyy-MM-dd");
    expect(getReportData).toHaveBeenCalledWith(
      "daily",
      expect.objectContaining({ startDate: today, endDate: today })
    );
  });
});
