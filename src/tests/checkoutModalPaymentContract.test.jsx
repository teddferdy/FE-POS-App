import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder } from "../services/order";
import { getAllCustomer } from "../services/customer";
import { getAllDiscount } from "../services/discount";
import { getAllTypePayment } from "../services/type-payment";

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
        { type: "card", name: "Card", status: "active" },
        { type: "qris", name: "QRIS", status: "active" }
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

const renderModal = (onComplete) => {
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
        onComplete={onComplete}
      />
    </QueryClientProvider>
  );
};

describe("CheckoutModal payment payload contract (F-SMOKE-01)", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: [] });
    getAllDiscount.mockResolvedValue({ data: [] });
    getAllTypePayment.mockResolvedValue({
      data: [
        { type: "cash", name: "Cash", status: "active" },
        { type: "card", name: "Card", status: "active" },
        { type: "qris", name: "QRIS", status: "active" }
      ]
    });
    createOrder.mockClear();
    createOrder.mockResolvedValue({
      data: { id: 1, totalPrice: 10000, subTotal: 10000, items: [] }
    });
  });

  test("cash payment sends cashAmount and changeAmount", async () => {
    renderModal(jest.fn());

    fireEvent.click(await screen.findByText("Cash"));
    fireEvent.change(screen.getByPlaceholderText("Rp 0"), { target: { value: "15000" } });
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));

    await waitFor(() => expect(createOrder).toHaveBeenCalled());
    const payload = createOrder.mock.calls[0][0];
    expect(payload.cashAmount).toBe(15000);
    expect(payload.changeAmount).toBe(5000);
  });

  test("a direct non-cash payment (card) omits cashAmount and changeAmount entirely — BE rejects non-cash payloads carrying either field", async () => {
    renderModal(jest.fn());

    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));

    await waitFor(() => expect(createOrder).toHaveBeenCalled());
    const payload = createOrder.mock.calls[0][0];
    expect(payload).not.toHaveProperty("cashAmount");
    expect(payload).not.toHaveProperty("changeAmount");
  });

  test("QRIS payment (after on-screen confirmation) omits cashAmount and changeAmount entirely", async () => {
    renderModal(jest.fn());

    fireEvent.click(await screen.findByText("QRIS"));
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));
    fireEvent.click(await screen.findByText("page.cashier.qris.confirmReceived"));

    await waitFor(() => expect(createOrder).toHaveBeenCalled());
    const payload = createOrder.mock.calls[0][0];
    expect(payload).not.toHaveProperty("cashAmount");
    expect(payload).not.toHaveProperty("changeAmount");
  });
});

describe("CheckoutModal double-submit guard (F-SMOKE-02)", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: [] });
    getAllDiscount.mockResolvedValue({ data: [] });
    getAllTypePayment.mockResolvedValue({
      data: [
        { type: "cash", name: "Cash", status: "active" },
        { type: "card", name: "Card", status: "active" },
        { type: "qris", name: "QRIS", status: "active" }
      ]
    });
    createOrder.mockClear();
  });

  test("3 rapid clicks on confirm payment produce exactly 1 createOrder call", async () => {
    let resolveOrder;
    createOrder.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOrder = resolve;
        })
    );
    renderModal(jest.fn());

    fireEvent.click(await screen.findByText("Card"));
    const submitButton = screen.getByText("page.cashier.confirmPayment").closest("button");
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // react-query defers the actual mutationFn invocation by a microtask —
    // flush it before asserting, otherwise even a single legitimate click
    // reads back as 0 calls.
    await act(async () => {
      await Promise.resolve();
    });

    expect(createOrder).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveOrder({ data: { id: 1, totalPrice: 10000, subTotal: 10000, items: [] } });
      await Promise.resolve();
    });
  });

  test("the guard resets after a failed submission so a legitimate retry proceeds", async () => {
    createOrder.mockRejectedValueOnce(new Error("network error"));
    createOrder.mockResolvedValueOnce({
      data: { id: 2, totalPrice: 10000, subTotal: 10000, items: [] }
    });
    const onComplete = jest.fn();
    renderModal(onComplete);

    fireEvent.click(await screen.findByText("Card"));
    const submitButton = screen.getByText("page.cashier.confirmPayment");
    fireEvent.click(submitButton);

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));

    fireEvent.click(submitButton);

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
});
