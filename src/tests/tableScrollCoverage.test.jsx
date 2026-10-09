/* eslint-disable no-undef */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

// Every table in the app must give mouse users a visible way to scroll
// sideways. The shadcn <Table> scrolls through HorizontalScrollArea, and no
// on-screen JSX <table> may sit outside one (print documents and the date
// picker grid are the only exemptions; the thermal printer builds HTML strings).
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..");
const EXEMPT = [
  /^components\/document\//, // print-only documents
  /^components\/ui\/calendar\.jsx$/, // date picker grid
  /^utils\/thermalPrint\.js$/, // HTML string for the thermal printer
  /^tests\//
];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return walk(full);
    return /\.jsx?$/.test(d.name) ? [full] : [];
  });

let geometry;
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get: () => geometry.scrollWidth
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => geometry.clientWidth
  });
});
afterAll(() => {
  delete HTMLElement.prototype.scrollWidth;
  delete HTMLElement.prototype.clientWidth;
});

describe("table horizontal-scroll coverage", () => {
  test("shadcn <Table> shows the scroll controls when it overflows", () => {
    geometry = { scrollWidth: 900, clientWidth: 400 };
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>wide</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("button", { name: "common.scrollTableRight" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "common.scrollTableLeft" })).toBeDisabled();
  });

  test("every on-screen JSX <table> is rendered inside HorizontalScrollArea", () => {
    const offenders = [];
    for (const file of walk(SRC)) {
      const rel = path.relative(SRC, file).split(path.sep).join("/");
      if (EXEMPT.some((r) => r.test(rel))) continue;
      const src = fs.readFileSync(file, "utf8");
      if (!/<table\b/.test(src)) continue;
      // Structural check per table: the nearest enclosing scroll wrapper
      // opened before it must be HorizontalScrollArea (or the shadcn Table
      // primitive itself, which renders one).
      const lines = src.split("\n");
      lines.forEach((line, i) => {
        if (!/<table\b/.test(line) || /^\s*(\/\/|\*)/.test(line) || /["'`].*<table/.test(line))
          return;
        const before = lines.slice(0, i + 1).join("\n");
        const opened = (before.match(/<HorizontalScrollArea\b/g) || []).length;
        const closed = (before.match(/<\/HorizontalScrollArea>/g) || []).length;
        const isPrimitive = rel === "components/ui/table.jsx";
        if (opened <= closed && !isPrimitive) offenders.push(`${rel}:${i + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
