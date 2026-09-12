import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CartPanel from "../page/cashier/components/CartPanel";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder } from "../services/order";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "cashier" } }]
}));
jest.mock("../services/order", () => ({
  createOrder: jest.fn()
}));
jest.mock("../services/customer", () => ({
  getAllCustomer: jest.fn(() => Promise.resolve({ data: [] })),
  addCustomer: jest.fn()
}));
jest.mock("../services/discount", () => ({
  getAllDiscount: jest.fn(() => Promise.resolve({ data: [] })),
  lookupDiscountByCode: jest.fn()
}));
jest.mock("../services/member-tier", () => ({
  getAllMemberTier: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("../services/type-payment", () => ({
  getAllTypePayment: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("../services/member", () => ({
  getMemberById: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("../services/table", () => ({
  getTableAvailability: jest.fn(() => Promise.resolve({ data: { tables: [] } })),
  getTablesWithActiveOrders: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("../utils/customerDisplayBoard", () => ({
  dispatchDisplayEvent: jest.fn(),
  DISPLAY_EVENT_TYPES: { QRIS_PAYMENT_REQUEST: "QRIS_PAYMENT_REQUEST" }
}));

const renderCartPanel = () => {
  const onCheckout = jest.fn();
  render(
    <CartPanel
      items={[]}
      subtotal={0}
      taxRate={0}
      taxAmount={0}
      onIncrement={jest.fn()}
      onDecrement={jest.fn()}
      onDelete={jest.fn()}
      onCheckout={onCheckout}
      totalItems={0}
    />
  );
  return onCheckout;
};

const renderCheckoutModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  render(
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={[]}
        subtotal={0}
        taxRate={0}
        store="1"
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={jest.fn()}
        onComplete={jest.fn()}
      />
    </QueryClientProvider>
  );
};

// Regression coverage for Phase 9 P1 finding F9-23. An empty cart could be
// sent to checkout: the CartPanel Checkout button was only disabled while
// loading, and the CheckoutModal submit button was enabled (remainingTotal 0)
// with no items, so a confirmation fired createOrder with an empty items
// array. Reverting the empty-cart guards makes these tests fail.
describe("CartPanel — checkout is blocked on an empty cart (F9-23)", () => {
  beforeEach(() => {
    createOrder.mockClear();
    createOrder.mockResolvedValue({ data: { id: 1, totalPrice: 0, subTotal: 0, items: [] } });
  });

  test("the Checkout button is disabled when the cart is empty and clicking it does nothing", () => {
    const onCheckout = renderCartPanel();

    const checkoutButton = screen.getByText("page.cashier.checkout").closest("button");
    expect(checkoutButton).toBeDisabled();

    fireEvent.click(checkoutButton);
    expect(onCheckout).not.toHaveBeenCalled();
  });

  test("the CheckoutModal confirm button is disabled with no items and never submits an empty order", () => {
    renderCheckoutModal();

    const confirmButton = screen.getByText("page.cashier.confirmPayment").closest("button");
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    expect(createOrder).not.toHaveBeenCalled();
  });
});
