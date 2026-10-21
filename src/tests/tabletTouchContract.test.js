/* global __dirname */
import fs from "fs";
import path from "path";

// Touch tablets (the client runs the POS on a tab) have no hover:
// - a control revealed only by `opacity-0 group-hover:opacity-100` is
//   invisible there; it must stay visible and fade only where a
//   hover-capable pointer exists ([@media(hover:hover)]:…);
// - the desktop sidebar rail expands its labels on hover only, so the
//   shell switches to it on `desk` (≥1280px AND a fine hover pointer) —
//   a touch tablet of any width keeps the drawer + hamburger.

const SRC = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../..");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : walk(full);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : [];
  });

// Purely decorative overlays (no control inside) may keep hover-only fades.
const DECORATIVE = ["page/product/DetailProduct.jsx"];

test("no control is revealed by hover alone", () => {
  const offenders = walk(SRC)
    .filter((file) => !DECORATIVE.some((d) => file.endsWith(d)))
    .filter((file) =>
      /(^|[\s"'`])opacity-0 group-hover:opacity-100/.test(fs.readFileSync(file, "utf8"))
    )
    .map((file) => path.relative(SRC, file));
  expect(offenders).toEqual([]);
});

test("the desk screen requires a wide screen with a mouse", () => {
  const config = fs.readFileSync(path.join(ROOT, "tailwind.config.js"), "utf8");
  expect(config).toMatch(
    /desk: \{ raw: "\(min-width: 1280px\) and \(hover: hover\) and \(pointer: fine\)" \}/
  );
});

test("the dashboard shell switches between drawer and rail on desk, not on width alone", () => {
  const layout = fs.readFileSync(path.join(SRC, "components/layout/DashboardLayout.jsx"), "utf8");
  const header = fs.readFileSync(path.join(SRC, "components/layout/Header.jsx"), "utf8");
  for (const source of [layout, header]) {
    expect(source).not.toMatch(/\bxl:(block|hidden|ml-16|ml-64|left-16|left-64)\b/);
  }
  expect(layout).toMatch(/hidden desk:block/);
  expect(layout).toMatch(/desk:hidden/);
  expect(header).toMatch(/desk:hidden p-2/);
});
