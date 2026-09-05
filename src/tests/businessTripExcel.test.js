import * as XLSX from "xlsx";
import { buildTripWorkbook } from "../utils/businessTripExcel";

const t = (k) => (k === "page.businessTrip.excel.sheetName" ? "SPPD" : k);

const trip = {
  tripNumber: "BT-20260904-0001",
  destination: "Jakarta",
  tripPurpose: "Koordinasi",
  departureDate: "2026-09-05",
  returnDate: "2026-09-07",
  budget: 1500000,
  employees: [
    {
      id: 1,
      employeeId: 10,
      employeeName: "Andi",
      employeePosition: "Staff",
      employeeUser: { fullName: "Andi Pratama" }
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

describe("buildTripWorkbook", () => {
  test("creates a workbook with an SPPD sheet", () => {
    const wb = buildTripWorkbook(trip, t);
    expect(wb.SheetNames.length).toBe(1);
    expect(wb.Sheets[wb.SheetNames[0]]).toBeDefined();
  });

  test("includes employee, RAB rows, and totals", () => {
    const wb = buildTripWorkbook(trip, t);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const flat = data.map((r) => r.join("|")).join("\n");
    expect(flat).toContain("Andi Pratama");
    expect(flat).toContain("Transportasi");
    expect(flat).toContain("1.000.000");
    expect(flat).toContain("Candra");
  });

  test("adds a mismatch row when declared budget differs from breakdown", () => {
    const mismatchTrip = {
      ...trip,
      budget: 2000000,
      budgetItems: [{ id: 1, komponen: "A", qty: 1, satuan: "pax", tarif: 500000, total: 500000 }]
    };
    const wb = buildTripWorkbook(mismatchTrip, t);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const flat = data.map((r) => r.join("|")).join("\n");
    expect(flat).toContain("page.businessTrip.rab.mismatchWarning");
  });
});
