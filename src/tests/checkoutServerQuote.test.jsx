import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder, quoteOrder } from "../services/order";
import { serverQuote } from "./helpers/checkoutQuote";

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
  // DR-11 / DR-17: the checkout pays against the server quote.
  quoteOrder: jest.fn(),
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

// DR-11 / DR-17 (BA §35.7): one backend resolver — the checkout displays
// the server's quote for the exact pricing inputs it will submit, pays
// against it, and offers payment only for a quote of the CURRENT inputs.

const confirmButton = () => screen.getByText("page.cashier.confirmPayment").closest("button");

const renderModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={[{ id: "p1", nameProduct: "Kopi", price: 100000, count: 1, totalPrice: 100000 }]}
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

beforeEach(() => {
  quoteOrder.mockReset();
  createOrder.mockReset();
  createOrder.mockResolvedValue({
    data: { id: 9, totalPrice: 99900, subTotal: 100000, items: [] }
  });
});

describe("CheckoutModal — server quote", () => {
  test("shows the server's discount, tax and total and settles cash change against that total", async () => {
    quoteOrder.mockImplementation((payload) =>
      Promise.resolve(
        serverQuote(payload, {
          subTotal: 100000,
          discountAmount: 10000,
          discountSource: "tier",
          taxRate: 11,
          taxAmount: 9900,
          totalPrice: 99900
        })
      )
    );
    renderModal();

    expect(await screen.findByText("Rp 99.900")).toBeInTheDocument();
    expect(screen.getByText("page.cashier.quote.tierDiscount")).toBeInTheDocument();
    expect(screen.getByText("-Rp 10.000")).toBeInTheDocument();
    expect(screen.getByText("Rp 9.900")).toBeInTheDocument();

    // the quote request carries exactly the pricing inputs of the sale
    const quoted = quoteOrder.mock.calls[0][0];
    expect(quoted).toMatchObject({
      store: "1",
      useTax: true,
      redeemedPoints: 0,
      discountId: null,
      customerId: null
    });
    expect(quoted.items[0]).toMatchObject({ product: "p1", quantity: 1 });

    fireEvent.click(await screen.findByText("Cash"));
    fireEvent.change(screen.getByPlaceholderText("Rp 0"), { target: { value: "100000" } });
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
    fireEvent.click(confirmButton());

    await waitFor(() => expect(createOrder).toHaveBeenCalled());
    const payload = createOrder.mock.calls[0][0];
    expect(payload.cashAmount).toBe(100000);
    expect(payload.changeAmount).toBe(100);
  });

  test("a failed quote blocks payment, shows the server reason and can be retried", async () => {
    const err = new Error("422");
    err.response = {
      status: 422,
      data: { error: "PPN tax configuration is missing", code: "PPN_MISSING" }
    };
    quoteOrder.mockRejectedValueOnce(err);
    renderModal();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("PPN tax configuration is missing");
    fireEvent.click(await screen.findByText("Card"));
    expect(confirmButton()).toBeDisabled();

    quoteOrder.mockImplementation((payload) => Promise.resolve(serverQuote(payload)));
    fireEvent.click(screen.getByText("page.cashier.quote.retry"));

    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
    expect(quoteOrder).toHaveBeenCalledTimes(2);
  });

  test("changing a pricing input blocks payment until the server re-quotes it", async () => {
    quoteOrder.mockImplementation((payload) => Promise.resolve(serverQuote(payload)));
    renderModal();
    fireEvent.click(await screen.findByText("Card"));
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());

    let release;
    quoteOrder.mockImplementation(
      (payload) =>
        new Promise((resolve) => {
          release = () => resolve(serverQuote(payload, { taxAmount: 0 }));
        })
    );
    fireEvent.click(screen.getByLabelText("Gunakan Pajak"));

    await waitFor(() => expect(screen.getByTestId("checkout-quote-pending")).toBeInTheDocument());
    expect(confirmButton()).toBeDisabled();
    await waitFor(() => expect(quoteOrder.mock.calls.at(-1)[0].useTax).toBe(false));

    release();
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
  });

  test("a tier member's tier is not stacked on top of a discount the server did not apply", async () => {
    // The server applied only the explicit discount; nothing tier-related
    // may appear on screen even though the member has a tier.
    quoteOrder.mockImplementation((payload) =>
      Promise.resolve(
        serverQuote(payload, {
          subTotal: 100000,
          discountAmount: 5000,
          discountSource: "discount",
          totalPrice: 95000
        })
      )
    );
    renderModal();

    expect(await screen.findByText("Rp 95.000")).toBeInTheDocument();
    expect(screen.queryByText("page.cashier.quote.tierDiscount")).not.toBeInTheDocument();
    expect(screen.getByText("-Rp 5.000")).toBeInTheDocument();
  });
});
