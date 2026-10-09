import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HorizontalScrollArea from "@/components/ui/HorizontalScrollArea";

// Scrollbars are hidden app-wide (index.css), so a table wider than its
// card gave no hint that more columns exist. The scroll area must show an
// affordance ONLY while content actually overflows, on the side(s) where
// hidden content remains, and be keyboard-reachable when scrollable.

let geometry;
const define = (prop, get) =>
  Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get });

beforeAll(() => {
  define("scrollWidth", () => geometry.scrollWidth);
  define("clientWidth", () => geometry.clientWidth);
});

afterAll(() => {
  delete HTMLElement.prototype.scrollWidth;
  delete HTMLElement.prototype.clientWidth;
});

const renderArea = () =>
  render(
    <HorizontalScrollArea label="Tabel riwayat" testIdPrefix="hs">
      <table>
        <tbody>
          <tr>
            <td>wide content</td>
          </tr>
        </tbody>
      </table>
    </HorizontalScrollArea>
  );

describe("HorizontalScrollArea", () => {
  test("no overflow: no fades, no visible scrollbar, not a focus stop", () => {
    geometry = { scrollWidth: 400, clientWidth: 400 };
    renderArea();
    const viewport = screen.getByTestId("hs-viewport");
    expect(screen.queryByTestId("hs-fade-left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hs-fade-right")).not.toBeInTheDocument();
    expect(viewport).not.toHaveClass("scrollbar-visible");
    expect(viewport).not.toHaveAttribute("tabindex");
    expect(viewport).not.toHaveAttribute("role");
  });

  test("overflow at start: right edge cue, visible scrollbar, focusable labelled region", () => {
    geometry = { scrollWidth: 900, clientWidth: 400 };
    renderArea();
    const viewport = screen.getByTestId("hs-viewport");
    expect(screen.getByTestId("hs-fade-right")).toBeInTheDocument();
    expect(screen.queryByTestId("hs-fade-left")).not.toBeInTheDocument();
    expect(viewport).toHaveClass("scrollbar-visible");
    expect(viewport).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("region", { name: "Tabel riwayat" })).toBe(viewport);
  });

  test("scrolled to the end: only the left edge cue remains", () => {
    geometry = { scrollWidth: 900, clientWidth: 400 };
    renderArea();
    const viewport = screen.getByTestId("hs-viewport");
    viewport.scrollLeft = 500;
    fireEvent.scroll(viewport);
    expect(screen.getByTestId("hs-fade-left")).toBeInTheDocument();
    expect(screen.queryByTestId("hs-fade-right")).not.toBeInTheDocument();
  });

  test("edge cues are decorative and never intercept pointer input", () => {
    geometry = { scrollWidth: 900, clientWidth: 400 };
    renderArea();
    const fade = screen.getByTestId("hs-fade-right");
    expect(fade).toHaveAttribute("aria-hidden", "true");
    expect(fade).toHaveClass("pointer-events-none");
  });
});
