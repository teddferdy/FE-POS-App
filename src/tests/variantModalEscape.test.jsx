import React from "react";
import { render, fireEvent } from "@testing-library/react";
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
  test("pressing Escape closes the modal, matching the visible X button", () => {
    const onClose = jest.fn();
    render(<VariantModal product={product} onSelect={jest.fn()} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("other keys do not close the modal", () => {
    const onClose = jest.fn();
    render(<VariantModal product={product} onSelect={jest.fn()} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
