import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { toast } from "sonner";
import ReportSettingsPage from "../page/report/ReportSettingsPage";
import { getReportConfigMeta, getReportConfigs, saveReportConfig } from "../services/reportConfig";

let mockSearch = "";
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(mockSearch), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => opts?.defaultValue ?? k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("react-cookie", () => ({ useCookies: () => [{ user: null }] }));

const META = [
  {
    key: "daily",
    label: "Laporan Harian",
    archetype: "summary",
    totals: ["netProfit"],
    columns: [
      { key: "date", label: "Tanggal", type: "date" },
      { key: "totalTransaksi", label: "Transaksi", type: "number" },
      { key: "netProfit", label: "Laba Bersih", type: "currency" }
    ]
  },
  {
    key: "bestSeller",
    label: "Produk Terlaris",
    archetype: "ranking",
    totals: ["sold"],
    columns: [
      { key: "name", label: "Produk", type: "string" },
      { key: "sold", label: "Terjual", type: "number" }
    ]
  },
  {
    key: "cashFlow",
    label: "Arus Kas",
    archetype: "statement",
    totals: [],
    columns: [
      { key: "keterangan", label: "Keterangan", type: "string" },
      { key: "nominal", label: "Nominal", type: "currency" }
    ]
  }
];

jest.mock("../services/reportConfig", () => ({
  getReportConfigMeta: jest.fn(),
  getReportConfigs: jest.fn(),
  saveReportConfig: jest.fn(() => Promise.resolve({ data: {} }))
}));

let queryClient;
const renderPage = () => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.spyOn(queryClient, "invalidateQueries");
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportSettingsPage />
    </QueryClientProvider>
  );
};
const ready = () => screen.findByRole("button", { name: /Laporan Harian/ });
const shownOrder = () =>
  within(screen.getByText("page.reportSettings.shownColumns").nextElementSibling)
    .getAllByRole("listitem")
    .map((li) => li.textContent.replace(/^\d+/, "").replace(/page\.reportSettings.*$/, ""));
const saveButton = () => screen.getByRole("button", { name: /common.save/ });

beforeEach(() => {
  jest.clearAllMocks();
  mockSearch = "";
  getReportConfigMeta.mockResolvedValue({ data: META });
  getReportConfigs.mockResolvedValue({ data: [] });
});

