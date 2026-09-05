import { buildTripRows } from "../utils/businessTripDoc";

const t = (k) => k;

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

describe("buildTripRows", () => {
  test("returns rows containing employee, RAB, total, and approver data", () => {
    const rows = buildTripRows(trip, t);
    const flat = rows.map((r) => r.join("|")).join("\n");
    expect(flat).toContain("Andi Pratama");
    expect(flat).toContain("Transportasi");
    expect(flat).toContain("1.000.000");
    expect(flat).toContain("Candra");
  });

  test("includes a mismatch row when declared budget differs from breakdown", () => {
    const mismatchTrip = {
      ...trip,
      budget: 2000000,
      budgetItems: [{ id: 1, komponen: "A", qty: 1, satuan: "pax", tarif: 500000, total: 500000 }]
    };
    const rows = buildTripRows(mismatchTrip, t);
    const flat = rows.map((r) => r.join("|")).join("\n");
    expect(flat).toContain("page.businessTrip.rab.mismatchWarning");
  });
});
