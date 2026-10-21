/* global __dirname */
import fs from "fs";
import path from "path";

// The app loads its strings from public/locales at runtime. A static
// t("some.key") without a fallback that is missing there renders the raw
// key on screen ("page.cashier.selectTable"). 64 such keys were found in
// cashier, register, cash-movement, table, QR-order and discount screens.
// A call with a fallback — t("k", "Text") or t("k", { defaultValue }) —
// renders the fallback and is not counted.

const SRC = path.resolve(__dirname, "..");
const LOCALES = path.resolve(__dirname, "../../public/locales");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : walk(full);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : [];
  });

const keysWithoutFallback = () => {
  const keys = new Map();
  const call = /\bt\(\s*["']([a-zA-Z0-9_.-]+)["']\s*(,\s*)?/g;
  for (const file of walk(SRC)) {
    const source = fs.readFileSync(file, "utf8");
    let match;
    while ((match = call.exec(source))) {
      const key = match[1];
      if (!key.includes(".")) continue;
      const rest = source.slice(call.lastIndex, call.lastIndex + 300);
      if (match[2] && /^["'`]/.test(rest)) continue;
      if (match[2] && /^\{[^}]*defaultValue/.test(rest)) continue;
      keys.set(key, path.relative(SRC, file));
    }
  }
  return keys;
};

test.each(["id", "en"])("%s runtime locale resolves every key used without a fallback", (lng) => {
  const translations = JSON.parse(
    fs.readFileSync(path.join(LOCALES, lng, "translation.json"), "utf8")
  );
  const missing = [...keysWithoutFallback()]
    // returnObjects keys (arrays/objects) count as present.
    .filter(([key]) => {
      const value = translations[key];
      if (value && typeof value === "object") return false;
      return typeof value !== "string" || value.trim() === "";
    })
    .map(([key, file]) => `${key} (${file})`);
  expect(missing).toEqual([]);
});
