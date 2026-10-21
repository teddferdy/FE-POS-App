/* global __dirname:readonly */
import fs from "fs";
import path from "path";

const read = (rel) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

// Contract for the "All Stores" (Semua Toko) control, as reported on
// 2026-10-21: a supplier created with a specific store selected did not appear
// under "All Stores", but did appear under that store's filter.
//
// The frontend half of the contract:
//   1. the shared filter sentinel for "All Stores" is the string "all";
//   2. a list page maps "all" to an empty filter value;
//   3. the request carries the store key with that empty value
//      (`store=`), so the backend can tell "no narrowing requested" apart
//      from "narrow to store N".
//
// The backend half of the contract lives in
// BE-POS-App/api/controller/supplier.js (getAll) and is covered by
// BE-POS-App/__tests__/supplier-all-stores-visibility.test.js.

describe("Supplier list — All Stores contract", () => {
  test('useGlobalStoreFilter default sentinel is "all"', () => {
    const src = read("hooks/useGlobalStoreFilter.js");
    expect(src).toMatch('defaultValue = "all"');
  });

  test('"all" clears the active store instead of pinning one', () => {
    const src = read("hooks/useGlobalStoreFilter.js");
    expect(src).toMatch(/value === "all"/);
    expect(src).toMatch(/setActiveStore\("", ""\)/);
  });

  test('StoreFilter emits the literal "all" for the Semua Toko option', () => {
    const src = read("components/ui/StoreFilter.jsx");
    expect(src).toMatch(/"all"/);
  });

  test('SupplierList maps the "all" sentinel to an empty store filter', () => {
    const src = read("page/supplier/SupplierList.jsx");
    expect(src).toMatch(/storeFilter !== "all"/);

    // The super_admin branch must fall back to an empty string and must never
    // reach for the account's own store — that substitution is what made the
    // "All Stores" control a no-op.
    const branch = src.match(/store: isSuperAdmin([\s\S]*?): user\?\.store/);
    expect(branch).not.toBeNull();
    expect(branch[1]).not.toMatch(/user\?\.store/);
    expect(branch[1]).toMatch(/:\s*""/);
  });

  test("the supplier request always carries the store key (empty for All Stores)", () => {
    const src = read("services/supplier.js");
    // `&store=${payload?.store || ""}` — the key is always present in the URL.
    expect(src).toMatch(/store=\$\{payload\?\.store \|\| ""\}/);
  });

  test("the supplier list applies no client-side row filtering", () => {
    const src = read("page/supplier/SupplierList.jsx");
    // Rows come straight from the API response into the table.
    expect(src).toMatch(/const suppliers = data\?\.data \|\| \[\]/);
    expect(src).not.toMatch(/\.filter\(\s*\(?\s*\w+\s*\)?\s*=>\s*[^)]*store/);
  });
});
