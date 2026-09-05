import { buildTripPdf, downloadTripPdf } from "../utils/businessTripPdf";

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

describe("businessTripPdf", () => {
  test("buildTripPdf creates a PDF document with content", async () => {
    const doc = await buildTripPdf(trip, t);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    const out = doc.output("arraybuffer");
    expect(out.byteLength).toBeGreaterThan(0);
  });

  test("downloadTripPdf saves a file named after the trip number", async () => {
    const save = jest.fn();
    const fakeBuild = jest.fn(async () => ({ save }));
    await downloadTripPdf(trip, t, fakeBuild);
    expect(fakeBuild).toHaveBeenCalledWith(trip, t);
    expect(save).toHaveBeenCalledWith("BT-20260904-0001.pdf");
  });
});
