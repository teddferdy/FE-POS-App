import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ReportTable from "../components/organism/ReportTable";
import { getReportData } from "@/services/reportData";
import { formatReportValue } from "@/utils/reportFormat";

let mockUser = { roleType: "super_admin" };
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => opts?.defaultValue ?? k })
}));
jest.mock("react-cookie", () => ({ useCookies: () => [{ user: mockUser }] }));
jest.mock("@/services/reportData", () => ({ getReportData: jest.fn() }));
jest.mock("@/components/organism/abort-controller", () => {
  const Stub = () => <div data-testid="abort-controller" />;
  return Stub;
});

const REPORT = {
  subtitle: "Periode: Hari ini",
  accentColor: "#1d4ed8",
  columns: [
    { key: "productName", label: "Produk", type: "string", align: "left" },
    { key: "profit", label: "Laba", type: "currency", align: "right" },
    { key: "margin", label: "Margin", type: "percent", align: "right" }
  ],
  rows: [
    { productName: "Nasi Goreng", profit: 25000, margin: 12.5 },
    { productName: "Es Teh", profit: -2000, margin: 0.75 }
  ],
  totals: { profit: 23000 }
};

const renderTable = (props = {}) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ReportTable
        reportKey="profitPerProduct"
        params={{ startDate: "2026-10-01" }}
        title="Laba"
        {...props}
      />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { roleType: "super_admin" };
  sessionStorage.clear();
});

describe("formatReportValue (same output as the BE export formatter)", () => {
  test.each([
    [1500000, "currency", "Rp 1.500.000"],
    [1234, "number", "1.234"],
    [12.5, "percent", "12,5%"],
    [0.75, "percent", "0,75%"],
    ["2026-10-05", "date", "05 Okt 2026"],
    [null, "currency", ""],
    ["Kasir 1", "string", "Kasir 1"]
  ])("%p as %s → %s", (value, type, expected) => {
    expect(formatReportValue(value, type)).toBe(expected);
  });
});

describe("ReportTable", () => {
  test("renders the settings columns, formatted values, totals and the accent", async () => {
    getReportData.mockResolvedValue(REPORT);
    const { container } = renderTable({ signedKeys: ["profit"] });
    expect(await screen.findByText("Nasi Goreng")).toBeInTheDocument();
    expect(getReportData).toHaveBeenCalledWith("profitPerProduct", { startDate: "2026-10-01" });
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Produk",
      "Laba",
      "Margin"
    ]);
    expect(screen.getByText("0,75%")).toBeInTheDocument();
    expect(screen.getByText("Rp -2.000")).toHaveClass("text-destructive");
    expect(screen.getByText("Rp 23.000")).toBeInTheDocument();
    expect(screen.getByText("page.reportTable.total")).toBeInTheDocument();
    expect(screen.getByText("Periode: Hari ini")).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ borderTopColor: "#1d4ed8" });
  });

  test("links to the report's settings for users who can open them", async () => {
    getReportData.mockResolvedValue(REPORT);
    renderTable();
    const link = await screen.findByRole("link", { name: /page.reportTable.columnSettings/ });
    expect(link).toHaveAttribute("href", "/report/settings?report=profitPerProduct");
  });

  test("hides the settings link from users without access", async () => {
    mockUser = { roleType: "kasir", accessMenu: [] };
    getReportData.mockResolvedValue(REPORT);
    renderTable();
    await screen.findByText("Nasi Goreng");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("shows the empty text and the error state", async () => {
    getReportData.mockResolvedValueOnce({ ...REPORT, rows: [], totals: null });
    const { unmount } = renderTable({ emptyText: "Tidak ada data" });
    expect(await screen.findByText("Tidak ada data")).toBeInTheDocument();
    unmount();
    getReportData.mockRejectedValueOnce(new Error("boom"));
    renderTable();
    expect(await screen.findByTestId("abort-controller")).toBeInTheDocument();
  });
});
