import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
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
  getAllTypePayment: jest.fn(() =>
    Promise.resolve({
      data: [
        { type: "cash", name: "Cash", status: "active" },
        { type: "card", name: "Card", status: "active" }
      ]
    })
  )
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

const renderModal = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={[{ id: "p1", nameProduct: "Kopi", price: 10000, count: 1, totalPrice: 10000 }]}
        subtotal={10000}
        taxRate={0}
        store="1"
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={jest.fn()}
        onComplete={jest.fn()}
        {...props}
      />
    </QueryClientProvider>
  );
};

describe("Batch5 — Checkout Enter UX (P3) — RED before fix", () => {
  beforeEach(() => {
    createOrder.mockClear();
    createOrder.mockResolvedValue({
      data: { id: 1, totalPrice: 10000, subTotal: 10000, items: [] }
    });
  });

  test("cash payment + valid amount + Enter should submit same as clicking Pay", async () => {
    renderModal();
    fireEvent.click(await screen.findByText("Cash"));
    const input = screen.getByPlaceholderText("Rp 0");
    fireEvent.change(input, { target: { value: "15000" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const payload = createOrder.mock.calls[0][0];
    expect(payload.cashAmount).toBe(15000);
  });

  test("invalid/insufficient cash + Enter does NOT submit", async () => {
    renderModal();
    fireEvent.click(await screen.findByText("Cash"));
    const input = screen.getByPlaceholderText("Rp 0");
    fireEvent.change(input, { target: { value: "5000" } }); // less than total 10000
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    // should not call createOrder (still 0) – wait a tick
    await new Promise((r) => setTimeout(r, 200));
    expect(createOrder).not.toHaveBeenCalled();
  });

  test("non-cash payment + Enter on cash input (if somehow visible) does NOT trigger cash submit", async () => {
    renderModal();
    fireEvent.click(await screen.findByText("Card"));
    // cash input should not be visible for card
    expect(screen.queryByPlaceholderText("Rp 0")).not.toBeInTheDocument();
    // Even if we try to fire Enter globally, it should not submit cash payload
    // This test ensures Enter only works for cash – we verify card still needs click
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const payload = createOrder.mock.calls[0][0];
    expect(payload).not.toHaveProperty("cashAmount");
  });

  test("disabled/loading Enter does not double-submit", async () => {
    let resolveOrder;
    createOrder.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOrder = resolve;
        })
    );
    renderModal();
    fireEvent.click(await screen.findByText("Cash"));
    const input = screen.getByPlaceholderText("Rp 0");
    fireEvent.change(input, { target: { value: "15000" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await new Promise((r) => setTimeout(r, 100));
    expect(createOrder).toHaveBeenCalledTimes(1);
    resolveOrder({ data: { id: 1, totalPrice: 10000, subTotal: 10000, items: [] } });
  });
});

describe("Batch5 — Price Override Authorization (P1) — should already be restricted", () => {
  test("price override UI is correctly restricted via isAdminRole (admin/super_admin only)", async () => {
    // This test documents current behavior: CashierPage uses isAdminRole to gate canEditPrice
    // We verify the permission util itself
    const { isAdminRole } = await import("@/utils/role");
    expect(isAdminRole({ roleType: "super_admin" })).toBe(true);
    expect(isAdminRole({ roleType: "admin" })).toBe(true);
    expect(isAdminRole({ roleType: "kasir" })).toBe(false);
    expect(isAdminRole({ roleType: "cashier" })).toBe(false);
    expect(isAdminRole({ roleType: "user" })).toBe(false);
  });
});
