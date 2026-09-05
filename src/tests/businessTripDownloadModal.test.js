import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BusinessTripDownloadModal from "../components/organism/business-trip-download-modal";
import { downloadTripWorkbook } from "../utils/businessTripExcel";
import { downloadTripPdf } from "../utils/businessTripPdf";
import { getBusinessTripById } from "../services/business-trip";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("../services/business-trip", () => ({
  getBusinessTripById: jest.fn(() => Promise.resolve({ data: mockTrip }))
}));

jest.mock("react-query", () => ({
  useQuery: (_key, fn, opts) => {
    if (opts && opts.enabled === false) {
      return { data: undefined, isLoading: false, isError: false, refetch: jest.fn() };
    }
    if (typeof fn === "function") {
      fn();
    }
    return { data: { data: mockTrip }, isLoading: false, isError: false, refetch: jest.fn() };
  }
}));

jest.mock("../utils/businessTripExcel", () => ({
  downloadTripWorkbook: jest.fn()
}));

jest.mock("../utils/businessTripPdf", () => ({
  downloadTripPdf: jest.fn()
}));

const mockTrip = {
  id: 1,
  tripNumber: "BT-20260904-0001",
  destination: "Jakarta",
  tripPurpose: "Koordinasi",
  employees: [],
  budgetItems: []
};

describe("BusinessTripDownloadModal", () => {
  beforeEach(() => {
    downloadTripWorkbook.mockClear();
    downloadTripPdf.mockClear();
    getBusinessTripById.mockClear();
  });

  test("renders PDF and Excel options for a preloaded trip", () => {
    render(<BusinessTripDownloadModal open trip={mockTrip} onOpenChange={jest.fn()} />);
    expect(screen.getByText("page.businessTrip.download.excel")).toBeInTheDocument();
    expect(screen.getByText("page.businessTrip.download.pdf")).toBeInTheDocument();
  });

  test("downloads Excel when the Excel option is clicked and closes", async () => {
    const onOpenChange = jest.fn();
    render(<BusinessTripDownloadModal open trip={mockTrip} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("page.businessTrip.download.excel"));
    await waitFor(() =>
      expect(downloadTripWorkbook).toHaveBeenCalledWith(mockTrip, expect.any(Function))
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("downloads PDF when the PDF option is clicked and closes", async () => {
    const onOpenChange = jest.fn();
    render(<BusinessTripDownloadModal open trip={mockTrip} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("page.businessTrip.download.pdf"));
    await waitFor(() =>
      expect(downloadTripPdf).toHaveBeenCalledWith(mockTrip, expect.any(Function))
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("fetches detail by tripId when only tripId is given", async () => {
    render(<BusinessTripDownloadModal open tripId={1} onOpenChange={jest.fn()} />);
    await waitFor(() => expect(getBusinessTripById).toHaveBeenCalledWith(1));
    expect(screen.getByText("page.businessTrip.download.excel")).toBeInTheDocument();
  });
});
