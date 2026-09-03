import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormalDocument, PrintButton } from "../components/document/FormalDocument";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const spec = {
  title: "SURAT TUGAS",
  number: "BT-20260902-0001",
  subtitle: "Perjalanan Dinas",
  meta: [
    { label: "date", value: "02/09/2026" },
    { label: "destination", value: "Jakarta" }
  ],
  columns: [
    { key: "name", label: "item" },
    { key: "qty", label: "qty", align: "right" }
  ],
  rows: [
    { name: "Beras", qty: 10 },
    { name: "Minyak", qty: 5 }
  ],
  totals: [{ label: "total", value: "Rp 200.000" }],
  signature: { preparedBy: "Andi", knownBy: "Budi", approvedBy: "Candra" },
  footerText: "Dokumen ini dicetak otomatis"
};

describe("FormalDocument", () => {
  test("renders title, number, meta, table, totals, and signature block", () => {
    render(<FormalDocument spec={spec} />);
    expect(screen.getByText("SURAT TUGAS")).toBeInTheDocument();
    expect(screen.getByText(/BT-20260902-0001/)).toBeInTheDocument();
    expect(screen.getByText("Jakarta")).toBeInTheDocument();
    expect(screen.getByText("Beras")).toBeInTheDocument();
    expect(screen.getByText("Rp 200.000")).toBeInTheDocument();
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Candra")).toBeInTheDocument();
  });

  test("wraps output in a print-doc container", () => {
    const { container } = render(<FormalDocument spec={spec} />);
    expect(container.querySelector(".print-doc")).toBeInTheDocument();
  });
});

describe("PrintButton", () => {
  test("renders a button with no-print class that calls window.print on click", () => {
    const spy = jest.spyOn(window, "print").mockImplementation(() => {});
    render(<PrintButton />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("no-print");
    btn.click();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
