import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportSettingsPage from "../page/report/ReportSettingsPage";
import { getReportConfigMeta, getReportConfigs } from "../services/reportConfig";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn()
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("react-cookie", () => ({ useCookies: () => [{ user: null }] }));

const META = {
  data: [
    {
      key: "daily",
      label: "Laporan Harian",
      archetype: "summary",
      columns: [
        { key: "tanggal", label: "Tanggal", type: "date" },
        { key: "netProfit", label: "Laba Bersih", type: "currency" }
      ]
    },
    {
      key: "sales",
      label: "Ringkasan Penjualan",
      archetype: "summary",
      columns: [{ key: "sales", label: "Total Penjualan", type: "currency" }]
    },
    {
      key: "bestSeller",
      label: "Produk Terlaris",
      archetype: "ranking",
      columns: [
        { key: "name", label: "Produk", type: "string" },
        { key: "sold", label: "Terjual", type: "number" }
      ]
    },
    {
      key: "cashFlow",
      label: "Arus Kas",
      archetype: "statement",
      columns: [
        { key: "keterangan", label: "Keterangan", type: "string" },
        { key: "nominal", label: "Nominal", type: "currency" }
      ]
    },
    {
      key: "kasir",
      label: "Kinerja Kasir",
      archetype: "roster",
      columns: [
        { key: "cashier", label: "Kasir", type: "string" },
        { key: "totalSales", label: "Total Penjualan", type: "currency" }
      ]
    }
  ]
};

jest.mock("../services/reportConfig", () => ({
  getReportConfigMeta: jest.fn(() => Promise.resolve({ data: META.data })),
  getReportConfigs: jest.fn(() => Promise.resolve({ data: [] })),
  getReportConfig: jest.fn(() => Promise.resolve({ data: { key: "daily", config: null } })),
  saveReportConfig: jest.fn(() =>
    Promise.resolve({
      data: { key: "daily", config: { selectedColumns: [], accentColor: "#0f172a" } }
    })
  )
}));

describe("ReportSettingsPage", () => {
  test("renders report list from meta", async () => {
    render(<ReportSettingsPage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Laporan Harian/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ringkasan Penjualan/i })).toBeInTheDocument();
    });
  });

  test("saves selected config on save click", async () => {
    render(<ReportSettingsPage />);
    await waitFor(() => screen.getByRole("button", { name: /Laporan Harian/i }));
    fireEvent.click(screen.getByRole("button", { name: /Laporan Harian/i }));
    fireEvent.click(screen.getByRole("button", { name: /common.save/i }));
    await waitFor(() => {
      // eslint-disable-next-line no-undef
      const { saveReportConfig } = require("../services/reportConfig");
      expect(saveReportConfig).toHaveBeenCalled();
      const [key, config] = saveReportConfig.mock.calls[0];
      expect(key).toBe("daily");
      expect(config.accentColor).toBeDefined();
      expect(Array.isArray(config.selectedColumns)).toBe(true);
    });
  });

  test("opens preview dialog with selected columns", async () => {
    render(<ReportSettingsPage />);
    await waitFor(() => screen.getByRole("button", { name: /Laporan Harian/i }));
    fireEvent.click(screen.getByRole("button", { name: /Laporan Harian/i }));
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.preview/i }));
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.previewTitle/i)).toBeInTheDocument();
    });
  });

  test("preview dialog shows PDF tab content by default and switches to Excel tab", async () => {
    render(<ReportSettingsPage />);
    await waitFor(() => screen.getByRole("button", { name: /Laporan Harian/i }));
    fireEvent.click(screen.getByRole("button", { name: /Laporan Harian/i }));
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.preview/i }));
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.previewTabPdf/i)).toBeInTheDocument();
      expect(screen.getByText(/page.reportSettings.previewPdfFooter/i)).toBeInTheDocument();
    });
    fireEvent.mouseDown(screen.getByRole("tab", { name: /page.reportSettings.previewTabExcel/i }));
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.previewExcelSheetName/i)).toBeInTheDocument();
    });
  });

  const openExcelPreview = async (reportName) => {
    render(<ReportSettingsPage />);
    await waitFor(() => screen.getByRole("button", { name: new RegExp(reportName, "i") }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(reportName, "i") }));
    fireEvent.click(screen.getByRole("button", { name: /page.reportSettings.preview/i }));
    await waitFor(() => screen.getByRole("tab", { name: /page.reportSettings.previewTabExcel/i }));
    fireEvent.mouseDown(screen.getByRole("tab", { name: /page.reportSettings.previewTabExcel/i }));
  };

  test("shows summary archetype preview with signature block", async () => {
    await openExcelPreview("Laporan Harian");
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.archetype.summary/i)).toBeInTheDocument();
      expect(screen.getByText(/page.reportSettings.sigPreparedBy/i)).toBeInTheDocument();
      expect(screen.getByText(/page.reportSettings.sigKnownBy/i)).toBeInTheDocument();
      expect(screen.getByText(/page.reportSettings.sigApprovedBy/i)).toBeInTheDocument();
    });
  });

  test("shows ranking archetype preview with share column", async () => {
    await openExcelPreview("Produk Terlaris");
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.archetype.ranking/i)).toBeInTheDocument();
      expect(screen.getByText(/page.reportSettings.previewShare/i)).toBeInTheDocument();
    });
  });

  test("shows statement archetype preview with income and expense sections", async () => {
    await openExcelPreview("Arus Kas");
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.archetype.statement/i)).toBeInTheDocument();
      expect(screen.getAllByText(/page.reportSettings.previewIncome/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/page.reportSettings.previewExpense/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/page.reportSettings.previewSaldo/i)).toBeInTheDocument();
    });
  });

  test("shows roster archetype preview", async () => {
    await openExcelPreview("Kinerja Kasir");
    await waitFor(() => {
      expect(screen.getByText(/page.reportSettings.archetype.roster/i)).toBeInTheDocument();
    });
  });
});

// Regression coverage for a bug where a failed fetch left `meta` at its
// initial empty array — rendering identically to "no reports configured,"
// with no way to tell the two apart or retry. Reverting the loadError
// state/branch in ReportSettingsPage.jsx would make these fail (no error
// text/retry button would ever appear, and retry couldn't recover).
describe("ReportSettingsPage — API failure is a distinct error state, not empty", () => {
  afterEach(() => {
    getReportConfigMeta.mockReset().mockResolvedValue({ data: META.data });
    getReportConfigs.mockReset().mockResolvedValue({ data: [] });
  });

  test("shows a distinct error state with retry on fetch failure, not the empty list", async () => {
    getReportConfigMeta.mockRejectedValue(new Error("network down"));
    getReportConfigs.mockRejectedValue(new Error("network down"));

    render(<ReportSettingsPage />);

    await waitFor(() => expect(screen.getByText("common.loadError")).toBeInTheDocument());
    expect(screen.getByText("common.retry")).toBeInTheDocument();
  });

  test("retry re-invokes the fetch and can recover to the normal list", async () => {
    getReportConfigMeta
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ data: META.data });
    getReportConfigs.mockResolvedValue({ data: [] });

    render(<ReportSettingsPage />);

    await waitFor(() => expect(screen.getByText("common.loadError")).toBeInTheDocument());
    fireEvent.click(screen.getByText("common.retry"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Laporan Harian/i })).toBeInTheDocument()
    );
    expect(screen.queryByText("common.loadError")).not.toBeInTheDocument();
    expect(getReportConfigMeta).toHaveBeenCalledTimes(2);
  });
});
