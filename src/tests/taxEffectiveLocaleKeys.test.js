/* global __dirname */
import fs from "fs";
import path from "path";

// P1 effective-tax summary — every key the summary and the tax pages use for
// effective tax and scope resolves in both runtime locales (public/locales)
// and in the mirrored src/i18n copies, with real (non-key) text.
const ROOT = path.resolve(__dirname, "../..");
const LOCALE_FILES = [
  "public/locales/en/translation.json",
  "public/locales/id/translation.json",
  "src/i18n/en.json",
  "src/i18n/id.json"
];

// Keys built from response data (finding codes, severities) cannot be found
// by a static scan, so they are listed explicitly.
const DYNAMIC_KEYS = [
  "page.taxConfig.effective.finding.MULTIPLE_ACTIVE_SAME_SCOPE",
  "page.taxConfig.effective.finding.GLOBAL_AND_OUTLET_COMBINED",
  "page.taxConfig.effective.finding.PPN_ZERO_CONFIGURED",
  "page.taxConfig.effective.finding.PPN_MISSING",
  "page.taxConfig.effective.severity.error",
  "page.taxConfig.effective.severity.warning",
  "page.taxConfig.effective.severity.info",
  "page.taxConfig.effective.error.rejected",
  "page.taxConfig.effective.error.missing",
  "page.taxConfig.effective.error.failed",
  "page.taxConfig.effective.error.forbidden",
  "page.taxConfig.effective.error.unauthorized",
  "page.taxConfig.effective.error.unavailable",
  "page.taxConfig.effective.error.mismatch",
  "page.taxConfig.effective.channel.counter",
  "page.taxConfig.effective.channel.qr"
];

// File contents, read once here with static literal paths. LOCALE_FILES below
// must stay in sync with the LOCALE_TEXT keys (the key-count and per-locale
// tests guard against drift).
const COMPONENT_SOURCES = [
  fs.readFileSync(
    path.join(ROOT, "src/page/tax-config/components/EffectiveTaxSummary.jsx"),
    "utf8"
  ),
  fs.readFileSync(path.join(ROOT, "src/page/tax-config/TaxConfigList.jsx"), "utf8"),
  fs.readFileSync(path.join(ROOT, "src/page/tax-config/DetailTaxConfig.jsx"), "utf8")
];
const LOCALE_TEXT = {
  "public/locales/en/translation.json": fs.readFileSync(
    path.join(ROOT, "public/locales/en/translation.json"),
    "utf8"
  ),
  "public/locales/id/translation.json": fs.readFileSync(
    path.join(ROOT, "public/locales/id/translation.json"),
    "utf8"
  ),
  "src/i18n/en.json": fs.readFileSync(path.join(ROOT, "src/i18n/en.json"), "utf8"),
  "src/i18n/id.json": fs.readFileSync(path.join(ROOT, "src/i18n/id.json"), "utf8")
};

const collectStaticKeys = () => {
  const keys = new Set();
  const re = /t\(\s*"(page\.taxConfig\.(?:effective|scope)\.[^"]+)"/g;
  COMPONENT_SOURCES.forEach((src) => {
    let m;
    while ((m = re.exec(src))) keys.add(m[1]);
  });
  return keys;
};

describe("effective-tax and scope locale keys", () => {
  const keys = [...new Set([...collectStaticKeys(), ...DYNAMIC_KEYS])].sort();

  test("the components actually use effective-tax and scope keys", () => {
    expect(collectStaticKeys().size).toBeGreaterThan(15);
  });

  test.each(LOCALE_FILES)("%s resolves every key with real text", (rel) => {
    const dict = JSON.parse(LOCALE_TEXT[rel]);
    const missing = keys.filter((k) => typeof dict[k] !== "string" || !dict[k].trim());
    expect(missing).toEqual([]);
    const untranslated = keys.filter((k) => dict[k] === k);
    expect(untranslated).toEqual([]);
  });

  test("Indonesian differs from English for user-facing sentences", () => {
    const en = JSON.parse(LOCALE_TEXT[LOCALE_FILES[0]]);
    const id = JSON.parse(LOCALE_TEXT[LOCALE_FILES[1]]);
    const sentences = keys.filter((k) => (en[k] || "").split(" ").length > 4);
    expect(sentences.length).toBeGreaterThan(5);
    expect(sentences.filter((k) => en[k] === id[k])).toEqual([]);
  });

  test("copy never labels configurations as duplicate or invalid", () => {
    const en = JSON.parse(LOCALE_TEXT[LOCALE_FILES[0]]);
    const offending = keys.filter((k) => /duplicate|invalid/i.test(en[k] || ""));
    expect(offending).toEqual([]);
  });
});
