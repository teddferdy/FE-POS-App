import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CartPanel from "../page/cashier/components/CartPanel";
import { optimizeImage } from "../utils/image";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => (typeof opts === "string" ? opts : k) })
}));

jest.mock("../utils/image", () => ({
  optimizeImage: jest.fn((url) => url)
}));

const itemA = {
  cartKey: "1_",
  id: 1,
  nameProduct: "Product A",
  price: 1000,
  count: 1,
  totalPrice: 1000,
  image: "https://cdn.test/a.png"
};
const itemB = {
  cartKey: "2_",
  id: 2,
  nameProduct: "Product B",
  price: 2000,
  count: 1,
  totalPrice: 2000,
  image: "https://cdn.test/b.png"
};

const baseProps = {
  subtotal: 3000,
  taxRate: 0,
  taxAmount: 0,
  onIncrement: jest.fn(),
  onDecrement: jest.fn(),
  onDelete: jest.fn(),
  onCheckout: jest.fn(),
  totalItems: 2
};

describe("CartPanel row rendering scope (F9-08)", () => {
  beforeEach(() => {
    optimizeImage.mockClear();
  });

  test("an unrelated line's props changing does not re-render every other line", () => {
    const { rerender } = render(<CartPanel {...baseProps} items={[itemA, itemB]} />);
    const callsAfterMount = optimizeImage.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    // Only itemA's own object changes (new reference, overridden price) —
    // itemB keeps the exact same reference, mirroring what the store now
    // guarantees (F9-08's order-list.js reference-stability fix).
    const updatedItemA = { ...itemA, price: 1500, totalPrice: 1500 };
    rerender(<CartPanel {...baseProps} items={[updatedItemA, itemB]} />);

    const callsAfterUpdate = optimizeImage.mock.calls.length;
    expect(callsAfterUpdate - callsAfterMount).toBe(1);
  });

  test("quantity, delete, and totals still render correctly with memoized rows", () => {
    render(<CartPanel {...baseProps} items={[itemA, itemB]} />);
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
    expect(screen.getAllByText("Rp 1.000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rp 2.000").length).toBeGreaterThan(0);
  });

  test("incrementing one line still calls onIncrement with that exact item", () => {
    const onIncrement = jest.fn();
    render(<CartPanel {...baseProps} items={[itemA, itemB]} onIncrement={onIncrement} />);
    const incButtons = screen.getAllByLabelText("Increase quantity");
    fireEvent.click(incButtons[0]);
    expect(onIncrement).toHaveBeenCalledWith(itemA);
  });

  test("price override on one memoized row still works end-to-end", () => {
    const onUpdatePrice = jest.fn();
    render(
      <CartPanel {...baseProps} items={[itemA, itemB]} canEditPrice onUpdatePrice={onUpdatePrice} />
    );
    const editButtons = screen.getAllByLabelText("Edit price");
    fireEvent.click(editButtons[0]);
    fireEvent.change(screen.getByDisplayValue("1000"), { target: { value: "1200" } });
    fireEvent.click(screen.getByLabelText("common.save"));
    fireEvent.click(screen.getByText("page.cashier.confirmPriceOverrideYes"));
    expect(onUpdatePrice).toHaveBeenCalledWith(itemA, 1200);
  });

  test("delete confirmation still works per-row with memoized rows", () => {
    const onDelete = jest.fn();
    render(<CartPanel {...baseProps} items={[itemA, itemB]} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByLabelText("page.cashier.deleteTitle");
    fireEvent.click(deleteButtons[1]);
    fireEvent.click(screen.getByText("page.cashier.deleteYes"));
    expect(onDelete).toHaveBeenCalledWith(itemB);
  });
});
