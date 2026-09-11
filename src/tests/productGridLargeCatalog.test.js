const mockGet = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: { get: (...args) => mockGet(...args) }
}));

import { getProductByOutlet } from "../services/product";

describe("getProductByOutlet — large catalog readiness (F7-02)", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockResolvedValue({ status: 200, data: { data: [] } });
  });

  test("requests the backend's maximum page size instead of relying on its default 200-row cap", async () => {
    await getProductByOutlet({ location: "1" });
    const [url] = mockGet.mock.calls[0];
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("limit")).toBe("500");
  });

  test("still forwards store and search filters alongside the limit", async () => {
    await getProductByOutlet({ location: "1", search: "cola" });
    const [url] = mockGet.mock.calls[0];
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("store")).toBe("1");
    expect(params.get("search")).toBe("cola");
    expect(params.get("limit")).toBe("500");
  });
});
