/* global __dirname:readonly */
import fs from "fs";
import path from "path";

const read = (rel) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

// List pages yang wajib ikut standar noted:
// super_admin default "all" (Semua Toko) via useGlobalStoreFilter,
// non-super_admin tanpa dropdown (di-guard isSuperAdmin).
const STANDARD_FILES = [
  "page/shift/ShiftList.jsx",
  "page/type-payment/TypePaymentList.jsx",
  "page/stock-opname/StockHistory.jsx",
  "page/overtime/OvertimeApproval.jsx",
  "page/overtime/MyOvertime.jsx",
  "page/accounting/AccountingPage.jsx"
];

describe("Store filter standard conformance (super_admin=all, non-super_admin hidden)", () => {
  test.each(STANDARD_FILES)("%s memakai useGlobalStoreFilter", (rel) => {
    const src = read(rel);
    expect(src).toMatch("useGlobalStoreFilter");
  });

  test("StockHistory hanya fetch locations untuk super_admin", () => {
    const src = read("page/stock-opname/StockHistory.jsx");
    expect(src).not.toMatch("enabled: true");
    expect(src).toMatch("enabled: isSuperAdmin");
  });

  test("StoreFilter tetap hidden untuk non-super_admin", () => {
    const src = read("components/ui/StoreFilter.jsx");
    expect(src).toMatch("if (!isSuperAdmin");
  });

  test("useGlobalStoreFilter default adalah 'all' (Semua Toko)", () => {
    const src = read("hooks/useGlobalStoreFilter.js");
    expect(src).toMatch('defaultValue = "all"');
  });
});
