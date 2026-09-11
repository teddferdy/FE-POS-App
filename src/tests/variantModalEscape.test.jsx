import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import VariantModal from "../page/cashier/components/VariantModal";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const product = {
  id: 1,
  nameProduct: "Coffee",
  price: 15000,
  variant: [{ nameVariant: "Small", price: 15000 }]
};

describe("VariantModal keyboard close", () => {
  // F9-04: this modal now closes via the project's Dialog primitive
  // (Radix), whose Escape handling listens on `document` rather than the
  // old manual `window` listener it replaced — the assertions are
  // unchanged, only the event target matches how Radix actually listens.
  test("pressing Escape closes the modal, matching the visible X button", () => {
    const onClose = jest.fn();
    render(<VariantModal product={product} onSelect={jest.fn()} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("other keys do not close the modal", () => {
    const onClose = jest.fn();
    render(<VariantModal product={product} onSelect={jest.fn()} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  test("renders as a properly-labelled dialog (F9-04)", () => {
    render(<VariantModal product={product} onSelect={jest.fn()} onClose={jest.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("page.cashier.selectVariant");
  });
});
