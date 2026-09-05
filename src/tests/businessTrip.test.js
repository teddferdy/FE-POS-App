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

jest.mock("../utils/businessTripExcel", () => ({
  downloadTripWorkbook: jest.fn()
}));

jest.mock("../services/business-trip", () => ({
  getBusinessTripById: () => Promise.resolve({ data: mockTrip })
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
  destination: "Jakarta",
  tripPurpose: "Meeting",
  departureDate: "2026-09-10",
  returnDate: "2026-09-12",
  budget: 1500000,
  notes: "Laporan",
  employees: [
    {
      id: 1,
      employeeId: 10,
      employeeName: "Andi",
      employeePosition: "Manager",
      employeeUser: { fullName: "Andi" }
    },
    {
      id: 2,
      employeeId: 11,
      employeeName: "Budi",
      employeePosition: "Leader",
      employeeUser: { fullName: "Budi" }
    }
  ],
  budgetItems: [
    {
      id: 1,
      komponen: "Transportasi",
      qty: 2,
      satuan: "pax",
      tarif: 500000,
      total: 1000000,
      catatan: "Tiket"
    }
  ],
  approvedByUser: { fullName: "Budi" }
};

describe("DetailBusinessTrip", () => {
  beforeEach(() => {
    mockTrip = {
      id: 1,
      tripNumber: "BT-20260902-0001",
      status: "approved",
      destination: "Jakarta",
      tripPurpose: "Meeting",
      departureDate: "2026-09-10",
      returnDate: "2026-09-12",
      budget: 1500000,
      notes: "Laporan",
      employees: [
        {
          id: 1,
          employeeId: 10,
          employeeName: "Andi",
          employeePosition: "Manager",
          employeeUser: { fullName: "Andi" }
        },
        {
          id: 2,
          employeeId: 11,
          employeeName: "Budi",
          employeePosition: "Leader",
          employeeUser: { fullName: "Budi" }
        }
      ],
      budgetItems: [
        {
          id: 1,
          komponen: "Transportasi",
          qty: 2,
          satuan: "pax",
          tarif: 500000,
          total: 1000000,
          catatan: "Tiket"
        }
      ],
      approvedByUser: { fullName: "Budi" }
    };
  });

  test("renders trip number and multi-employee names", () => {
    render(<DetailBusinessTrip />);
    expect(screen.getByText("BT-20260902-0001")).toBeInTheDocument();
    expect(screen.getAllByText("Andi").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Budi").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leader").length).toBeGreaterThan(0);
  });

  test("renders the RAB breakdown and download button", () => {
    render(<DetailBusinessTrip />);
    expect(screen.getAllByText("Transportasi").length).toBeGreaterThan(0);
    expect(screen.getByText(/page.businessTrip.detail.download/)).toBeInTheDocument();
  });

  test("wraps the SPPD document in a print container", () => {
    const { container } = render(<DetailBusinessTrip />);
    expect(container.querySelector(".print-doc")).toBeInTheDocument();
  });
});
