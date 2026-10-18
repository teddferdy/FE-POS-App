import fs from "fs";

// DR-15 cash-variance decision — every key the variance review uses resolves
// in both runtime locales (public/locales) and in the mirrored src/i18n
// copies, with real (non-key) text.
//
// Paths below are repo-relative string literals: jest always runs from the
// repository root (locally and in CI), so no path computation is needed.
const LOCALE_TEXT = {
  "public/locales/en/translation.json": fs.readFileSync(
    "public/locales/en/translation.json",
    "utf8"
  ),
  "public/locales/id/translation.json": fs.readFileSync(
    "public/locales/id/translation.json",
    "utf8"
  ),
  "src/i18n/en.json": fs.readFileSync("src/i18n/en.json", "utf8"),
  "src/i18n/id.json": fs.readFileSync("src/i18n/id.json", "utf8")
};
const LOCALE_FILES = Object.keys(LOCALE_TEXT);

// The full key set, including the status labels the badge selects per
// backend enum value (auto_approved | pending_approval | approved | rejected).
const REQUIRED_KEYS = [
  "page.cashRegister.variance.column",
  "page.cashRegister.variance.reviewTitle",
  "page.cashRegister.variance.status.pendingApproval",
  "page.cashRegister.variance.status.autoApproved",
  "page.cashRegister.variance.status.approved",
  "page.cashRegister.variance.status.rejected",
  "page.cashRegister.variance.note.pending",
  "page.cashRegister.variance.note.autoApproved",
  "page.cashRegister.variance.note.approved",
  "page.cashRegister.variance.note.rejected",
  "page.cashRegister.variance.note.reviewFromHistory",
  "page.cashRegister.variance.approve",
  "page.cashRegister.variance.reject",
  "page.cashRegister.variance.approveTitle",
  "page.cashRegister.variance.rejectTitle",
  "page.cashRegister.variance.approveDesc",
  "page.cashRegister.variance.rejectDesc",
  "page.cashRegister.variance.approveConfirm",
  "page.cashRegister.variance.rejectConfirm",
  "page.cashRegister.variance.toast.approved",
  "page.cashRegister.variance.toast.rejected",
  "page.cashRegister.variance.error.conflict",
  "page.cashRegister.variance.error.forbidden",
  "page.cashRegister.variance.error.failed",
  "page.cashRegister.variance.error.network"
];

describe("cash-variance decision locale keys", () => {
  test.each(LOCALE_FILES)("%s resolves every key with real text", (rel) => {
    const dict = new Map(Object.entries(JSON.parse(LOCALE_TEXT[rel])));
    const missing = REQUIRED_KEYS.filter((k) => {
      const v = dict.get(k);
      return typeof v !== "string" || !v.trim() || v === k;
    });
    expect(missing).toEqual([]);
  });

  test("runtime and mirrored dictionaries carry identical copy per language", () => {
    const pick = (rel) => {
      const dict = new Map(Object.entries(JSON.parse(LOCALE_TEXT[rel])));
      return REQUIRED_KEYS.map((k) => dict.get(k));
    };
    expect(pick("src/i18n/en.json")).toEqual(pick("public/locales/en/translation.json"));
    expect(pick("src/i18n/id.json")).toEqual(pick("public/locales/id/translation.json"));
  });

  test("Indonesian differs from English for every key", () => {
    const en = new Map(Object.entries(JSON.parse(LOCALE_TEXT[LOCALE_FILES[0]])));
    const id = new Map(Object.entries(JSON.parse(LOCALE_TEXT[LOCALE_FILES[1]])));
    expect(REQUIRED_KEYS.filter((k) => en.get(k) === id.get(k))).toEqual([]);
  });

  test("every variance key the components use is in the required set", () => {
    const sources = [
      fs.readFileSync("src/page/cash-register/components/VarianceApproval.jsx", "utf8"),
      fs.readFileSync("src/page/cash-register/CashRegisterHistory.jsx", "utf8"),
      fs.readFileSync("src/page/cash-register/CashRegisterDetail.jsx", "utf8")
    ];
    const used = new Set();
    const re = /"(page\.cashRegister\.variance\.[A-Za-z.]+)"/g;
    sources.forEach((src) => {
      let m;
      while ((m = re.exec(src))) used.add(m[1]);
    });
    expect(used.size).toBeGreaterThan(15);
    expect([...used].filter((k) => !REQUIRED_KEYS.includes(k))).toEqual([]);
  });

  test("reject copy never claims the register reopens or money moves", () => {
    const en = new Map(Object.entries(JSON.parse(LOCALE_TEXT[LOCALE_FILES[0]])));
    expect(en.get("page.cashRegister.variance.rejectDesc")).toMatch(/does not reopen/);
    expect(en.get("page.cashRegister.variance.note.rejected")).toMatch(/stays closed/);
  });
});
