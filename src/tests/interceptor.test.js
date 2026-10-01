var capturedRequestInterceptor;

jest.mock("axios", () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn((fn) => {
          capturedRequestInterceptor = fn;
        })
      },
      response: { use: jest.fn() }
    }
  })),
  AxiosError: class AxiosError extends Error {}
}));

jest.mock("@/utils/endpoints", () => ({
  ENDPOINT: { BASE_URL: "http://localhost" }
}));

const mockGetToken = jest.fn(() => "test-token");
const mockGetCookie = jest.fn(() => null);
jest.mock("@/utils/cookies", () => ({
  getToken: (...args) => mockGetToken(...args),
  getCookie: (...args) => mockGetCookie(...args)
}));

jest.mock("@/lib/safe-lookup", () => ({
  hasOwn: (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
}));

import "@/services/index";

const makeConfig = (overrides = {}) => ({
  method: "GET",
  url: "/anything",
  headers: {},
  params: {},
  ...overrides
});

describe("services/index.js request interceptor", () => {
  beforeEach(() => {
    mockGetToken.mockReturnValue("test-token");
    mockGetCookie.mockReturnValue(null);
  });

  test("non-super-admin injects user.store, ignoring a tampered activeStore cookie", () => {
    mockGetCookie.mockImplementation((name) => {
      if (name === "user") return JSON.stringify({ roleType: "admin", store: "5" });
      if (name === "activeStore") return "10";
      return null;
    });

    const config = makeConfig();
    capturedRequestInterceptor(config);

    expect(config.params.store).toBe("5");
  });

  test("non-super-admin with no user.store falls back to activeStore", () => {
    mockGetCookie.mockImplementation((name) => {
      if (name === "user") return JSON.stringify({ roleType: "kasir" });
      if (name === "activeStore") return "10";
      return null;
    });

    const config = makeConfig();
    capturedRequestInterceptor(config);

    expect(config.params.store).toBe("10");
  });

  test("super-admin injects activeStore, not user.store", () => {
    mockGetCookie.mockImplementation((name) => {
      if (name === "user") return JSON.stringify({ roleType: "super_admin", store: "5" });
      if (name === "activeStore") return "10";
      return null;
    });

    const config = makeConfig();
    capturedRequestInterceptor(config);

    expect(config.params.store).toBe("10");
  });

  test("non-super-admin skips injection when payload already carries a store key", () => {
    mockGetCookie.mockImplementation((name) => {
      if (name === "user") return JSON.stringify({ roleType: "admin", store: "5" });
      if (name === "activeStore") return "10";
      return null;
    });

    const config = makeConfig({ method: "POST", data: { storePrices: [] } });
    capturedRequestInterceptor(config);

    expect(config.data.store).toBeUndefined();
  });
});

describe("services/index.js request interceptor — skipStoreInjection opt-out", () => {
  const asSuperAdminWithActiveStore = () =>
    mockGetCookie.mockImplementation((name) => {
      if (name === "user") return JSON.stringify({ roleType: "super_admin", store: "5" });
      if (name === "activeStore") return "10";
      return null;
    });
  const asNonSuperAdmin = () =>
    mockGetCookie.mockImplementation((name) => {
      if (name === "user") return JSON.stringify({ roleType: "admin", store: "5" });
      if (name === "activeStore") return "10";
      return null;
    });

  beforeEach(() => {
    mockGetToken.mockReturnValue("test-token");
    mockGetCookie.mockReturnValue(null);
  });

  test.each([
    ["super-admin", asSuperAdminWithActiveStore],
    ["non-super-admin", asNonSuperAdmin]
  ])("%s: an opted-out mutation body receives no store", (_label, arrange) => {
    arrange();
    const config = makeConfig({
      method: "PUT",
      data: { id: "loc-1", managerName: "W3" },
      skipStoreInjection: true
    });
    capturedRequestInterceptor(config);

    expect(config.data).toEqual({ id: "loc-1", managerName: "W3" });
    expect(config.params.store).toBeUndefined();
  });

  test("an opted-out FormData mutation receives no store", () => {
    asNonSuperAdmin();
    const fd = new FormData();
    fd.append("id", "loc-1");
    const config = makeConfig({ method: "PUT", data: fd, skipStoreInjection: true });
    capturedRequestInterceptor(config);

    expect(config.data.has("store")).toBe(false);
    expect([...config.data.keys()]).toEqual(["id"]);
  });

  test("an opted-out GET receives no store param", () => {
    asNonSuperAdmin();
    const config = makeConfig({ skipStoreInjection: true });
    capturedRequestInterceptor(config);

    expect(config.params.store).toBeUndefined();
  });

  test("an opted-out request still carries the bearer token", () => {
    asNonSuperAdmin();
    const config = makeConfig({ method: "PUT", data: {}, skipStoreInjection: true });
    capturedRequestInterceptor(config);

    expect(config.headers.Authorization).toBe("Bearer test-token");
  });

  test("the flag never becomes a payload or query field", () => {
    asNonSuperAdmin();
    const config = makeConfig({ method: "PUT", data: { id: "loc-1" }, skipStoreInjection: true });
    capturedRequestInterceptor(config);

    expect(config.data).not.toHaveProperty("skipStoreInjection");
    expect(config.params).not.toHaveProperty("skipStoreInjection");
  });

  test("without the flag an eligible GET keeps the existing injection", () => {
    asSuperAdminWithActiveStore();
    const config = makeConfig();
    capturedRequestInterceptor(config);

    expect(config.params.store).toBe("10");
  });

  test("without the flag an eligible mutation keeps the existing body injection", () => {
    asNonSuperAdmin();
    const config = makeConfig({ method: "PUT", data: { name: "x" } });
    capturedRequestInterceptor(config);

    expect(config.data).toEqual({ name: "x", store: "5" });
  });

  test("without the flag an eligible FormData mutation keeps the existing injection", () => {
    asSuperAdminWithActiveStore();
    const fd = new FormData();
    fd.append("name", "x");
    const config = makeConfig({ method: "POST", data: fd });
    capturedRequestInterceptor(config);

    expect(config.data.get("store")).toBe("10");
  });

  test("skipStoreInjection: false behaves exactly like an absent flag", () => {
    asNonSuperAdmin();
    const config = makeConfig({ method: "PUT", data: { name: "x" }, skipStoreInjection: false });
    capturedRequestInterceptor(config);

    expect(config.data.store).toBe("5");
  });
});
