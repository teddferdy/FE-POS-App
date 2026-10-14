import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder, quoteOrder } from "../services/order";
import { toast } from "sonner";
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

const renderModal = ({ items, onApplyServerPrices, onComplete } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const ui = (lines) => (
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={
          lines || [
            {
              id: "p1",
              cartKey: "p1_",
              nameProduct: "Kopi",
              price: 100000,
              count: 1,
              totalPrice: 100000,
              priceAuthoritative: true,
              priceOverridden: false
            }
          ]
        }
        store="1"
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={jest.fn()}
        onComplete={onComplete || jest.fn()}
        onApplyServerPrices={onApplyServerPrices}
      />
    </QueryClientProvider>
  );
  const utils = render(ui(items));
  return { ...utils, rerenderWith: (lines) => utils.rerender(ui(lines)) };
};

// W3-2 409 body, as returned by both POST /order/quote and /order/create.
const priceChanged409 = (items) => {
  const err = new Error("409");
  err.response = {
    status: 409,
    data: {
      code: "PRICE_CHANGED",
      message: "One or more item prices changed. Please review the updated prices and resubmit.",
      items
    }
  };
  return err;
};

beforeEach(() => {
  quoteOrder.mockReset();
  createOrder.mockReset();
  toast.error.mockClear();
  toast.success.mockClear();
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

// P1 hotfix: POST /order/quote enforces the same W3-2 409 PRICE_CHANGED
// contract as /order/create. A generic retry would resend the same stale
// expectedPrice lines and fail again, so the quote-stage mismatch is routed
// into the existing apply-updated-prices flow and payment stays blocked
// until a fresh quote matches the displayed total.
describe("CheckoutModal — quote-stage PRICE_CHANGED", () => {
  test("routes the mismatch into the apply flow; payment waits for a fresh matching quote", async () => {
    quoteOrder.mockRejectedValueOnce(
      priceChanged409([{ index: 0, productId: "p1", expectedPrice: 100000, currentPrice: 110000 }])
    );
    const onApplyServerPrices = jest.fn();
    const { rerenderWith } = renderModal({ onApplyServerPrices });

    const panel = await screen.findByTestId("price-change-panel");
    expect(panel).toHaveAttribute("role", "alert");
    expect(within(panel).getByText("page.cashier.priceChanged.title")).toBeInTheDocument();
    expect(within(panel).getByText("Kopi")).toBeInTheDocument();
    expect(within(panel).getByText("Rp 100.000")).toBeInTheDocument();
    expect(within(panel).getByText("Rp 110.000")).toBeInTheDocument();

    // payment blocked, nothing applied, and no blind retry that would
    // resend the same stale prices in a loop.
    expect(confirmButton()).toBeDisabled();
    expect(onApplyServerPrices).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("page.cashier.priceChanged.title");
    expect(screen.queryByText("page.cashier.quote.retry")).not.toBeInTheDocument();
    expect(quoteOrder).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("page.cashier.priceChanged.apply"));
    expect(onApplyServerPrices).toHaveBeenCalledTimes(1);
    expect(onApplyServerPrices).toHaveBeenCalledWith([{ cartKey: "p1_", price: 110000 }]);
    expect(screen.getByTestId("price-change-panel")).toHaveAttribute("role", "status");

    // the parent applies the server prices; the new inputs are re-quoted
    // and only the fresh matching total can be paid.
    quoteOrder.mockImplementation((payload) => Promise.resolve(serverQuote(payload)));
    rerenderWith([
      {
        id: "p1",
        cartKey: "p1_",
        nameProduct: "Kopi",
        price: 110000,
        count: 1,
        totalPrice: 110000,
        priceAuthoritative: true,
        priceOverridden: false
      }
    ]);

    expect(await screen.findByText("Rp 110.000")).toBeInTheDocument();
    fireEvent.click(await screen.findByText("Card"));
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
    fireEvent.click(confirmButton());

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    expect(createOrder.mock.calls[0][0].items[0].expectedPrice).toBe(110000);
  });

  test("a 409 without the PRICE_CHANGED contract keeps the generic failure path", async () => {
    const err = new Error("409");
    err.response = {
      status: 409,
      data: { message: "idempotencyKey already used with a different payload" }
    };
    quoteOrder.mockRejectedValueOnce(err);
    renderModal();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("idempotencyKey already used with a different payload");
    expect(screen.queryByTestId("price-change-panel")).not.toBeInTheDocument();
    expect(screen.getByText("page.cashier.quote.retry")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalledWith("page.cashier.priceChanged.title");
    expect(confirmButton()).toBeDisabled();

    fireEvent.click(await screen.findByText("Card"));
    expect(confirmButton()).toBeDisabled();
    quoteOrder.mockImplementation((payload) => Promise.resolve(serverQuote(payload)));
    fireEvent.click(screen.getByText("page.cashier.quote.retry"));
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
  });

  test("an identical quote PRICE_CHANGED is surfaced once, with no refetch loop", async () => {
    quoteOrder.mockRejectedValue(
      priceChanged409([{ index: 0, productId: "p1", expectedPrice: 100000, currentPrice: 110000 }])
    );
    renderModal();
    await screen.findByTestId("price-change-panel");

    // further interaction re-renders without new inputs: no re-toast,
    // no refetch, still exactly one panel.
    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(await screen.findByText("Cash"));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("page.cashier.priceChanged.title");
    expect(quoteOrder).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId("price-change-panel")).toHaveLength(1);
    expect(confirmButton()).toBeDisabled();
  });
});
