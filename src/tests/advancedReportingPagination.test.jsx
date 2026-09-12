import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AdvancedReporting from "../page/advanced-reporting/AdvancedReporting";
import {
  getReportingSalesSummary,
  getReportingProductSales,
  getReportingCategorySales,
  getReportingKasirPerformance
} from "@/services/report";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(""), jest.fn()]
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
jest.mock("@/services/report", () => ({
  getReportingSalesSummary: jest.fn(),
  getReportingProductSales: jest.fn(),
  getReportingCategorySales: jest.fn(),
  getReportingKasirPerformance: jest.fn()
}));
jest.mock(
  "@/components/organism/ExportButtons",
  () =>
    function ExportButtonsStub() {
      return <div />;
    }
);

const salesRow = (page) => ({
  success: true,
  data: [
    page === 1
      ? {
          report_date: "2026-09-12",
          total_sales: "120000.00",
          total_transactions: 8,
          total_items: 14,
          average_transaction: "15000.00",
          total_discount: "1000.00",
          total_tax: "1200.00"
        }
      : {
          report_date: "2026-09-13",
          total_sales: "90000.00",
          total_transactions: 6,
          total_items: 10,
          average_transaction: "15000.00",
          total_discount: "500.00",
          total_tax: "900.00"
        }
  ],
  pagination: { total: 25, page, limit: 10, totalPages: 3 }
});

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AdvancedReporting />
    </QueryClientProvider>
  );
  return queryClient;
};

// Regression coverage for Phase 9 P1 finding F9-22. The sales/product/
// category/kasir tables declared `{key,label}` columns that match neither
// the shared DataTable contract nor the backend's snake_case row fields, so
// every cell (and header) rendered blank. The reporting queries also never
// sent `page`/`limit`, so the detail tables had no pagination at all and
// fetched unbounded. Reverting the canonical columns or the page/limit
// wiring makes these tests fail.
describe("AdvancedReporting — table rendering and pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getReportingSalesSummary.mockImplementation(({ page = 1 } = {}) =>
      Promise.resolve(salesRow(page))
    );
    getReportingProductSales.mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 10 }
    });
    getReportingCategorySales.mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 10 }
    });
    getReportingKasirPerformance.mockResolvedValue({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 10 }
    });
  });

  test("sales table renders real backend row values instead of blank cells", async () => {
    renderPage();
    expect(await screen.findByText("2026-09-12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText(/120\.000/)).toBeInTheDocument();
  });

  test("reporting queries are sent with explicit page and limit", async () => {
    renderPage();
    await waitFor(() => expect(getReportingSalesSummary).toHaveBeenCalled());
    const args = getReportingSalesSummary.mock.calls[0][0];
    expect(args.page).toBe(1);
    expect(args.limit).toBe(10);
  });

  test("pagination controls advance the sales page and trigger a refetch with page=2", async () => {
    renderPage();
    const next = await screen.findByLabelText("common.nextPage");
    expect(next).toBeEnabled();

    fireEvent.click(next);

    expect(await screen.findByText("2026-09-13")).toBeInTheDocument();
    expect(getReportingSalesSummary).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });
});
