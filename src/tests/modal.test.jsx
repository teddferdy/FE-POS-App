import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../components/organism/modal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

// Regression coverage for a bug that shipped at 8+ call sites: Modal's
// loading/disabled-while-submitting prop is `loading`, but callers kept
// passing `mutation.isLoading` under the prop name `isLoading` — which
// Modal silently dropped, leaving the confirm button clickable (and thus
// open to duplicate submits) for the entire duration of the mutation.
describe("Modal loading prop", () => {
  test("disables confirm button when `loading` is passed (correct prop)", () => {
    render(<Modal type="confirm" open title="t" onConfirm={() => {}} loading confirmText="Go" />);
    expect(screen.getByRole("button", { name: /Go|common.loading/ })).toBeDisabled();
  });

  test("falls back to `isLoading` and still disables the confirm button, with a console warning", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    render(<Modal type="confirm" open title="t" onConfirm={() => {}} isLoading confirmText="Go" />);
    expect(screen.getByRole("button", { name: /Go|common.loading/ })).toBeDisabled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("isLoading"));
    warnSpy.mockRestore();
  });

  test("confirm button is enabled and no warning fires when neither prop is passed", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    render(<Modal type="confirm" open title="t" onConfirm={() => {}} confirmText="Go" />);
    expect(screen.getByRole("button", { name: "Go" })).not.toBeDisabled();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// Regression coverage for a bug that shipped in edit-profile-modal and
// supplier-payment-modal: an ASYNC onConfirm always returns a Promise, which
// is never `=== false` — so the old synchronous-only `result === false`
// check let the modal close immediately on click regardless of a validation
// failure or an in-flight/failed request, even though the handler intended
// to keep it open (mirroring the sync `return false` convention already
// used elsewhere, e.g. SupplierScoreList.jsx's confirm modal).
describe("Modal onConfirm — sync and async `return false` keep it open", () => {
  test("sync onConfirm returning false keeps the modal open (no close call)", () => {
    const onOpenChange = jest.fn();
    render(
      <Modal
        type="confirm"
        open
        title="t"
        onOpenChange={onOpenChange}
        onConfirm={() => false}
        confirmText="Go"
      />
    );
    fireEvent.click(screen.getByText("Go"));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test("async onConfirm resolving to false keeps the modal open", async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn(async () => {
      await Promise.resolve();
      return false;
    });
    render(
      <Modal
        type="confirm"
        open
        title="t"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        confirmText="Go"
      />
    );
    fireEvent.click(screen.getByText("Go"));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  test("async onConfirm resolving normally (no false) closes the modal", async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn(async () => {
      await Promise.resolve();
    });
    render(
      <Modal
        type="confirm"
        open
        title="t"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        confirmText="Go"
      />
    );
    fireEvent.click(screen.getByText("Go"));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

// Regression coverage for a bug where a "form"-type Modal's content had no
// scroll container of its own — DialogContent caps at max-h-[90vh] with no
// overflow handling, so a form with several fields could clip past the fold
// on a short viewport with no way to reach the remaining fields. NOTE:
// jsdom does not perform real layout, so this cannot verify the visual
// outcome (that content actually becomes reachable by scrolling) — it only
// asserts the scroll-container class survives on the wrapper. Reverting the
// className would make this fail; it is not a substitute for a real
// browser/viewport check.
describe("Modal form content — scroll container class", () => {
  test("wraps form content in a bounded, scrollable container", () => {
    render(
      <Modal type="form" open title="t" onConfirm={() => {}} confirmText="Go">
        <div data-testid="field">field</div>
      </Modal>
    );
    const field = screen.getByTestId("field");
    const scrollWrapper = field.parentElement;
    expect(scrollWrapper.className).toEqual(expect.stringContaining("overflow-y-auto"));
    expect(scrollWrapper.className).toEqual(expect.stringContaining("max-h-"));
  });
});
