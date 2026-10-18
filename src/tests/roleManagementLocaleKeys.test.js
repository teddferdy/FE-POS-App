/* global __dirname */
import fs from "fs";
import path from "path";
import runtimeEn from "../../public/locales/en/translation.json";
import runtimeId from "../../public/locales/id/translation.json";
import mirrorEn from "../i18n/en.json";
import mirrorId from "../i18n/id.json";

// Every static role-management key the pages use resolves in both runtime
// locale files and their src/i18n mirrors.
const SOURCES = [
  fs.readFileSync(path.join(__dirname, "../page/role/EditRole.jsx"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../page/role/RoleManagement.jsx"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../page/role/rolePermissions.js"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../page/role/components/PermissionMatrix.jsx"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../page/user/AddRole.jsx"), "utf8")
];

const LOCALES = [
  ["public/locales/en", runtimeEn],
  ["public/locales/id", runtimeId],
  ["src/i18n/en", mirrorEn],
  ["src/i18n/id", mirrorId]
];

const usedKeys = () => {
  const keys = new Set();
  const re = /"(page\.(?:role|globalSetting\.roleManagement)\.[A-Za-z0-9_.]+)"/g;
  SOURCES.forEach((src) => {
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

  test.each(LOCALES)("%s resolves every role key", (_name, dict) => {
    const missing = keys.filter((k) => typeof dict[k] !== "string" || dict[k].trim() === "");
    expect(missing).toEqual([]);
  });
});
