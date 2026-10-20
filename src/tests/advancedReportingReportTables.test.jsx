import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import AdvancedReporting from "../page/advanced-reporting/AdvancedReporting";
import { getReportData } from "@/services/reportData";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;
if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),

  Link: ({ to, children }) => <a href={to}>{children}</a>
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1", user: { roleType: "super_admin" } }]
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [{ id: 1, name: "Toko A" }] }))
}));
jest.mock("@/services/reportData", () => ({ getReportData: jest.fn() }));
const mockExportParams = [];
jest.mock("@/components/organism/ExportButtons", () => {
  const ExportButtonsStub = ({ reportKey, buildParams }) => {
    mockExportParams.push([reportKey, buildParams()]);
    return <div data-testid="export-buttons" data-report={reportKey} />;
  };
  return ExportButtonsStub;
});

const DAILY = {
  columns: [
    { key: "date", label: "Tanggal", type: "date", align: "left" },
    { key: "totalPenjualanBersih", label: "Penjualan Bersih", type: "currency", align: "right" }
  ],
  rows: [
    {
      date: "2026-10-01",
      totalPenjualanBersih: 120000,
      totalTransaksi: 8,
      totalCovers: 5,
      netProfit: 30000
    },
    {
      date: "2026-10-02",
      totalPenjualanBersih: 80000,
      totalTransaksi: 4,
      totalCovers: 3,
      netProfit: 20000
    }
  ],
  totals: { totalPenjualanBersih: 200000 }
};
const PRODUCTS = {
  columns: [
    { key: "product", label: "Produk", type: "string", align: "left" },
    { key: "revenue", label: "Pendapatan", type: "currency", align: "right" }
  ],
  rows: [{ product: "Nasi Goreng", revenue: 45000 }],
  totals: { revenue: 45000 }
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AdvancedReporting />
    </QueryClientProvider>
  );
};

const today = format(new Date(), "yyyy-MM-dd");

beforeEach(() => {
  jest.clearAllMocks();
  mockExportParams.length = 0;
  getReportData.mockImplementation((key) =>
    Promise.resolve(
      key === "daily" ? DAILY : key === "productSales" ? PRODUCTS : { columns: [], rows: [] }
    )
  );
});

// The tab tables are the /report/settings reports: same key, same params as
// the export button, so the screen and the downloaded file always match.
describe("AdvancedReporting — tables follow /report/settings", () => {
  test("sales tab = daily report for the picked store and today", async () => {
    renderPage();
    expect(await screen.findByText("01 Okt 2026")).toBeInTheDocument();
    expect(getReportData).toHaveBeenCalledWith("daily", {
      store: "1",
      startDate: today,
      endDate: today
    });
    expect(mockExportParams.at(-1)).toEqual([
      "daily",
      { store: "1", startDate: today, endDate: today }
    ]);
  });

  test("KPI cards add up the same rows as the table (no more Rp 0 cards)", async () => {
    renderPage();
    await screen.findByText("01 Okt 2026");
    expect(screen.getAllByText("Rp 200.000").length).toBeGreaterThan(0); // KPI + totals row
    expect(screen.getByText("12")).toBeInTheDocument(); // transactions 8 + 4
    expect(screen.getByText("8")).toBeInTheDocument(); // guests 5 + 3
    expect(screen.getByText("Rp 50.000")).toBeInTheDocument(); // net profit
  });

  test("the period picker reaches the request as startDate/endDate", async () => {
    renderPage();
    await screen.findByText("01 Okt 2026");
    fireEvent.pointerDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(
      await screen.findByRole("option", { name: "page.advancedReporting.period.monthly" })
    );
    const month = {
      store: "1",
      startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      endDate: format(endOfMonth(new Date()), "yyyy-MM-dd")
    };
    await waitFor(() => expect(getReportData).toHaveBeenCalledWith("daily", month));
  });

  test("product tab shows the productSales report and exports that report", async () => {
    renderPage();
    await screen.findByText("01 Okt 2026");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "page.advancedReporting.tabs.product" }));
    expect(await screen.findByText("Nasi Goreng")).toBeInTheDocument();
    expect(getReportData).toHaveBeenCalledWith("productSales", {
      store: "1",
      startDate: today,
      endDate: today
    });
    expect(mockExportParams.at(-1)[0]).toBe("productSales");
  });
});
