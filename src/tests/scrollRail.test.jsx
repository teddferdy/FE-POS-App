import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScrollRail from "../components/ui/ScrollRail";

if (!Element.prototype.scrollBy) Element.prototype.scrollBy = jest.fn();

const renderRail = () =>
  render(
    <ScrollRail
      leftLabel="Scroll kiri"
      rightLabel="Scroll kanan"
      railTestId="test-rail"
      fadeTestIdPrefix="test-rail"
      gutterClassName="flex items-center gap-2 px-4 lg:px-6"
      railClassName="pb-1">
      <div className="flex gap-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="w-56 shrink-0">
            Card {i}
          </div>
        ))}
      </div>
    </ScrollRail>
  );

const setRailOverflow = (scrollWidth = 1600, clientWidth = 400, scrollLeft = 0) => {
  const rail = screen.getByTestId("test-rail");
  Object.defineProperty(rail, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(rail, "clientWidth", { configurable: true, value: clientWidth });
  Object.defineProperty(rail, "scrollLeft", { configurable: true, value: scrollLeft });
  fireEvent.scroll(rail);
};

describe("ScrollRail — horizontal rail scroll affordance", () => {
  test("no overflow: chevrons present but disabled, no edge fades", () => {
    renderRail();

    expect(screen.getByRole("button", { name: "Scroll kiri" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Scroll kanan" })).toBeDisabled();
    expect(screen.queryByTestId("test-rail-fade-left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("test-rail-fade-right")).not.toBeInTheDocument();
  });

  test("overflow to the right: right chevron enabled + right fade, left stays disabled", () => {
    renderRail();
    setRailOverflow();

    expect(screen.getByRole("button", { name: "Scroll kiri" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Scroll kanan" })).toBeEnabled();
    expect(screen.queryByTestId("test-rail-fade-left")).not.toBeInTheDocument();
    expect(screen.getByTestId("test-rail-fade-right")).toBeInTheDocument();
  });

  test("right chevron scrolls the rail forward", () => {
    Element.prototype.scrollBy = jest.fn();

    renderRail();
    setRailOverflow();

    fireEvent.click(screen.getByRole("button", { name: "Scroll kanan" }));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 300, behavior: "smooth" });
  });

  test("scrolled into the middle: both chevrons and fades, left scrolls back", () => {
    Element.prototype.scrollBy = jest.fn();

    renderRail();
    setRailOverflow(1600, 400, 800);

    expect(screen.getByRole("button", { name: "Scroll kiri" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Scroll kanan" })).toBeEnabled();
    expect(screen.getByTestId("test-rail-fade-left")).toBeInTheDocument();
    expect(screen.getByTestId("test-rail-fade-right")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Scroll kiri" }));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -300, behavior: "smooth" });
  });

  test("scrolled to the end: left enabled, right disabled", () => {
    renderRail();
    setRailOverflow(1600, 400, 1200);

    expect(screen.getByRole("button", { name: "Scroll kiri" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Scroll kanan" })).toBeDisabled();
  });
});
