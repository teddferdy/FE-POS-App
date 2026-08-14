import { hasOwn, safeGet } from "@/lib/safe-lookup";

describe("safe-lookup (prototype pollution safety)", () => {
  test("hasOwn only returns own enumerable properties", () => {
    expect(hasOwn({ a: 1 }, "a")).toBe(true);
    expect(hasOwn({ a: 1 }, "toString")).toBe(false);
    expect(hasOwn({ a: 1 }, "constructor")).toBe(false);
    expect(hasOwn(Object.create(null), "toString")).toBe(false);
    expect(hasOwn(null, "a")).toBe(false);
    expect(hasOwn(undefined, "a")).toBe(false);
  });

  test("safeGet returns own property values", () => {
    const labels = { cash: "Tunai", bank: "Transfer" };
    expect(safeGet(labels, "cash", "fallback")).toBe("Tunai");
  });

  test("safeGet falls back for inherited/prototype keys (no prototype pollution)", () => {
    const labels = { cash: "Tunai" };
    expect(safeGet(labels, "__proto__", "fallback")).toBe("fallback");
    expect(safeGet(labels, "constructor", "fallback")).toBe("fallback");
    expect(safeGet(labels, "toString", "fallback")).toBe("fallback");
    expect(safeGet(labels, "hasOwnProperty", "fallback")).toBe("fallback");
  });

  test("safeGet does not return properties polluted onto Object.prototype", () => {
    const labels = { cash: "Tunai" };
    Object.prototype.pollutedProp = "polluted!";
    try {
      expect(safeGet(labels, "pollutedProp", "fallback")).toBe("fallback");
      expect(hasOwn(labels, "pollutedProp")).toBe(false);
      expect(labels.pollutedProp).toBe("polluted!");
    } finally {
      delete Object.prototype.pollutedProp;
    }
  });

  test("safeGet falls back when the key is missing", () => {
    const labels = { cash: "Tunai" };
    expect(safeGet(labels, "ewallet", "ewallet")).toBe("ewallet");
    expect(safeGet(labels, undefined, "-")).toBe("-");
  });
});