describe("ReportSettingsPage", () => {
  test("lists the reports and opens the first one with all its columns", async () => {
    renderPage();
    await ready();
    expect(screen.getByRole("button", { name: /Produk Terlaris/ })).toBeInTheDocument();
    expect(shownOrder()).toEqual(["Tanggal", "Transaksi", "Laba Bersih"]);
    expect(screen.getByText("page.reportSettings.appliesNote")).toBeInTheDocument();
  });

  test("Save is disabled until something changes", async () => {
    renderPage();
    await ready();
    expect(saveButton()).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Laba Bersih" }));
    expect(saveButton()).not.toBeDisabled();
    // re-adding a column appends it; here it lands back where it was, so the
    // page is clean again
    fireEvent.click(screen.getByRole("checkbox", { name: "Laba Bersih" }));
    expect(saveButton()).toBeDisabled();
  });

  test("the list shows the saved order, and moving a column changes what is saved", async () => {
    getReportConfigs.mockResolvedValue({
      data: [
        { key: "daily", config: { selectedColumns: ["netProfit", "date"], accentColor: "#1d4ed8" } }
      ]
    });
    renderPage();
    await ready();
    expect(shownOrder()).toEqual(["Laba Bersih", "Tanggal"]);
    expect(screen.getByText("page.reportSettings.hiddenColumns")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "page.reportSettings.moveDown: Laba Bersih" })
    );
    expect(shownOrder()).toEqual(["Tanggal", "Laba Bersih"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Transaksi" }));
    fireEvent.click(screen.getByRole("switch", { name: "page.reportSettings.showEmail" }));
    fireEvent.click(saveButton());

    await waitFor(() => expect(saveReportConfig).toHaveBeenCalled());
    expect(saveReportConfig).toHaveBeenCalledWith("daily", {
      selectedColumns: ["date", "netProfit", "totalTransaksi"],
      accentColor: "#1d4ed8",
      branding: { showLogo: true, showAddress: true, showPhone: true, showEmail: false }
    });
    // report tables refetch with the new columns
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["report-data"]);
  });

  test("the last shown column cannot be removed", async () => {
    getReportConfigs.mockResolvedValue({
      data: [{ key: "daily", config: { selectedColumns: ["date"] } }]
    });
    renderPage();
    await ready();
    fireEvent.click(screen.getByRole("checkbox", { name: "Tanggal" }));
    expect(toast.error).toHaveBeenCalledWith("page.reportSettings.requiredColumn");
    expect(shownOrder()).toEqual(["Tanggal"]);
  });

  test("reset to default brings back every column in the default order", async () => {
    getReportConfigs.mockResolvedValue({
      data: [{ key: "daily", config: { selectedColumns: ["netProfit"], accentColor: "#be123c" } }]
    });
    renderPage();
    await ready();
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.resetDefault/ }));
    expect(shownOrder()).toEqual(["Tanggal", "Transaksi", "Laba Bersih"]);
    expect(screen.getByRole("radio", { name: "page.reportSettings.accent.slate" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  test("switching report with unsaved changes asks before discarding them", async () => {
    renderPage();
    await ready();
    fireEvent.click(screen.getByRole("checkbox", { name: "Transaksi" }));
    fireEvent.click(screen.getByRole("button", { name: /Produk Terlaris/ }));

    expect(await screen.findByText("page.reportSettings.discardDesc")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("page.reportSettings.discardDesc")).not.toBeInTheDocument()
    );
    expect(screen.getByRole("heading", { name: "Laporan Harian" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Produk Terlaris/ }));
    fireEvent.click(await screen.findByRole("button", { name: "modal.discardConfirm" }));
    expect(await screen.findByRole("heading", { name: "Produk Terlaris" })).toBeInTheDocument();
  });

  test("?report=<key> (from a report page's Column settings link) opens that report", async () => {
    mockSearch = "report=cashFlow";
    renderPage();
    expect(await screen.findByRole("heading", { name: "Arus Kas" })).toBeInTheDocument();
  });

  test("PDF preview shows the shown columns in order, sample values and totals", async () => {
    getReportConfigs.mockResolvedValue({
      data: [
        {
          key: "daily",
          config: { selectedColumns: ["netProfit", "date"], branding: { showEmail: false } }
        }
      ]
    });
    renderPage();
    await ready();
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.preview/ }));
    const pdf = await screen.findByTestId("report-preview-pdf");
    const headers = within(pdf)
      .getAllByRole("columnheader")
      .map((th) => th.textContent);
    expect(headers).toEqual(["Laba Bersih", "Tanggal"]);
    expect(within(pdf).getByText("01 Okt 2026")).toBeInTheDocument();
    expect(within(pdf).getByText("Rp 2.840.000")).toBeInTheDocument(); // totals row
    expect(within(pdf).getByText("page.reportSettings.previewBrandPhone")).toBeInTheDocument();
    expect(
      within(pdf).queryByText("page.reportSettings.previewBrandEmail")
    ).not.toBeInTheDocument();
  });

  test("Excel preview follows the ranking and cash-flow layouts", async () => {
    renderPage();
    await ready();
    fireEvent.click(screen.getByRole("button", { name: /Produk Terlaris/ }));
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.preview/ }));
    fireEvent.mouseDown(
      await screen.findByRole("tab", { name: /page.reportSettings.previewTabExcel/ })
    );
    const ranking = await screen.findByTestId("report-preview-excel");
    expect(within(ranking).getByText("page.reportSettings.previewShare")).toBeInTheDocument();
    expect(within(ranking).getByText("page.reportSettings.sigPreparedBy")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "common.close" }));

    fireEvent.click(screen.getByRole("button", { name: /Arus Kas/ }));
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.preview/ }));
    fireEvent.mouseDown(
      await screen.findByRole("tab", { name: /page.reportSettings.previewTabExcel/ })
    );
    const statement = await screen.findByTestId("report-preview-excel");
    expect(within(statement).getByText("page.reportSettings.previewIncome")).toBeInTheDocument();
    expect(within(statement).getByText("page.reportSettings.previewExpense")).toBeInTheDocument();
    expect(within(statement).getByText("page.reportSettings.previewSaldo")).toBeInTheDocument();
  });
});

// Regression coverage for a bug where a failed fetch left `meta` at its
// initial empty array — rendering identically to "no reports configured,"
// with no way to tell the two apart or retry.
describe("ReportSettingsPage — API failure is a distinct error state, not empty", () => {
  test("shows a distinct error state with retry on fetch failure, not the empty list", async () => {
    getReportConfigMeta.mockRejectedValue(new Error("network down"));
    getReportConfigs.mockRejectedValue(new Error("network down"));
    renderPage();
    await waitFor(() => expect(screen.getByText("common.loadError")).toBeInTheDocument());
    expect(screen.getByText("common.retry")).toBeInTheDocument();
  });

  test("retry re-invokes the fetch and can recover to the normal list", async () => {
    getReportConfigMeta
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ data: META });
    renderPage();
    await waitFor(() => expect(screen.getByText("common.loadError")).toBeInTheDocument());
    fireEvent.click(screen.getByText("common.retry"));
    await ready();
    expect(screen.queryByText("common.loadError")).not.toBeInTheDocument();
    expect(getReportConfigMeta).toHaveBeenCalledTimes(2);
  });
});
