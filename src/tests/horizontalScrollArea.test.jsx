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

const renderArea = (props = {}) =>
  render(
    <HorizontalScrollArea label="Tabel riwayat" testIdPrefix="hs" {...props}>
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

  // Users drive the POS with a desktop mouse: an overflowing table must offer
  // explicit, clickable left/right controls, not only a fade.
  describe("mouse controls", () => {
    test("no overflow: no control bar", () => {
      geometry = { scrollWidth: 400, clientWidth: 400 };
      renderArea();
      expect(screen.queryByTestId("hs-controls")).not.toBeInTheDocument();
    });

    test("overflow at start: bar shown, left disabled, right enabled, never printed", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea();
      const bar = screen.getByTestId("hs-controls");
      expect(bar).toHaveClass("print:hidden");
      expect(bar).toHaveTextContent("common.tableScrollHint");
      expect(screen.getByTestId("hs-scroll-left")).toBeDisabled();
      expect(screen.getByTestId("hs-scroll-right")).toBeEnabled();
      expect(screen.getByTestId("hs-scroll-left")).toHaveAttribute("type", "button");
      expect(screen.getByTestId("hs-scroll-right")).toHaveAccessibleName("common.scrollTableRight");
    });

    test("middle: both arrows enabled; at the end: right disabled", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea();
      const viewport = screen.getByTestId("hs-viewport");
      viewport.scrollLeft = 200;
      fireEvent.scroll(viewport);
      expect(screen.getByTestId("hs-scroll-left")).toBeEnabled();
      expect(screen.getByTestId("hs-scroll-right")).toBeEnabled();
      viewport.scrollLeft = 500;
      fireEvent.scroll(viewport);
      expect(screen.getByTestId("hs-scroll-left")).toBeEnabled();
      expect(screen.getByTestId("hs-scroll-right")).toBeDisabled();
    });

    test("clicking an arrow scrolls by most of one viewport, smoothly, in that direction", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea();
      const viewport = screen.getByTestId("hs-viewport");
      viewport.scrollBy = jest.fn();
      fireEvent.click(screen.getByTestId("hs-scroll-right"));
      expect(viewport.scrollBy).toHaveBeenLastCalledWith({ left: 320, behavior: "smooth" });
      viewport.scrollLeft = 300;
      fireEvent.scroll(viewport);
      fireEvent.click(screen.getByTestId("hs-scroll-left"));
      expect(viewport.scrollBy).toHaveBeenLastCalledWith({ left: -320, behavior: "smooth" });
    });

    test("narrow viewports still move a useful minimum step", () => {
      geometry = { scrollWidth: 400, clientWidth: 100 };
      renderArea();
      const viewport = screen.getByTestId("hs-viewport");
      viewport.scrollBy = jest.fn();
      fireEvent.click(screen.getByTestId("hs-scroll-right"));
      expect(viewport.scrollBy).toHaveBeenLastCalledWith({ left: 120, behavior: "smooth" });
    });

    test("falls back to scrollLeft where scrollBy is unavailable", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea();
      const viewport = screen.getByTestId("hs-viewport");
      viewport.scrollBy = undefined;
      fireEvent.click(screen.getByTestId("hs-scroll-right"));
      expect(viewport.scrollLeft).toBe(320);
    });

    test("controls={false} keeps fades and scrollbar but no bar", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea({ controls: false });
      expect(screen.queryByTestId("hs-controls")).not.toBeInTheDocument();
      expect(screen.getByTestId("hs-fade-right")).toBeInTheDocument();
      expect(screen.getByTestId("hs-viewport")).toHaveClass("scrollbar-visible");
    });

    test("edge fades sit below the control bar and are not printed", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea();
      const fade = screen.getByTestId("hs-fade-right");
      expect(fade).toHaveClass("print:hidden");
      expect(screen.getByTestId("hs-controls").contains(fade)).toBe(false);
    });

    test("fill mode lets the viewport take the parent height and scroll both ways", () => {
      geometry = { scrollWidth: 900, clientWidth: 400 };
      renderArea({ fill: true, className: "flex-1 min-h-0" });
      const viewport = screen.getByTestId("hs-viewport");
      expect(viewport).toHaveClass("h-full", "overflow-y-auto", "overflow-x-auto");
      expect(viewport.parentElement).toHaveClass("relative", "min-h-0", "flex-1");
      expect(viewport.parentElement.parentElement).toHaveClass(
        "flex",
        "flex-col",
        "flex-1",
        "min-h-0"
      );
    });
  });
});
