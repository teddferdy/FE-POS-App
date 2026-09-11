import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder } from "../services/order";
import { getAllCustomer } from "../services/customer";
import { getAllDiscount } from "../services/discount";

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

const payCash = async (cashInput) => {
  fireEvent.click(await screen.findByText("Cash"));
  fireEvent.change(screen.getByPlaceholderText("Rp 0"), { target: { value: String(cashInput) } });
  fireEvent.click(screen.getByText("page.cashier.confirmPayment"));
};

describe("CheckoutModal change-amount reconciliation (F9-01)", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: [] });
    getAllDiscount.mockResolvedValue({ data: [] });
    createOrder.mockClear();
  });

  test("Case A: server total equals the client total — change is cash minus that total", async () => {
    createOrder.mockResolvedValue({
      data: { id: 1, totalPrice: 10000, subTotal: 10000, items: [] }
    });
    const onComplete = jest.fn();
    renderModal(onComplete);

    await payCash(15000);

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    const receipt = onComplete.mock.calls[0][0];
    expect(receipt.total).toBe(10000);
    expect(receipt.changeAmount).toBe(5000);
  });

  test("Case B: server total differs from the client's pre-submit total — change reconciles against the server total, not the stale client one", async () => {
    // Server recomputed a HIGHER total than what the client displayed
    // pre-submit (e.g. a price changed between add-to-cart and checkout).
    createOrder.mockResolvedValue({
      data: { id: 2, totalPrice: 12000, subTotal: 12000, items: [] }
    });
    const onComplete = jest.fn();
    renderModal(onComplete);

    await payCash(15000);

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    const receipt = onComplete.mock.calls[0][0];
    expect(receipt.total).toBe(12000);
    // 15000 - 12000, NOT 15000 - 10000 (the stale client-side total)
    expect(receipt.changeAmount).toBe(3000);
  });

  test("Case C: non-cash payment keeps existing behavior — cashAmount is the total, changeAmount is 0", async () => {
    createOrder.mockResolvedValue({
      data: { id: 3, totalPrice: 10000, subTotal: 10000, items: [] }
    });
    const onComplete = jest.fn();
    renderModal(onComplete);

    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    const receipt = onComplete.mock.calls[0][0];
    expect(receipt.cashAmount).toBe(10000);
    expect(receipt.changeAmount).toBe(0);
  });
});

describe("CheckoutModal — accessible dialog semantics (F9-04)", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: [] });
    getAllDiscount.mockResolvedValue({ data: [] });
    createOrder.mockClear();
  });

  test("renders as a properly-labelled dialog", async () => {
    renderModal(jest.fn());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("page.cashier.payment");
  });

  test("Escape closes the checkout modal", async () => {
    const onClose = jest.fn();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CheckoutModal
          items={[{ id: "p1", nameProduct: "Kopi", price: 10000, count: 1, totalPrice: 10000 }]}
          subtotal={10000}
          taxRate={0}
          store="1"
          cashierName="Kasir"
          cashierId={1}
          onClose={onClose}
          onTableChange={jest.fn()}
          onComplete={jest.fn()}
        />
      </QueryClientProvider>
    );
    await screen.findByRole("dialog");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  test("the existing close (X) button still works", async () => {
    const onClose = jest.fn();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CheckoutModal
          items={[{ id: "p1", nameProduct: "Kopi", price: 10000, count: 1, totalPrice: 10000 }]}
          subtotal={10000}
          taxRate={0}
          store="1"
          cashierName="Kasir"
          cashierId={1}
          onClose={onClose}
          onTableChange={jest.fn()}
          onComplete={jest.fn()}
        />
      </QueryClientProvider>
    );
    const dialog = await screen.findByRole("dialog");

    fireEvent.click(within(dialog).getAllByRole("button")[0]);

    expect(onClose).toHaveBeenCalled();
  });
});
