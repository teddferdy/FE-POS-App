import {
  buildStoreConfigurationPayload,
  toStoreConfigurationFormValues
} from "../lib/store-configuration";

// FE W3 Phase 2 — dirty-only PUT payload contract.
//
// Only fields whose outgoing value changed are sent; mainBranch is derived
// from category and sent together with it only when category changed; a
// clean form produces no payload (no empty PUT).

const SERVER = {
  id: "loc-001",
  description: "Flagship store",
  timezone: "Asia/Jakarta",
  maxActiveParkedCarts: 10,
  parkedCartTtlMinutes: 60,
  dailyTarget: 1500000,
  category: "Branch",
  mainBranch: false
};

const defaults = () => toStoreConfigurationFormValues(SERVER);
const build = (values) =>
  buildStoreConfigurationPayload({ id: "loc-001", values, defaults: defaults() });

describe("toStoreConfigurationFormValues", () => {
  test("normalizes server values into input-typed defaults", () => {
    expect(defaults()).toEqual({
      description: "Flagship store",
      timezone: "Asia/Jakarta",
      maxActiveParkedCarts: 10,
      parkedCartTtlMinutes: 60,
      dailyTarget: 1500000,
      category: "Branch"
    });
  });

  test("null server values become the empty input values", () => {
    expect(
      toStoreConfigurationFormValues({
        description: null,
        timezone: "Asia/Makassar",
        maxActiveParkedCarts: null,
        parkedCartTtlMinutes: null,
        dailyTarget: null,
        category: "Main Branch"
      })
    ).toEqual({
      description: "",
      timezone: "Asia/Makassar",
      maxActiveParkedCarts: "",
      parkedCartTtlMinutes: "",
      dailyTarget: 0,
      category: "Main Branch"
    });
  });

  test("never exposes mainBranch as a form field", () => {
    expect(defaults()).not.toHaveProperty("mainBranch");
  });
});

describe("buildStoreConfigurationPayload — single dirty field", () => {
  test.each([
    ["description", "Renovated store", { description: "Renovated store" }],
    ["timezone", "Asia/Makassar", { timezone: "Asia/Makassar" }],
    ["maxActiveParkedCarts", 25, { maxActiveParkedCarts: 25 }],
    ["parkedCartTtlMinutes", 90, { parkedCartTtlMinutes: 90 }],
    ["dailyTarget", 2000000, { dailyTarget: 2000000 }]
  ])("only %s changed → only %s sent", (field, value, expected) => {
    expect(build({ ...defaults(), [field]: value })).toEqual({ id: "loc-001", ...expected });
  });
});

describe("buildStoreConfigurationPayload — transforms", () => {
  test("description emptied → null", () => {
    expect(build({ ...defaults(), description: "" })).toEqual({
      id: "loc-001",
      description: null
    });
  });

  test("description is trimmed; whitespace-only → null", () => {
    expect(build({ ...defaults(), description: "  New text  " })).toEqual({
      id: "loc-001",
      description: "New text"
    });
    expect(build({ ...defaults(), description: "   " })).toEqual({
      id: "loc-001",
      description: null
    });
  });

  test("description changed only by surrounding whitespace is not a change", () => {
    expect(build({ ...defaults(), description: "  Flagship store " })).toBeNull();
  });

  test.each(["maxActiveParkedCarts", "parkedCartTtlMinutes"])("%s emptied → null", (field) => {
    expect(build({ ...defaults(), [field]: "" })).toEqual({ id: "loc-001", [field]: null });
  });

  test("dailyTarget emptied → 0", () => {
    expect(build({ ...defaults(), dailyTarget: "" })).toEqual({ id: "loc-001", dailyTarget: 0 });
  });

  test("dailyTarget emptied when already 0 is not a change", () => {
    const zero = toStoreConfigurationFormValues({ ...SERVER, dailyTarget: 0 });
    expect(
      buildStoreConfigurationPayload({
        id: "loc-001",
        values: { ...zero, dailyTarget: "" },
        defaults: zero
      })
    ).toBeNull();
  });
});

describe("buildStoreConfigurationPayload — category / mainBranch", () => {
  test("category → Main Branch sends category + mainBranch true", () => {
    expect(build({ ...defaults(), category: "Main Branch" })).toEqual({
      id: "loc-001",
      category: "Main Branch",
      mainBranch: true
    });
  });

  test("category → another category sends category + mainBranch false", () => {
    const mainDefaults = toStoreConfigurationFormValues({ ...SERVER, category: "Main Branch" });
    expect(
      buildStoreConfigurationPayload({
        id: "loc-001",
        values: { ...mainDefaults, category: "Warehouse" },
        defaults: mainDefaults
      })
    ).toEqual({ id: "loc-001", category: "Warehouse", mainBranch: false });
  });

  test("category unchanged → neither category nor mainBranch sent", () => {
    const payload = build({ ...defaults(), dailyTarget: 1 });
    expect(payload).toEqual({ id: "loc-001", dailyTarget: 1 });
    expect(payload).not.toHaveProperty("category");
    expect(payload).not.toHaveProperty("mainBranch");
  });
});

describe("buildStoreConfigurationPayload — combinations", () => {
  test("multiple dirty fields → exactly those fields", () => {
    expect(
      build({
        ...defaults(),
        timezone: "Asia/Jayapura",
        parkedCartTtlMinutes: 30,
        category: "Office"
      })
    ).toEqual({
      id: "loc-001",
      timezone: "Asia/Jayapura",
      parkedCartTtlMinutes: 30,
      category: "Office",
      mainBranch: false
    });
  });

  test("unchanged fields are omitted", () => {
    const payload = build({ ...defaults(), maxActiveParkedCarts: 3 });
    expect(Object.keys(payload).sort()).toEqual(["id", "maxActiveParkedCarts"]);
  });

  test("clean form → no payload", () => {
    expect(build(defaults())).toBeNull();
  });

  test("never sends tenant/store scope", () => {
    const payload = build({ ...defaults(), description: "x" });
    for (const key of ["tenantId", "store", "storeId", "storeIds", "status"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  test("does not mutate values or defaults", () => {
    const values = Object.freeze({ ...defaults(), category: "Main Branch", description: "" });
    const frozenDefaults = Object.freeze(defaults());
    expect(() =>
      buildStoreConfigurationPayload({ id: "loc-001", values, defaults: frozenDefaults })
    ).not.toThrow();
    expect(values.category).toBe("Main Branch");
    expect(frozenDefaults).toEqual(defaults());
  });
});
