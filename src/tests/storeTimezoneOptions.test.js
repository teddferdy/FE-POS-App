import { buildTimezoneOptions, DEFAULT_TIMEZONE } from "../utils/storeTimezone";

// FE W3 Phase 2 — timezone selector options: the runtime IANA list when
// Intl.supportedValuesOf exists, otherwise current + Asia/Jakarta; the
// current value is always selectable; every option is a valid timezone.

const original = Intl.supportedValuesOf;

afterEach(() => {
  Intl.supportedValuesOf = original;
});

const values = (options) => options.map((option) => option.value);

describe("buildTimezoneOptions", () => {
  test("uses Intl.supportedValuesOf('timeZone') when available", () => {
    const spy = jest.fn(() => ["Asia/Jakarta", "Asia/Makassar", "Europe/London"]);
    Intl.supportedValuesOf = spy;

    const options = buildTimezoneOptions("Asia/Makassar");

    expect(spy).toHaveBeenCalledWith("timeZone");
    expect(values(options)).toEqual(["Asia/Makassar", "Asia/Jakarta", "Europe/London"]);
    expect(options[0]).toEqual({ value: "Asia/Makassar", label: "Asia/Makassar" });
  });

  test("falls back to current + DEFAULT_TIMEZONE when unsupported", () => {
    Intl.supportedValuesOf = undefined;
    expect(values(buildTimezoneOptions("Asia/Jayapura"))).toEqual([
      "Asia/Jayapura",
      DEFAULT_TIMEZONE
    ]);
  });

  test("keeps the current value even when the generated list omits it", () => {
    Intl.supportedValuesOf = () => ["Asia/Jakarta"];
    expect(values(buildTimezoneOptions("UTC"))).toContain("UTC");
  });

  test("removes duplicates", () => {
    Intl.supportedValuesOf = () => ["Asia/Jakarta", "Asia/Jakarta", "Asia/Makassar"];
    expect(values(buildTimezoneOptions("Asia/Jakarta"))).toEqual(["Asia/Jakarta", "Asia/Makassar"]);
    Intl.supportedValuesOf = undefined;
    expect(values(buildTimezoneOptions(DEFAULT_TIMEZONE))).toEqual([DEFAULT_TIMEZONE]);
  });

  test("filters invalid timezone values", () => {
    Intl.supportedValuesOf = () => ["Asia/Jakarta", "Not/AZone", ""];
    expect(values(buildTimezoneOptions("WIB"))).toEqual(["Asia/Jakarta"]);
    Intl.supportedValuesOf = undefined;
    expect(values(buildTimezoneOptions(null))).toEqual([DEFAULT_TIMEZONE]);
  });
});
