// P1 effective-tax summary — pure helpers. The backend owns the effective
// rate and findings; these helpers only resolve which context to ask for,
// classify transport errors, and label row scope. None of them computes tax.
import {
  resolveEffectiveTaxScope,
  scopeForTaxRow,
  classifyEffectiveTaxError,
  shouldRetryEffectiveTax,
  taxRowScope,
  isResponseForScope,
  effectiveTaxQueryKey,
  outletNameFor
} from "../utils/taxEffective.js";

const httpError = (status, data = {}) => ({ response: { status, data } });

describe("resolveEffectiveTaxScope", () => {
  test("an outlet user with an assigned store resolves to that outlet", () => {
    expect(resolveEffectiveTaxScope({ isSuperAdmin: false, storeId: "3" })).toEqual({
      kind: "outlet",
      store: 3
    });
    expect(resolveEffectiveTaxScope({ isSuperAdmin: false, storeId: 7 })).toEqual({
      kind: "outlet",
      store: 7
    });
  });

  test("an outlet user without a valid store is unresolved (no request)", () => {
    for (const storeId of [undefined, null, "", "undefined", "abc", "0", "-2", "1.5", 0]) {
      expect(resolveEffectiveTaxScope({ isSuperAdmin: false, storeId })).toEqual({
        kind: "unresolved",
        store: null
      });
    }
  });

  test("a super admin with no outlet selected evaluates the global scope", () => {
    for (const storeId of [undefined, null, ""]) {
      expect(resolveEffectiveTaxScope({ isSuperAdmin: true, storeId })).toEqual({
        kind: "global",
        store: null
      });
    }
  });

  test("a super admin with a selected outlet evaluates that outlet", () => {
    expect(resolveEffectiveTaxScope({ isSuperAdmin: true, storeId: "12" })).toEqual({
      kind: "outlet",
      store: 12
    });
  });

  test("a super admin with a malformed selection is unresolved, never silently global", () => {
    for (const storeId of ["undefined", "abc", "0", "-1"]) {
      expect(resolveEffectiveTaxScope({ isSuperAdmin: true, storeId })).toEqual({
        kind: "unresolved",
        store: null
      });
    }
  });
});

describe("scopeForTaxRow", () => {
  const fallback = { kind: "global", store: null };

  test("an outlet row is evaluated in its own outlet", () => {
    expect(scopeForTaxRow({ id: 1, store: 4 }, fallback)).toEqual({ kind: "outlet", store: 4 });
  });

  test("a global row is evaluated in the caller's current context", () => {
    expect(scopeForTaxRow({ id: 1, store: null }, fallback)).toBe(fallback);
    const outlet = { kind: "outlet", store: 9 };
    expect(scopeForTaxRow({ id: 1, store: null }, outlet)).toBe(outlet);
  });

  test("a missing row gives the fallback", () => {
    expect(scopeForTaxRow(null, fallback)).toBe(fallback);
  });
});

describe("classifyEffectiveTaxError", () => {
  test("maps auth and availability statuses", () => {
    expect(classifyEffectiveTaxError(httpError(401))).toBe("unauthorized");
    expect(classifyEffectiveTaxError(httpError(403))).toBe("forbidden");
    expect(classifyEffectiveTaxError(httpError(404))).toBe("unavailable");
  });

  test("every HTTP 400 is 'rejected' — never inferred as missing PPN from its message", () => {
    const missingPpnMessage =
      "PPN tax configuration is missing for this outlet (store 3); configure an active PPN rate before selling";
    expect(classifyEffectiveTaxError(httpError(400, { message: missingPpnMessage }))).toBe(
      "rejected"
    );
    expect(classifyEffectiveTaxError(httpError(400, { message: "Invalid store value" }))).toBe(
      "rejected"
    );
    expect(classifyEffectiveTaxError(httpError(422))).toBe("rejected");
  });

  test("server and network failures are 'failed'", () => {
    expect(classifyEffectiveTaxError(httpError(500))).toBe("failed");
    expect(classifyEffectiveTaxError(httpError(503))).toBe("failed");
    expect(classifyEffectiveTaxError(new Error("Network Error"))).toBe("failed");
    expect(classifyEffectiveTaxError(undefined)).toBe("failed");
  });
});

describe("shouldRetryEffectiveTax", () => {
  test("client errors are never retried automatically", () => {
    for (const s of [400, 401, 403, 404]) {
      expect(shouldRetryEffectiveTax(0, httpError(s))).toBe(false);
    }
  });

  test("server/network failures retry once", () => {
    expect(shouldRetryEffectiveTax(0, httpError(500))).toBe(true);
    expect(shouldRetryEffectiveTax(1, httpError(500))).toBe(false);
    expect(shouldRetryEffectiveTax(0, new Error("Network Error"))).toBe(true);
  });
});

describe("taxRowScope", () => {
  test("store-null rows are global; store-bound rows are outlet", () => {
    expect(taxRowScope(null)).toBe("global");
    expect(taxRowScope(undefined)).toBe("global");
    expect(taxRowScope("")).toBe("global");
    expect(taxRowScope(3)).toBe("outlet");
    expect(taxRowScope("3")).toBe("outlet");
  });
});

describe("isResponseForScope", () => {
  test("accepts only a summary for the requested store and channel", () => {
    const outlet = { kind: "outlet", store: 3 };
    expect(isResponseForScope({ store: 3, channel: "counter" }, outlet, "counter")).toBe(true);
    expect(isResponseForScope({ store: 4, channel: "counter" }, outlet, "counter")).toBe(false);
    expect(isResponseForScope({ store: 3, channel: "qr" }, outlet, "counter")).toBe(false);
    expect(isResponseForScope({ store: null, channel: "counter" }, outlet, "counter")).toBe(false);
    const global = { kind: "global", store: null };
    expect(isResponseForScope({ store: null, channel: "qr" }, global, "qr")).toBe(true);
    expect(isResponseForScope({ store: 3, channel: "qr" }, global, "qr")).toBe(false);
    expect(isResponseForScope(undefined, global, "qr")).toBe(false);
  });
});

describe("effectiveTaxQueryKey", () => {
  test("is namespaced under tax-configs so existing list invalidations refresh it", () => {
    expect(effectiveTaxQueryKey({ kind: "outlet", store: 3 }, "counter")).toEqual([
      "tax-configs",
      "effective",
      3,
      "counter"
    ]);
    expect(effectiveTaxQueryKey({ kind: "global", store: null }, "qr")).toEqual([
      "tax-configs",
      "effective",
      "global",
      "qr"
    ]);
  });
});

describe("outletNameFor", () => {
  const locations = [
    { id: 3, name: "Outlet Tiga" },
    { _id: "9", name: "Outlet Sembilan" }
  ];

  test("uses location metadata when available", () => {
    expect(outletNameFor(3, { locations })).toBe("Outlet Tiga");
    expect(outletNameFor("9", { locations })).toBe("Outlet Sembilan");
  });

  test("falls back to the active outlet name for the caller's own outlet", () => {
    expect(outletNameFor("5", { activeStoreId: 5, activeStoreName: "Kedai Lima" })).toBe(
      "Kedai Lima"
    );
  });

  test("returns null rather than an internal id when the name is unknown", () => {
    expect(outletNameFor(77, { locations, activeStoreId: 5, activeStoreName: "Kedai Lima" })).toBe(
      null
    );
    expect(outletNameFor(null, { locations })).toBe(null);
  });
});
