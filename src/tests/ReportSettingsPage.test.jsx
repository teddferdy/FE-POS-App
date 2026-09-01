import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportSettingsPage from "../page/report/ReportSettingsPage";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn()
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const META = {
  data: [
    {
      key: "daily",
      label: "Laporan Harian",
      columns: [
        { key: "tanggal", label: "Tanggal", type: "date" },
        { key: "netProfit", label: "Laba Bersih", type: "currency" }
      ]
    },
    {
      key: "sales",
      label: "Ringkasan Penjualan",
      columns: [{ key: "sales", label: "Total Penjualan", type: "currency" }]
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
});
