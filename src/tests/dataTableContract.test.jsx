import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataTable from "../components/ui/DataTable";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

// Regression coverage for Phase 9 P1 findings F9-20/F9-21. Queue and
// waiter-request lists declare their columns with the accessorKey + cell
// shape, but DataTable only resolved `render`/`accessor`, so every body
// cell rendered as null → blank rows. Reverting the accessorKey/cell
// fallbacks in DataTable.jsx makes these tests fail (blank cells).
describe("DataTable — column contract compatibility", () => {
  test("accessorKey columns render the row value", () => {
    render(
      <DataTable columns={[{ header: "SKU", accessorKey: "sku" }]} data={[{ sku: "SKU-1" }]} />
    );
    expect(screen.getByText("SKU-1")).toBeInTheDocument();
  });

  test("cell shorthand receives { row: { original }, index } and renders", () => {
    render(
      <DataTable
        columns={[
          {
            header: "Nama",
            cell: ({ row }) => <b>{row.original.name}</b>
          }
        ]}
        data={[{ name: "Gula" }]}
      />
    );
    expect(screen.getByText("Gula")).toBeInTheDocument();
  });

  test("legacy render(row, rowIndex) contract still works", () => {
    render(
      <DataTable
        columns={[{ header: "X", render: (row, rowIndex) => `${row.name}${rowIndex}` }]}
        data={[{ name: "A" }, { name: "B" }]}
      />
    );
    expect(screen.getByText("A0")).toBeInTheDocument();
    expect(screen.getByText("B1")).toBeInTheDocument();
  });

  test("legacy accessor contract still works", () => {
    render(
      <DataTable
        columns={[
          { header: "Harga", accessor: "price" },
          { header: "Qty", accessor: "qty" }
        ]}
        data={[{ price: 15000, qty: 2 }]}
      />
    );
    expect(screen.getByText("15000")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
