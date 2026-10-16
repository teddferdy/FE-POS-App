/* global __dirname */
import fs from "fs";
import path from "path";

// Every static role-management key the pages use resolves in both runtime
// locale files and their src/i18n mirrors.
const FILES = [
  "../page/role/EditRole.jsx",
  "../page/role/RoleManagement.jsx",
  "../page/role/rolePermissions.js",
  "../page/role/components/PermissionMatrix.jsx",
  "../page/user/AddRole.jsx"
].map((f) => path.resolve(__dirname, f));

const LOCALES = [
  "../../public/locales/en/translation.json",
  "../../public/locales/id/translation.json",
  "../i18n/en.json",
  "../i18n/id.json"
].map((f) => path.resolve(__dirname, f));

const usedKeys = () => {
  const keys = new Set();
  const re = /"(page\.(?:role|globalSetting\.roleManagement)\.[A-Za-z0-9_.]+)"/g;
  FILES.forEach((file) => {
    const src = fs.readFileSync(file, "utf8");
    let match;
    while ((match = re.exec(src))) keys.add(match[1]);
  });
  return [...keys].sort();
};

describe("role management locale keys", () => {
  const keys = usedKeys();

  test("the pages use role keys", () => {
    expect(keys.length).toBeGreaterThan(20);
  });

  test.each(LOCALES)("%s resolves every role key", (file) => {
    const dict = JSON.parse(fs.readFileSync(file, "utf8"));
    const missing = keys.filter((k) => typeof dict[k] !== "string" || dict[k].trim() === "");
    expect(missing).toEqual([]);
  });
});
