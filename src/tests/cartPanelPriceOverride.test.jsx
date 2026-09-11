import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CartPanel from "../page/cashier/components/CartPanel";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => (typeof opts === "string" ? opts : k) })
}));

const item = {
  cartKey: "1_",
  id: 1,
  nameProduct: "Product A",
  price: 10000,
  count: 2,
  totalPrice: 20000
};

const baseProps = {
  items: [item],
  subtotal: 20000,
  taxRate: 0,
  taxAmount: 0,
  onIncrement: jest.fn(),
  onDecrement: jest.fn(),
  onDelete: jest.fn(),
  onCheckout: jest.fn(),
  totalItems: 2
};

describe("CartPanel price override — authorization (F7-01)", () => {
  test("an authorized role (canEditPrice=true) sees the price-edit affordance", () => {
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={jest.fn()} />);
    expect(screen.getByLabelText("Edit price")).toBeInTheDocument();
  });

  test("an unauthorized role (canEditPrice=false) does not see the price-edit affordance", () => {
    render(<CartPanel {...baseProps} canEditPrice={false} onUpdatePrice={jest.fn()} />);
    expect(screen.queryByLabelText("Edit price")).not.toBeInTheDocument();
  });

  test("an undefined/omitted role fails closed — no price-edit affordance by default", () => {
    render(<CartPanel {...baseProps} onUpdatePrice={jest.fn()} />);
    expect(screen.queryByLabelText("Edit price")).not.toBeInTheDocument();
  });

  test("the line price is still displayed (read-only) when editing is not permitted", () => {
    render(<CartPanel {...baseProps} canEditPrice={false} />);
    expect(screen.getAllByText("Rp 20.000").length).toBeGreaterThan(0);
  });
});

describe("CartPanel price override — deliberate confirmation flow (F7-01)", () => {
  test("saving a new price opens a confirmation step instead of committing immediately", () => {
    const onUpdatePrice = jest.fn();
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={onUpdatePrice} />);

    fireEvent.click(screen.getByLabelText("Edit price"));
    const input = screen.getByDisplayValue("10000");
    fireEvent.change(input, { target: { value: "12000" } });
    fireEvent.click(screen.getByLabelText("common.save"));

    expect(onUpdatePrice).not.toHaveBeenCalled();
    expect(screen.getByText("page.cashier.confirmPriceOverrideDesc")).toBeInTheDocument();
  });

  test("confirming the override commits the new price exactly once", () => {
    const onUpdatePrice = jest.fn();
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={onUpdatePrice} />);

    fireEvent.click(screen.getByLabelText("Edit price"));
    fireEvent.change(screen.getByDisplayValue("10000"), { target: { value: "12000" } });
    fireEvent.click(screen.getByLabelText("common.save"));
    fireEvent.click(screen.getByText("page.cashier.confirmPriceOverrideYes"));

    expect(onUpdatePrice).toHaveBeenCalledTimes(1);
    expect(onUpdatePrice).toHaveBeenCalledWith(item, 12000);
  });

  test("cancelling the confirmation leaves the cart price untouched", () => {
    const onUpdatePrice = jest.fn();
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={onUpdatePrice} />);

    fireEvent.click(screen.getByLabelText("Edit price"));
    fireEvent.change(screen.getByDisplayValue("10000"), { target: { value: "12000" } });
    fireEvent.click(screen.getByLabelText("common.save"));
    fireEvent.click(screen.getByText("page.cashier.confirmPriceOverrideNo"));

    expect(onUpdatePrice).not.toHaveBeenCalled();
  });
});

describe("CartPanel price override — input safety (F7-01)", () => {
  test("a negative price is rejected before any confirmation step is reached", () => {
    const onUpdatePrice = jest.fn();
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={onUpdatePrice} />);

    fireEvent.click(screen.getByLabelText("Edit price"));
    fireEvent.change(screen.getByDisplayValue("10000"), { target: { value: "-50" } });
    fireEvent.click(screen.getByLabelText("common.save"));

    expect(screen.getByText("page.cashier.invalidPrice")).toBeInTheDocument();
    expect(screen.queryByText("page.cashier.confirmPriceOverrideDesc")).not.toBeInTheDocument();
    expect(onUpdatePrice).not.toHaveBeenCalled();
  });

  test("an empty price is rejected and cannot commit", () => {
    const onUpdatePrice = jest.fn();
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={onUpdatePrice} />);

    fireEvent.click(screen.getByLabelText("Edit price"));
    fireEvent.change(screen.getByDisplayValue("10000"), { target: { value: "" } });
    fireEvent.click(screen.getByLabelText("common.save"));

    expect(screen.getByText("page.cashier.invalidPrice")).toBeInTheDocument();
    expect(onUpdatePrice).not.toHaveBeenCalled();
  });

  test("a malformed non-numeric price cannot produce a NaN commit", () => {
    const onUpdatePrice = jest.fn();
    render(<CartPanel {...baseProps} canEditPrice onUpdatePrice={onUpdatePrice} />);

    fireEvent.click(screen.getByLabelText("Edit price"));
    fireEvent.change(screen.getByDisplayValue("10000"), { target: { value: "abc" } });
    fireEvent.click(screen.getByLabelText("common.save"));

    expect(screen.getByText("page.cashier.invalidPrice")).toBeInTheDocument();
    expect(onUpdatePrice).not.toHaveBeenCalled();
  });
});

describe("CartPanel price override — regression (F7-01)", () => {
  test("quantity increment/decrement/delete still work when canEditPrice is true", () => {
    const onIncrement = jest.fn();
    render(
      <CartPanel {...baseProps} onIncrement={onIncrement} canEditPrice onUpdatePrice={jest.fn()} />
    );
    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(onIncrement).toHaveBeenCalledWith(item);
  });

  test("per-item delete confirmation still works when price editing is authorized", () => {
    const onDelete = jest.fn();
    render(<CartPanel {...baseProps} onDelete={onDelete} canEditPrice onUpdatePrice={jest.fn()} />);
    fireEvent.click(screen.getByLabelText("page.cashier.deleteTitle"));
    fireEvent.click(screen.getByText("page.cashier.deleteYes"));
    expect(onDelete).toHaveBeenCalledWith(item);
  });
});
