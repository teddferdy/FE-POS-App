import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CartPanel from "../page/cashier/components/CartPanel";
import { orderList } from "../state/order-list";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const seedItem = {
  cartKey: "1_",
  id: 1,
  nameProduct: "Kopi",
  price: 10000,
  count: 3,
  totalPrice: 30000
};

const seedState = () => orderList.setState({ order: [{ ...seedItem }] });

const Harness = () => {
  const order = orderList((s) => s.order);
  const subtotal = order.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);
  const totalItems = order.reduce((sum, i) => sum + Number(i.count || 0), 0);
  return (
    <CartPanel
      items={order}
      subtotal={subtotal}
      taxRate={0}
      taxAmount={0}
      totalItems={totalItems}
      onIncrement={(item) => orderList.getState().incrementOrder(item)}
      onDecrement={(item) => orderList.getState().decrementOrder(item)}
      onDelete={(item) => orderList.getState().handleDeleteOrder(item)}
      onCheckout={jest.fn()}
    />
  );
};

const qtyInput = () => screen.getByRole("spinbutton");

const persistedCount = () => orderList.getState().order[0]?.count;

// Regression coverage for Phase 9 P1 finding F9-24. The quantity input's
// commit logic ran its decrement loop regardless of the typed target, so
// typing 0 or a negative number (or garbage that parseInt collapsed to 0)
// silently drove the persisted cart line to 0 or negative — no delete
// confirmation, no guard. Reverting the commit guard in CartPanel.jsx
// makes these tests fail (the persisted reaction cart count drops below 1).
describe("CartPanel — quantity input integrity (F9-24)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    seedState();
  });

  test("typing 0 and blurring keeps the persisted count valid and asks for confirmation instead of silently decrementing", () => {
    render(<Harness />);

    fireEvent.change(qtyInput(), { target: { value: "0" } });
    fireEvent.blur(qtyInput());

    expect(persistedCount()).toBe(3);
    expect(screen.getByText("page.cashier.deleteDesc")).toBeInTheDocument();
  });

  test("typing a negative number keeps the persisted count valid and asks for confirmation", () => {
    render(<Harness />);

    fireEvent.change(qtyInput(), { target: { value: "-1" } });
    fireEvent.blur(qtyInput());

    expect(persistedCount()).toBe(3);
    expect(screen.getByText("page.cashier.deleteDesc")).toBeInTheDocument();
  });

  test("garbage text snaps back to the current count without mutating the cart", () => {
    render(<Harness />);

    fireEvent.change(qtyInput(), { target: { value: "_" } });
    fireEvent.blur(qtyInput());

    expect(persistedCount()).toBe(3);
    expect(screen.queryByText("page.cashier.deleteDesc")).not.toBeInTheDocument();
  });

  test("typing a larger valid quantity increments the line and its total", () => {
    render(<Harness />);

    fireEvent.change(qtyInput(), { target: { value: "5" } });
    fireEvent.blur(qtyInput());

    expect(persistedCount()).toBe(5);
    expect(orderList.getState().order[0].totalPrice).toBe(50000);
  });

  test("typing a smaller valid quantity decrements down to that count", () => {
    render(<Harness />);

    fireEvent.change(qtyInput(), { target: { value: "1" } });
    fireEvent.blur(qtyInput());

    expect(persistedCount()).toBe(1);
    expect(orderList.getState().order[0].totalPrice).toBe(10000);
  });
});
