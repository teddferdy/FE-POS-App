const mockGet = jest.fn();
const mockPut = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: {
    get: (...args) => mockGet(...args),
    put: (...args) => mockPut(...args)
  }
}));

import {
  getStoreConfigurationById,
  getStoreConfigurations,
  editStoreConfiguration
} from "../services/location";

// FE W3 Phase 1 — API contract of the store-configuration wrappers.
//
// - The backend selector is strictly loc-N (no leading zeros); padded ids
//   (loc-001) are normalized here and nowhere else.
// - Invalid ids never produce an HTTP request.
// - Reads carry no client tenant/store scope and do not opt out of store
//   injection; only the strict-schema PUT sets skipStoreInjection.

const ok = (data = { success: true, data: {} }) => ({ status: 200, data });

const INVALID_IDS = [
  ["loc-000", "loc-000"],
  ["loc-0", "loc-0"],
  ["all", "all"],
  ["abc", "abc"],
  ["empty string", ""],
  ["undefined", undefined],
  ["null", null],
  ["loc-", "loc-"],
  ["loc-1abc", "loc-1abc"],
  ["negative", "-1"],
  ["zero", 0]
];

const SCOPE_KEYS = ["tenantId", "store", "storeId", "storeIds", "stores"];

beforeEach(() => {
  mockGet.mockReset();
  mockPut.mockReset();
  mockGet.mockResolvedValue(ok());
  mockPut.mockResolvedValue(ok());
});

describe("getStoreConfigurationById", () => {
  test.each([
    ["loc-001", "loc-1"],
    ["loc-12", "loc-12"],
    ["loc-0012", "loc-12"],
    ["7", "loc-7"],
    [7, "loc-7"]
  ])("%p → GET /location/store-configuration/%s", async (input, selector) => {
    await getStoreConfigurationById(input);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(`/location/store-configuration/${selector}`);
  });

  test("sends no client tenant/store scope and no request config", async () => {
    await getStoreConfigurationById("loc-001");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).not.toContain("?");
    expect(config).toBeUndefined();
  });

  test("returns the backend response body unchanged", async () => {
    const body = {
      success: true,
      message: "Success",
      data: { id: "loc-001", timezone: "Asia/Makassar" }
    };
    mockGet.mockResolvedValue(ok(body));
    await expect(getStoreConfigurationById("loc-001")).resolves.toBe(body);
  });

  test.each(INVALID_IDS)("rejects %s without any request", async (_label, input) => {
    await expect(getStoreConfigurationById(input)).rejects.toThrow(
      "Invalid store configuration id"
    );
    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe("getStoreConfigurations", () => {
  test("requests the supplied page and limit only", async () => {
    await getStoreConfigurations(2, 50);
    expect(mockGet).toHaveBeenCalledTimes(1);
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/location/store-configuration?page=2&limit=50");
    expect(config).toBeUndefined();
  });

  test("defaults to the canonical page 1 / limit 20", async () => {
    await getStoreConfigurations();
    expect(mockGet).toHaveBeenCalledWith("/location/store-configuration?page=1&limit=20");
  });

  test("carries no client tenant/store scope", async () => {
    await getStoreConfigurations(1, 20);
    const query = new URLSearchParams(mockGet.mock.calls[0][0].split("?")[1]);
    expect([...query.keys()]).toEqual(["page", "limit"]);
    for (const key of SCOPE_KEYS) expect(query.has(key)).toBe(false);
  });

  test("returns the backend list body unchanged", async () => {
    const body = {
      success: true,
      message: "Success",
      data: [{ id: "loc-001" }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
    };
    mockGet.mockResolvedValue(ok(body));
    await expect(getStoreConfigurations(1, 20)).resolves.toBe(body);
  });
});

describe("editStoreConfiguration", () => {
  test("PUTs to /location/store-configuration with skipStoreInjection", async () => {
    await editStoreConfiguration({ id: "loc-1", managerName: "W3" });
    expect(mockPut).toHaveBeenCalledTimes(1);
    const [url, body, config] = mockPut.mock.calls[0];
    expect(url).toBe("/location/store-configuration");
    expect(body).toEqual({ id: "loc-1", managerName: "W3" });
    expect(config).toEqual({ skipStoreInjection: true });
  });

  test("normalizes a padded body id without mutating the caller payload", async () => {
    const payload = { id: "loc-001", timezone: "Asia/Jakarta" };
    await editStoreConfiguration(payload);
    const [, body] = mockPut.mock.calls[0];
    expect(body).toEqual({ id: "loc-1", timezone: "Asia/Jakarta" });
    expect(payload).toEqual({ id: "loc-001", timezone: "Asia/Jakarta" });
  });

  test("adds no scope keys and does not derive mainBranch from category", async () => {
    await editStoreConfiguration({ id: "loc-1", category: "Main Branch" });
    const [, body, config] = mockPut.mock.calls[0];
    expect(body).toEqual({ id: "loc-1", category: "Main Branch" });
    expect(body).not.toHaveProperty("mainBranch");
    for (const key of SCOPE_KEYS) expect(body).not.toHaveProperty(key);
    expect(body).not.toHaveProperty("skipStoreInjection");
    expect(config).toEqual({ skipStoreInjection: true });
  });

  test("FormData payload: id normalized, other entries preserved, original untouched", async () => {
    const file = new File(["img"], "store.png", { type: "image/png" });
    const fd = new FormData();
    fd.append("id", "loc-001");
    fd.append("managerName", "W3");
    fd.append("image", file);

    await editStoreConfiguration(fd);
    const [, body, config] = mockPut.mock.calls[0];

    expect(body).toBeInstanceOf(FormData);
    expect(body).not.toBe(fd);
    expect(body.get("id")).toBe("loc-1");
    expect(body.get("managerName")).toBe("W3");
    expect(body.get("image").name).toBe("store.png");
    expect(body.has("store")).toBe(false);
    expect(fd.get("id")).toBe("loc-001");
    expect(config).toEqual({ skipStoreInjection: true });
  });

  test("returns the backend response body unchanged", async () => {
    const body = { success: true, message: "Store configuration updated successfully.", data: {} };
    mockPut.mockResolvedValue(ok(body));
    await expect(editStoreConfiguration({ id: "loc-1" })).resolves.toBe(body);
  });

  test.each(INVALID_IDS)("rejects body id %s without any request", async (_label, input) => {
    await expect(editStoreConfiguration({ id: input, managerName: "x" })).rejects.toThrow(
      "Invalid store configuration id"
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  test("rejects a FormData payload with an invalid id without any request", async () => {
    const fd = new FormData();
    fd.append("id", "loc-000");
    await expect(editStoreConfiguration(fd)).rejects.toThrow("Invalid store configuration id");
    expect(mockPut).not.toHaveBeenCalled();
  });

  test("rejects a payload without an id without any request", async () => {
    await expect(editStoreConfiguration({ managerName: "x" })).rejects.toThrow(
      "Invalid store configuration id"
    );
    await expect(editStoreConfiguration(undefined)).rejects.toThrow(
      "Invalid store configuration id"
    );
    expect(mockPut).not.toHaveBeenCalled();
  });
});
