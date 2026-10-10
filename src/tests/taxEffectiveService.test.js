// P1 effective-tax summary — service request shape. The caller resolves the
// scope explicitly, so the shared store injection is skipped: a global
// (no-store) request must never receive an injected outlet.
const mockGet = jest.fn();
jest.mock("../services/index", () => ({
  axiosInstance: { get: (...args) => mockGet(...args) }
}));

import { getEffectiveTax } from "../services/tax-config";

beforeEach(() => mockGet.mockReset());

describe("getEffectiveTax", () => {
  test("requests an outlet scope with explicit store and channel", async () => {
    mockGet.mockResolvedValue({ status: 200, data: { success: true, data: { store: 3 } } });
    const res = await getEffectiveTax({ store: 3, channel: "counter" });
    expect(mockGet).toHaveBeenCalledWith("/tax-config/effective", {
      params: { store: 3, channel: "counter" },
      skipStoreInjection: true
    });
    expect(res).toEqual({ success: true, data: { store: 3 } });
  });

  test("requests the global scope without any store parameter", async () => {
    mockGet.mockResolvedValue({ status: 200, data: { success: true, data: { store: null } } });
    await getEffectiveTax({ store: null, channel: "qr" });
    expect(mockGet).toHaveBeenCalledWith("/tax-config/effective", {
      params: { channel: "qr" },
      skipStoreInjection: true
    });
  });

  test("propagates HTTP errors unchanged so callers can classify by status", async () => {
    const err = Object.assign(new Error("Request failed"), { response: { status: 400, data: {} } });
    mockGet.mockRejectedValue(err);
    await expect(getEffectiveTax({ store: 3, channel: "counter" })).rejects.toBe(err);
  });
});
