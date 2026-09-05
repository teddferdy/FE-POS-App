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
