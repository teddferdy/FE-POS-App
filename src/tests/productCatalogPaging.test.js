const mockGet = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: { get: (...args) => mockGet(...args) }
}));

import { getFullProductCatalog } from "../services/product";

// Phase 31 Batch 2 (PERF-1): the cashier endpoint pages at max 500 rows and
// reports pagination.hasMore. The catalog fetch must follow that existing
// contract instead of silently truncating stores with larger catalogs.

const page = (items, hasMore, bundles = []) => ({
  status: 200,
  data: { data: items, bundles, pagination: { page: 1, limit: 500, hasMore } }
});

describe("getFullProductCatalog — follows the existing page/hasMore contract", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  test("single-page catalog issues exactly one request and returns the payload shape", async () => {
    mockGet.mockResolvedValue(page([{ id: 1 }], false, [{ id: "b1" }]));
    const res = await getFullProductCatalog({ location: "1" });
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(res.data).toEqual([{ id: 1 }]);
    expect(res.bundles).toEqual([{ id: "b1" }]);
  });

  test("multi-page catalog is concatenated across page requests", async () => {
    mockGet
      .mockResolvedValueOnce(page([{ id: 1 }], true))
      .mockResolvedValueOnce(page([{ id: 2 }], false));
    const res = await getFullProductCatalog({ location: "1" });
    expect(mockGet).toHaveBeenCalledTimes(2);
    const urls = mockGet.mock.calls.map(([u]) => u);
    expect(new URLSearchParams(urls[1].split("?")[1]).get("page")).toBe("2");
    expect(res.data).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test("forwards store and search on every page request", async () => {
    mockGet.mockResolvedValueOnce(page([], true)).mockResolvedValueOnce(page([], false));
    await getFullProductCatalog({ location: "1", search: "cola" });
    for (const [url] of mockGet.mock.calls) {
      const params = new URLSearchParams(url.split("?")[1]);
      expect(params.get("store")).toBe("1");
      expect(params.get("search")).toBe("cola");
      expect(params.get("limit")).toBe("500");
    }
  });

  test("stops paging after a bounded number of pages even if hasMore stays true", async () => {
    mockGet.mockResolvedValue(page([{ id: 1 }], true));
    await getFullProductCatalog({ location: "1" });
    expect(mockGet.mock.calls.length).toBeLessThanOrEqual(10);
  });

  test("throws when the backend reports a non-200 status", async () => {
    mockGet.mockResolvedValue({ status: 500, data: { message: "boom" } });
    await expect(getFullProductCatalog({ location: "1" })).rejects.toThrow("boom");
  });
});
