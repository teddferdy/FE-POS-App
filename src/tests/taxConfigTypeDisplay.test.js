// T3: tax type display derives from the persisted `type` field, with the
// historical name-prefix heuristic only as fallback for `other`/missing.
import { getTaxType } from "../utils/taxDisplay.js";

describe("getTaxType — persisted type first (T3)", () => {
  test("persisted ppn wins over a misleading name", () => {
    expect(getTaxType("Diskon", "ppn")).toBe("PPN");
  });

  test("persisted service_charge wins over a PPN-like name", () => {
    expect(getTaxType("PPN Gaib", "service_charge")).toBe("Non-Pajak");
  });

  test("other keeps the historical name heuristic", () => {
    expect(getTaxType("PPh 23 2%", "other")).toBe("PPh");
  });

  test("missing type keeps the historical name heuristic", () => {
    expect(getTaxType("PPN 11%")).toBe("PPN");
    expect(getTaxType("PPh 23 2%")).toBe("PPh");
    expect(getTaxType("Lainnya")).toBe("Non-Pajak");
    expect(getTaxType("")).toBe("Non-Pajak");
    expect(getTaxType()).toBe("Non-Pajak");
  });
});
