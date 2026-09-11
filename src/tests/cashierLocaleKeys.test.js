/* global __dirname */
import fs from "fs";
import path from "path";

const LOCALE_DIR = path.resolve(__dirname, "../../public/locales");
const COMPONENTS = [
  path.resolve(__dirname, "../page/cashier/components/OrderQueue.jsx"),
  path.resolve(__dirname, "../page/cashier/components/CollectPaymentModal.jsx"),
  path.resolve(__dirname, "../page/cashier/components/ParkedCartPanel.jsx"),
  path.resolve(__dirname, "../components/organism/business-trip-download-modal/index.jsx")
];

const collectStaticKeys = () => {
  const keys = new Set();
  const re =
    /t\(\s*"([^"]*(?:page\.cashier\.(?:collectPayment|orderQueue)|page\.businessTrip\.download)[^"]*)"/g;
  COMPONENTS.forEach((file) => {
    const src = fs.readFileSync(file, "utf8");
    let match;
    while ((match = re.exec(src))) keys.add(match[1]);
  });
  return [...keys].sort();
};

describe("runtime locale files resolve cashier payment + business-trip download keys", () => {
  const usedKeys = collectStaticKeys();
  const locales = ["en", "id"];

  test.each(locales)("%s/translation.json resolves every key the components use", (lng) => {
    const localePath = path.join(LOCALE_DIR, lng, "translation.json");
    const translations = JSON.parse(fs.readFileSync(localePath, "utf8"));

    usedKeys.forEach((key) => {
      const value = translations[key];
      expect(value).toBeDefined();
      expect(typeof value).toBe("string");
      expect(value.trim()).not.toBe("");
      expect(value).not.toBe(key);
    });
  });

  test("at least one collectPayment + one orderQueue + one businessTrip.download key is exercised", () => {
    expect(usedKeys.some((key) => key.startsWith("page.cashier.collectPayment"))).toBe(true);
    expect(usedKeys.some((key) => key.startsWith("page.cashier.orderQueue"))).toBe(true);
    expect(usedKeys.some((key) => key.startsWith("page.businessTrip.download"))).toBe(true);
  });
});
