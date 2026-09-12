import { getUnsavedStorePriceRows, buildSavedStorePriceMap } from "../lib/store-price-guard";

// Unit coverage for the F9-25 dirty-detection core. These tests encode the
// exact rule the edit form relies on to refuse silently discarding per-store
// price edits on the main product save.
describe("getUnsavedStorePriceRows (F9-25)", () => {
  test("returns nothing when no store price was edited", () => {
    const storePrices = [
      { storeId: "1", storeName: "Toko A", price: "25000" },
      { storeId: "2", storeName: "Toko B", price: "26000" }
    ];
    const saved = { 1: "25000", 2: "26000" };
    expect(getUnsavedStorePriceRows(storePrices, saved)).toEqual([]);
  });

  test("returns the specific store(s) whose price diverges from the persisted value", () => {
    const storePrices = [
      { storeId: "1", storeName: "Toko A", price: "30000" },
      { storeId: "2", storeName: "Toko B", price: "26000" }
    ];
    const saved = { 1: "25000", 2: "26000" };
    const dirty = getUnsavedStorePriceRows(storePrices, saved);
    expect(dirty).toHaveLength(1);
    expect(dirty[0].storeName).toBe("Toko A");
  });

  test("treats a price as saved once its value matches the persisted baseline", () => {
    const storePrices = [{ storeId: "1", storeName: "Toko A", price: "25000" }];
    const saved = { 1: "25000" };
    expect(getUnsavedStorePriceRows(storePrices, saved)).toEqual([]);
  });

  test("a cleared (emptied) price is an unsaved edit, not a silent discard", () => {
    const storePrices = [{ storeId: "1", storeName: "Toko A", price: "" }];
    const saved = { 1: "25000" };
    expect(getUnsavedStorePriceRows(storePrices, saved)).toHaveLength(1);
  });

  test("a store with no persisted baseline cannot be silently lost and is ignored", () => {
    const storePrices = [{ storeId: "99", storeName: "Toko Z", price: "50000" }];
    const saved = { 1: "25000" };
    expect(getUnsavedStorePriceRows(storePrices, saved)).toEqual([]);
  });
});

describe("buildSavedStorePriceMap (canonical GET contract)", () => {
  test("maps canonical storePrice rows to a baseline dictionary keyed by storeId", () => {
    expect(
      buildSavedStorePriceMap([
        { storeId: 1, storeName: "Toko A", price: 25000 },
        { storeId: 2, storeName: "Toko B", price: 26000 }
      ])
    ).toEqual({ 1: 25000, 2: 26000 });
  });

  test("skips rows without a valid storeId so no phantom baseline is invented", () => {
    expect(
      buildSavedStorePriceMap([
        { storeId: null, storeName: "Phantom", price: 0 },
        { storeId: undefined, storeName: "Ghost", price: 100 },
        { storeId: 1, storeName: "Toko A", price: 25000 }
      ])
    ).toEqual({ 1: 25000 });
  });
});
