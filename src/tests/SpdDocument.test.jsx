import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SpdDocument } from "../components/document/SpdDocument";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const baseTrip = {
  tripNumber: "BT-20260904-0001",
  status: "approved",
  destination: "Jakarta",
  tripPurpose: "Koordinasi proyek",
  departureDate: "2026-09-05",
  returnDate: "2026-09-07",
  budget: 1500000,
  notes: "Membawa laptop",
  employees: [
    {
      id: 1,
      employeeId: 10,
      employeeName: "Andi",
      employeePosition: "Staff",
      employeeUser: { fullName: "Andi Pratama" }
    },
    {
      id: 2,
      employeeId: 11,
      employeeName: "Budi",
      employeePosition: "Leader",
      employeeUser: { fullName: "Budi Santoso" }
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
  approvedByUser: { fullName: "Candra" }
};

describe("SpdDocument", () => {
  test("renders null when trip is not provided", () => {
    const { container } = render(<SpdDocument trip={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders header, employees, RAB, and approval blocks", () => {
    render(<SpdDocument trip={baseTrip} />);
    expect(screen.getByText(/BT-20260904-0001/)).toBeInTheDocument();
    expect(screen.getAllByText("Andi Pratama").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Budi Santoso").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leader").length).toBeGreaterThan(0);
    expect(screen.getByText("Transportasi")).toBeInTheDocument();
    expect(screen.getAllByText("Candra").length).toBeGreaterThan(0);
    expect(screen.getByText("Koordinasi proyek")).toBeInTheDocument();
  });

  test("wraps output in a print-doc container", () => {
    const { container } = render(<SpdDocument trip={baseTrip} />);
    expect(container.querySelector(".print-doc")).toBeInTheDocument();
  });

  test("shows a budget mismatch row when declared budget differs from breakdown", () => {
    const mismatchTrip = {
      ...baseTrip,
      budget: 2000000,
      budgetItems: [
        { id: 1, komponen: "Transportasi", qty: 1, satuan: "pax", tarif: 500000, total: 500000 }
      ]
    };
    render(<SpdDocument trip={mismatchTrip} />);
    expect(screen.getByText("page.businessTrip.rab.mismatchWarning")).toBeInTheDocument();
  });

  test("adds duration days when both dates present", () => {
    render(<SpdDocument trip={baseTrip} />);
    expect(screen.getByText(/3 page.businessTrip.detail.day/)).toBeInTheDocument();
  });
});
