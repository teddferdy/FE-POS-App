import { screen, waitFor } from "@testing-library/react";

// Fixture for POST /order/quote (BE contract: order-quote-server-totals).
// The checkout displays and pays against the server's totals, so a test
// states them explicitly. With no overrides the quote is the plain sum of
// the submitted lines (no discount, no tax) — tests that need discounts,
// points or tax must pass the server numbers they expect.
export const serverQuote = (payload = {}, overrides = {}) => {
  const subTotal = (payload.items || []).reduce(
    (sum, line) => sum + (Number(line.subtotal) || Number(line.price) * Number(line.quantity) || 0),
    0
  );
  return {
    data: {
      subTotal,
      discountAmount: 0,
      discountSource: "none",
      pointDiscountAmount: 0,
      redeemedPoints: 0,
      taxRate: 0,
      taxAmount: 0,
      serviceChargeRate: 0,
      serviceChargeAmount: 0,
      totalPrice: subTotal,
      ...overrides
    }
  };
};

// Payment is offered only once the server has quoted the current inputs.
export const waitForCheckoutQuote = () =>
  waitFor(() =>
    expect(screen.getByText("page.cashier.confirmPayment").closest("button")).not.toBeDisabled()
  );
