import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExportButtons from "../components/organism/ExportButtons";

const mockExportReport = jest.fn(() => Promise.resolve());
jest.mock("../services/export", () => ({
  exportReport: (...args) => mockExportReport(...args)
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockGet = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: { get: (...args) => mockGet(...args) }
}));

describe("ExportButtons", () => {
  beforeEach(() => mockExportReport.mockClear());

  test("renders Excel, PDF, CSV buttons", () => {
    render(<ExportButtons reportKey="daily" buildParams={() => ({})} />);
    expect(screen.getByRole("button", { name: /Excel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PDF/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CSV/i })).toBeInTheDocument();
  });

  test("clicking Pdf calls exportReport with correct args", async () => {
    render(<ExportButtons reportKey="daily" buildParams={() => ({ startDate: "2026-09-01" })} />);
    fireEvent.click(screen.getByRole("button", { name: /PDF/i }));
    await waitFor(() => {
      expect(mockExportReport).toHaveBeenCalledWith("daily", {
        format: "pdf",
        params: { startDate: "2026-09-01" }
      });
    });
  });
});
