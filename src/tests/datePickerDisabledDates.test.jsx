import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DatePicker } from "../components/ui/date-picker";

// C10 (Phase 13/14): the reservation forms (AddReservation.jsx, EditReservation.jsx)
// pass a per-day predicate to DatePicker's `disabled` prop, intending it to disable
// specific off-days inside the popover Calendar — the same pattern Calendar's own
// `disabled` prop already supports (a function called per day). But DatePicker only
// ever forwarded `disabled` to the trigger Button as a boolean, and Calendar's
// `disabled` was hardcoded to an unrelated min-date check. Passing a function object
// for `disabled` is always truthy on the Button, so the trigger became permanently,
// unconditionally disabled — the date picker could never be opened at all.
//
// The fix adds a distinct `disabledDates` prop, forwarded only to Calendar, leaving
// the existing boolean `disabled` (used by ~28 other call sites for loading/state
// gating) completely unchanged.

describe("DatePicker disabledDates (C10)", () => {
  test("the trigger is NOT disabled when a per-day disabledDates predicate is provided", () => {
    render(<DatePicker date={null} setDate={jest.fn()} disabledDates={(d) => d.getDay() === 0} />);
    const trigger = screen.getByRole("button", { name: /pilih tanggal/i });
    expect(trigger).not.toBeDisabled();
  });

  test("existing boolean disabled behavior is preserved for callers with no disabledDates", () => {
    render(<DatePicker date={null} setDate={jest.fn()} disabled={true} />);
    const trigger = screen.getByRole("button", { name: /pilih tanggal/i });
    expect(trigger).toBeDisabled();
  });

  test("disabledDates reaches the Calendar and disables every day when it always returns true", () => {
    render(<DatePicker date={null} setDate={jest.fn()} disabledDates={() => true} />);
    const trigger = screen.getByRole("button", { name: /pilih tanggal/i });
    expect(trigger).not.toBeDisabled();

    fireEvent.click(trigger);

    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent.trim()));
    expect(dayButtons.length).toBeGreaterThan(0);
    dayButtons.forEach((b) => expect(b).toBeDisabled());
  });

  test("calendar days remain selectable when disabledDates always returns false", () => {
    const setDate = jest.fn();
    render(<DatePicker date={null} setDate={setDate} disabledDates={() => false} />);
    fireEvent.click(screen.getByRole("button", { name: /pilih tanggal/i }));

    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent.trim()) && !b.disabled);
    expect(dayButtons.length).toBeGreaterThan(0);

    fireEvent.click(dayButtons[0]);
    expect(setDate).toHaveBeenCalled();
  });
});
