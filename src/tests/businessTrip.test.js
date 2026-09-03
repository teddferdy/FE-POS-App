import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DetailBusinessTrip from "../page/business-trip/DetailBusinessTrip";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("id=1")]
}));

jest.mock("../services/business-trip", () => ({
  getBusinessTripById: () => Promise.resolve({ data: mockTrip }),
  getBusinessTrips: () => Promise.resolve({ data: { rows: [], total: 0 } }),
  addBusinessTrip: jest.fn(),
  editBusinessTrip: jest.fn(),
  deleteBusinessTrip: jest.fn(),
  changeBusinessTripStatus: jest.fn()
}));

jest.mock("react-query", () => ({
  useQuery: (_key, _fn, _opts) => {
    const queryKey = Array.isArray(_key) ? _key : [_key];
    if (!_opts || queryKey[1] === undefined || !queryKey[1]) {
      return { data: undefined, isLoading: false, isError: false };
    }
    return { data: { data: mockTrip }, isLoading: false, isError: false, refetch: jest.fn() };
  }
}));

let mockTrip = {
  id: 1,
  tripNumber: "BT-20260902-0001",
  status: "approved",
  employeeName: "Andi",
  employeePosition: "Manager",
  destination: "Jakarta",
  tripPurpose: "Meeting",
  departureDate: "2026-09-10",
  returnDate: "2026-09-12",
  budget: 2000000,
  notes: "Laporan",
  createdByUser: { fullName: "Andi" },
  approvedByUser: { fullName: "Budi" }
};

describe("DetailBusinessTrip", () => {
  beforeEach(() => {
    mockTrip = {
      id: 1,
      tripNumber: "BT-20260902-0001",
      status: "approved",
      employeeName: "Andi",
      employeePosition: "Manager",
      destination: "Jakarta",
      tripPurpose: "Meeting",
      departureDate: "2026-09-10",
      returnDate: "2026-09-12",
      budget: 2000000,
      notes: "Laporan",
      createdByUser: { fullName: "Andi" },
      approvedByUser: { fullName: "Budi" }
    };
  });

  test("renders Surat Tugas and trip data after load", () => {
    render(<DetailBusinessTrip />);
    expect(screen.getByText("BT-20260902-0001")).toBeInTheDocument();
    expect(screen.getAllByText("page.businessTrip.detail.suratTugas").length).toBeGreaterThan(0);
    // destination appears in both the info card and the printable document
    expect(screen.getAllByText("Jakarta").length).toBeGreaterThan(0);
  });

  test("renders the signature block columns for the printable document", () => {
    render(<DetailBusinessTrip />);
    expect(screen.getAllByText("document.preparedBy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("document.approvedBy").length).toBeGreaterThan(0);
  });
});
