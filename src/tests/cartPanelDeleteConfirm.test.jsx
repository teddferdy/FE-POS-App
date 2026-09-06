import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CartPanel from "../page/cashier/components/CartPanel";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const item = {
  cartKey: "1_",
  id: 1,
  nameProduct: "Product A",
  price: 10000,
  count: 2,
  totalPrice: 20000
};

describe("CartPanel item removal", () => {
  test("the per-item trash icon opens the confirm dialog instead of deleting immediately", () => {
    const onDelete = jest.fn();
    render(
      <CartPanel
        items={[item]}
        subtotal={20000}
        taxRate={0}
        taxAmount={0}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onDelete={onDelete}
        onCheckout={jest.fn()}
        totalItems={2}
      />
    );

    fireEvent.click(screen.getByLabelText("page.cashier.deleteTitle"));

    // Not deleted yet — the confirm dialog must be shown first.
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText("page.cashier.deleteDesc")).toBeInTheDocument();

    fireEvent.click(screen.getByText("page.cashier.deleteYes"));
    expect(onDelete).toHaveBeenCalledWith(item);
  });

  test("cancelling the confirm dialog leaves the item untouched", () => {
    const onDelete = jest.fn();
    render(
      <CartPanel
        items={[item]}
        subtotal={20000}
        taxRate={0}
        taxAmount={0}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onDelete={onDelete}
        onCheckout={jest.fn()}
        totalItems={2}
      />
    );

    fireEvent.click(screen.getByLabelText("page.cashier.deleteTitle"));
    fireEvent.click(screen.getByText("page.cashier.deleteNo"));

    expect(onDelete).not.toHaveBeenCalled();
  });

  test("Clear Cart trigger only renders when items exist and a handler is provided", () => {
    const onClearCart = jest.fn();
    const { rerender } = render(
      <CartPanel
        items={[]}
        subtotal={0}
        taxRate={0}
        taxAmount={0}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onDelete={jest.fn()}
        onCheckout={jest.fn()}
        onClearCart={onClearCart}
        totalItems={0}
      />
    );
    expect(screen.queryByText("page.cashier.clearCart")).not.toBeInTheDocument();

    rerender(
      <CartPanel
        items={[item]}
        subtotal={20000}
        taxRate={0}
        taxAmount={0}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onDelete={jest.fn()}
        onCheckout={jest.fn()}
        onClearCart={onClearCart}
        totalItems={2}
      />
    );
    fireEvent.click(screen.getByText("page.cashier.clearCart"));
    expect(onClearCart).toHaveBeenCalledTimes(1);
  });
});
