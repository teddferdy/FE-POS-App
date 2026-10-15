/* global require */ // jest.isolateModules loads fresh module instances
import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder, quoteOrder, getOrderById } from "../services/order";
import { toast } from "sonner";
import { serverQuote } from "./helpers/checkoutQuote";
import {
  checkoutAttempts,
  classifyCreateError,
  parseExistingOrder
} from "../state/checkout-attempt";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "cashier" } }]
}));
jest.mock("../services/order", () => ({
  quoteOrder: jest.fn(),
  createOrder: jest.fn(),
  getOrderById: jest.fn()
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

// DR-23 §K (BA §35.10) — the counter-sale attempt (idempotency key + the
// exact payload sent) outlives the checkout modal; an unresolved attempt
// blocks a new sale; a recorded sale is recovered, never re-sold.

const STORE = "1";
const kopi = (price = 100000, count = 1) => ({
  id: "p1",
  cartKey: "p1_",
  nameProduct: "Kopi",
  price,
  count,
  totalPrice: price * count,
  priceAuthoritative: true,
  priceOverridden: false
});

const confirmButton = () => screen.getByText("page.cashier.confirmPayment").closest("button");
const attemptPanel = () => screen.queryByTestId("checkout-attempt-panel");
const storedAttempt = () => checkoutAttempts.getState().attempts[STORE];
const networkError = () => new Error("Network Error"); // no response: outcome unknown

const renderModal = ({ items = [kopi()], onComplete = jest.fn() } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const ui = (lines) => (
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={lines}
        store={STORE}
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={jest.fn()}
        onComplete={onComplete}
        onApplyServerPrices={jest.fn()}
      />
    </QueryClientProvider>
  );
  const utils = render(ui(items));
  return { ...utils, onComplete, rerenderWith: (lines) => utils.rerender(ui(lines)) };
};

// Card sale, paid against a current quote.
const payByCard = async () => {
  fireEvent.click(await screen.findByText("Card"));
  await waitFor(() => expect(confirmButton()).not.toBeDisabled());
  fireEvent.click(confirmButton());
};

const createdOrder = (id = 7) => ({
  data: { id, orderNumber: `ORD-${id}`, totalPrice: 100000, subTotal: 100000, items: [] }
});

beforeEach(() => {
  sessionStorage.clear();
  checkoutAttempts.setState({ attempts: {} });
  jest.clearAllMocks();
  quoteOrder.mockImplementation((payload) => Promise.resolve(serverQuote(payload)));
});

describe("checkout attempt lifecycle", () => {
  test("an ambiguous failure survives closing and reopening: same key, same payload, no new sale", async () => {
    createOrder.mockRejectedValueOnce(networkError());
    const first = renderModal();
    await payByCard();
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const sent = createOrder.mock.calls[0][0];
    await waitFor(() => expect(storedAttempt().status).toBe("unknown"));
    expect(storedAttempt().key).toBe(sent.idempotencyKey);

    first.unmount(); // the cashier closes the checkout

    createOrder.mockResolvedValueOnce(createdOrder());
    const reopened = renderModal();
    const panel = await screen.findByTestId("checkout-attempt-panel");
    expect(panel).toHaveAttribute("data-attempt-status", "unknown");
    expect(confirmButton()).toBeDisabled();

    fireEvent.click(screen.getByText("page.cashier.attempt.retrySame"));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    expect(createOrder.mock.calls[1][0]).toEqual(sent);
    await waitFor(() => expect(reopened.onComplete).toHaveBeenCalledTimes(1));
    // resolved: what remains is a fresh draft for the NEXT sale
    await waitFor(() => expect(storedAttempt()?.key).not.toBe(sent.idempotencyKey));
    expect(storedAttempt()).toMatchObject({ status: "draft", payload: null });
  });

  test("editing the cart while an attempt is unresolved cannot change what is resent", async () => {
    createOrder.mockRejectedValueOnce(networkError());
    const { rerenderWith } = renderModal();
    await payByCard();
    await screen.findByTestId("checkout-attempt-panel");
    const sent = createOrder.mock.calls[0][0];

    rerenderWith([kopi(100000, 3)]); // cart edited: 3 coffees
    expect(confirmButton()).toBeDisabled();
    createOrder.mockResolvedValueOnce(createdOrder());
    fireEvent.click(screen.getByText("page.cashier.attempt.retrySame"));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    expect(createOrder.mock.calls[1][0]).toEqual(sent);
    expect(createOrder.mock.calls[1][0].items[0].quantity).toBe(1);
  });

  test("a 5xx is treated as an unknown outcome too", async () => {
    createOrder.mockRejectedValueOnce({
      response: { status: 500, data: { code: "INTERNAL_ERROR" } }
    });
    renderModal();
    await payByCard();
    await waitFor(() => expect(storedAttempt().status).toBe("unknown"));
    expect(toast.error).toHaveBeenCalledWith("page.cashier.attempt.unknownToast");
  });

  test("a resolved sale is not the same logical sale: the next sale gets a new key", async () => {
    createOrder.mockResolvedValueOnce(createdOrder(1));
    const first = renderModal();
    await payByCard();
    await waitFor(() => expect(first.onComplete).toHaveBeenCalledTimes(1));
    const firstKey = createOrder.mock.calls[0][0].idempotencyKey;
    first.unmount();

    createOrder.mockResolvedValueOnce(createdOrder(2));
    renderModal();
    await payByCard();
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    expect(createOrder.mock.calls[1][0].idempotencyKey).not.toBe(firstKey);
  });

  test("a sale that completes after the modal closed is still handed to the receipt once", async () => {
    let finish;
    createOrder.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const first = renderModal();
    await payByCard();
    await waitFor(() => expect(storedAttempt().status).toBe("in_flight"));
    const key = storedAttempt().key;
    first.unmount();
    await act(async () => finish(createdOrder(9)));
    await waitFor(() => expect(first.onComplete).toHaveBeenCalledTimes(1));
    expect(first.onComplete.mock.calls[0][0]).toMatchObject({ id: 9 });
    expect(storedAttempt()?.key).not.toBe(key);
    expect(createOrder).toHaveBeenCalledTimes(1);
  });

  test("a recorded-but-not-yet-shown sale is recovered on reopen, not re-sold", async () => {
    checkoutAttempts.setState({
      attempts: {
        [STORE]: {
          key: "k-recorded",
          status: "recorded",
          payload: { idempotencyKey: "k-recorded" },
          existingOrder: { id: 9, orderNumber: "ORD-9", totalPrice: 100000, paymentStatus: "paid" }
        }
      }
    });
    getOrderById.mockResolvedValueOnce({
      data: {
        id: 9,
        orderNumber: "ORD-9",
        totalPrice: 100000,
        subTotal: 100000,
        paymentMethod: "CARD",
        items: []
      }
    });
    const reopened = renderModal();
    expect(await screen.findByTestId("checkout-attempt-order")).toHaveTextContent("ORD-9");
    expect(confirmButton()).toBeDisabled();
    fireEvent.click(screen.getByText("page.cashier.attempt.openRecorded"));
    await waitFor(() => expect(reopened.onComplete).toHaveBeenCalledTimes(1));
    expect(getOrderById).toHaveBeenCalledWith(9);
    expect(createOrder).not.toHaveBeenCalled();
  });
});

describe("409 IDEMPOTENCY_MISMATCH recovery", () => {
  const mismatch = (existingOrder) => ({
    response: {
      status: 409,
      data: {
        message: "idempotencyKey already used with a different payload",
        code: "IDEMPOTENCY_MISMATCH",
        fields: ["paymentMethod"],
        ...(existingOrder === undefined ? {} : { existingOrder })
      }
    }
  });

  test("a valid existingOrder is recovered through its receipt; no fresh sale is created", async () => {
    createOrder.mockRejectedValueOnce(
      mismatch({ id: 812, orderNumber: "ORD-812", totalPrice: 100000, paymentStatus: "paid" })
    );
    getOrderById.mockResolvedValueOnce({
      data: {
        id: 812,
        orderNumber: "ORD-812",
        totalPrice: 100000,
        subTotal: 100000,
        paymentMethod: "CASH",
        items: [{ productName: "Kopi", quantity: 1, price: 100000 }]
      }
    });
    const { onComplete } = renderModal();
    await payByCard();

    expect(await screen.findByTestId("checkout-attempt-order")).toHaveTextContent("ORD-812");
    expect(attemptPanel()).toHaveAttribute("data-attempt-status", "conflict");
    expect(toast.error).toHaveBeenCalledWith("page.cashier.attempt.conflictToast");
    expect(confirmButton()).toBeDisabled();
    expect(screen.queryByText("page.cashier.attempt.discard")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("page.cashier.attempt.openRecorded"));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const receipt = onComplete.mock.calls[0][0];
    expect(receipt).toMatchObject({ id: 812, total: 100000, tenderDetailUnknown: true });
    expect(receipt.cashAmount).toBeNull();
    expect(createOrder).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(storedAttempt()?.status).toBe("draft"));
  });

  test.each([
    ["missing", undefined],
    ["malformed", { orderNumber: "no id" }]
  ])(
    "a %s existingOrder keeps the sale blocked until an explicit, two-step decision",
    async (_l, existing) => {
      createOrder.mockRejectedValueOnce(mismatch(existing));
      renderModal();
      await payByCard();
      await waitFor(() =>
        expect(attemptPanel()).toHaveAttribute("data-attempt-status", "conflict")
      );
      const conflictKey = storedAttempt().key;
      expect(screen.queryByText("page.cashier.attempt.openRecorded")).not.toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();

      fireEvent.click(screen.getByText("page.cashier.attempt.discard"));
      expect(storedAttempt().status).toBe("conflict"); // first click only asks to confirm
      fireEvent.click(screen.getByText("page.cashier.attempt.discardConfirm"));
      await waitFor(() => expect(attemptPanel()).not.toBeInTheDocument());
      await waitFor(() => expect(storedAttempt()?.key).toBeTruthy());
      expect(storedAttempt().key).not.toBe(conflictKey);
      expect(createOrder).toHaveBeenCalledTimes(1);
    }
  );
});

describe("expectedTotal and TOTAL_CHANGED", () => {
  test("expectedTotal is the server quote's totalPrice", async () => {
    quoteOrder.mockImplementation((payload) =>
      Promise.resolve(serverQuote(payload, { taxRate: 11, taxAmount: 11000, totalPrice: 111000 }))
    );
    createOrder.mockResolvedValueOnce(createdOrder());
    renderModal();
    await payByCard();
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    expect(createOrder.mock.calls[0][0].expectedTotal).toBe(111000);
  });

  test("TOTAL_CHANGED re-quotes, keeps the attempt open for a corrected payment, and is not a conflict", async () => {
    createOrder.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { code: "TOTAL_CHANGED", expectedTotal: 100000, totalPrice: 120000 }
      }
    });
    renderModal();
    await payByCard();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("page.cashier.attempt.totalChanged")
    );
    const quotesBefore = quoteOrder.mock.calls.length;
    await waitFor(() => expect(quoteOrder.mock.calls.length).toBeGreaterThan(quotesBefore - 1));
    expect(attemptPanel()).not.toBeInTheDocument();
    expect(storedAttempt().status).toBe("draft");
    // the server's new total is quoted; the cashier pays again under the same key
    quoteOrder.mockImplementation((payload) =>
      Promise.resolve(serverQuote(payload, { totalPrice: 120000 }))
    );
    createOrder.mockResolvedValueOnce(createdOrder());
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
    fireEvent.click(confirmButton());
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    expect(createOrder.mock.calls[1][0].idempotencyKey).toBe(
      createOrder.mock.calls[0][0].idempotencyKey
    );
  });
});

describe("classifyCreateError / parseExistingOrder", () => {
  test.each([
    ["no response", new Error("x"), "unknown"],
    ["503", { response: { status: 503, data: {} } }, "unknown"],
    ["401", { response: { status: 401, data: {} } }, "auth"],
    ["403", { response: { status: 403, data: { code: "FORBIDDEN" } } }, "auth"],
    ["TOTAL_CHANGED", { response: { status: 409, data: { code: "TOTAL_CHANGED" } } }, "refused"],
    ["PRICE_CHANGED", { response: { status: 409, data: { code: "PRICE_CHANGED" } } }, "refused"],
    ["code-less 409", { response: { status: 409, data: { message: "x" } } }, "unconfirmed"],
    [
      "unknown-code 409",
      { response: { status: 409, data: { code: "SOMETHING_NEW" } } },
      "unconfirmed"
    ],
    [
      "INGREDIENT_STOCK_CONFLICT",
      { response: { status: 409, data: { code: "INGREDIENT_STOCK_CONFLICT" } } },
      "refused"
    ],
    [
      "IDEMPOTENCY_MISMATCH",
      { response: { status: 409, data: { code: "IDEMPOTENCY_MISMATCH" } } },
      "conflict"
    ],
    ["422", { response: { status: 422, data: { code: "REGISTER_REQUIRED" } } }, "refused"],
    ["400 stock", { response: { status: 400, data: { code: "INSUFFICIENT_STOCK" } } }, "refused"]
  ])("%s → %s", (_l, err, kind) => {
    expect(classifyCreateError(err).kind).toBe(kind);
  });

  test("existingOrder needs an id", () => {
    expect(parseExistingOrder({ id: 5, orderNumber: "A", totalPrice: "100" })).toEqual({
      id: 5,
      orderNumber: "A",
      totalPrice: 100,
      paymentStatus: null
    });
    expect(parseExistingOrder({ orderNumber: "A" })).toBeNull();
    expect(parseExistingOrder({ id: -1 })).toBeNull();
    expect(parseExistingOrder(null)).toBeNull();
  });

  test("a 401 while retrying an unknown attempt keeps it unknown", async () => {
    createOrder.mockRejectedValueOnce(networkError());
    renderModal();
    await payByCard();
    await waitFor(() => expect(storedAttempt().status).toBe("unknown"));
    createOrder.mockRejectedValueOnce({ response: { status: 401, data: {} } });
    fireEvent.click(screen.getByText("page.cashier.attempt.retrySame"));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(storedAttempt().status).toBe("unknown"));
  });

  test("a reload while a request was in flight rehydrates as unknown", async () => {
    sessionStorage.setItem(
      "checkout-attempt",
      JSON.stringify({
        state: {
          attempts: {
            [STORE]: { key: "k-1", status: "in_flight", payload: { a: 1 }, existingOrder: null }
          }
        },
        version: 0
      })
    );
    await checkoutAttempts.persist.rehydrate();
    expect(storedAttempt()).toMatchObject({ key: "k-1", status: "unknown", payload: { a: 1 } });
  });

  test("rehydrate with empty storage preserves the in-memory attempt", async () => {
    const live = {
      key: "k-live",
      status: "unknown",
      reason: "network",
      payload: { idempotencyKey: "k-live" },
      existingOrder: null
    };
    checkoutAttempts.setState({ attempts: { [STORE]: live } });
    sessionStorage.removeItem("checkout-attempt");
    await checkoutAttempts.persist.rehydrate();
    expect(storedAttempt()).toMatchObject({ key: "k-live", status: "unknown" });
    expect(storedAttempt().payload).toEqual({ idempotencyKey: "k-live" });
  });
});

describe("409 responses that are not an idempotency mismatch", () => {
  test("INGREDIENT_STOCK_CONFLICT is a definitive refusal: no recovery panel, the cashier can correct and pay", async () => {
    createOrder.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          error: 'Stok bahan baku "Gula" tidak mencukupi. Tersedia: 2, dibutuhkan: 5',
          code: "INGREDIENT_STOCK_CONFLICT"
        }
      }
    });
    renderModal();
    await payByCard();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Stok bahan baku "Gula" tidak mencukupi. Tersedia: 2, dibutuhkan: 5'
      )
    );
    expect(attemptPanel()).not.toBeInTheDocument();
    expect(storedAttempt()).toMatchObject({ status: "draft", payload: null });
    expect(toast.error).not.toHaveBeenCalledWith("page.cashier.attempt.conflictToast");
    await waitFor(() => expect(confirmButton()).not.toBeDisabled());
  });

  test.each([
    ["an unknown code", { code: "SOMETHING_NEW", error: "Konflik baru" }, "Konflik baru"],
    [
      "no code",
      { message: "idempotencyKey already used with a different payload" },
      "idempotencyKey already used with a different payload"
    ]
  ])(
    "a 409 with %s is shown neutrally, never as a recorded sale, and keeps the attempt",
    async (_l, data, message) => {
      createOrder.mockRejectedValueOnce({ response: { status: 409, data } });
      renderModal();
      await payByCard();
      await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
      const sent = createOrder.mock.calls[0][0];

      const panel = await screen.findByTestId("checkout-attempt-panel");
      expect(panel).toHaveAttribute("data-attempt-status", "unknown");
      expect(screen.getByText("page.cashier.attempt.unconfirmedTitle")).toBeInTheDocument();
      expect(screen.getByTestId("checkout-attempt-server-message")).toHaveTextContent(message);
      expect(screen.queryByText("page.cashier.attempt.recordedTitle")).not.toBeInTheDocument();
      expect(screen.queryByText("page.cashier.attempt.conflictTitle")).not.toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("page.cashier.attempt.unconfirmedToast");
      expect(confirmButton()).toBeDisabled();
      expect(storedAttempt()).toMatchObject({
        status: "unknown",
        reason: "unconfirmed",
        key: sent.idempotencyKey,
        payload: sent
      });

      createOrder.mockResolvedValueOnce(createdOrder());
      fireEvent.click(screen.getByText("page.cashier.attempt.retrySame"));
      await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
      expect(createOrder.mock.calls[1][0]).toEqual(sent);
    }
  );
});

describe("fresh page load with a persisted in_flight attempt (synchronous hydration)", () => {
  const PERSISTED_PAYLOAD = {
    store: STORE,
    idempotencyKey: "k-reload",
    paymentMethod: "card",
    source: "pos",
    expectedTotal: 100000,
    items: [{ product: "p1", quantity: 1, expectedPrice: 100000 }]
  };

  const seedInFlight = () => {
    sessionStorage.setItem(
      "checkout-attempt",
      JSON.stringify({
        state: {
          attempts: {
            [STORE]: {
              key: "k-reload",
              status: "in_flight",
              payload: PERSISTED_PAYLOAD,
              existingOrder: null
            }
          }
        },
        version: 0
      })
    );
  };

  test("the store hydrates it as unknown with the original key and payload", () => {
    seedInFlight();
    let fresh;
    jest.isolateModules(() => {
      fresh = require("../state/checkout-attempt").checkoutAttempts;
    });
    expect(fresh.getState().attempts[STORE]).toMatchObject({
      key: "k-reload",
      status: "unknown",
      payload: PERSISTED_PAYLOAD
    });
  });

  test("the reloaded checkout offers the same-sale retry, which resends the original key and payload", async () => {
    seedInFlight();
    let mod;
    jest.isolateModules(() => {
      mod = {
        React: require("react"),
        // /pure: no auto-registered cleanup hooks inside a test
        rtl: require("@testing-library/react/pure"),
        rq: require("react-query"),
        CheckoutModal: require("../page/cashier/components/CheckoutModal").default,
        order: require("../services/order"),
        attempts: require("../state/checkout-attempt").checkoutAttempts
      };
    });
    const { React: R, rtl, rq, CheckoutModal: FreshModal, order, attempts } = mod;
    order.quoteOrder.mockImplementation((payload) => Promise.resolve(serverQuote(payload)));
    order.createOrder.mockResolvedValueOnce(createdOrder());
    const onComplete = jest.fn();
    rtl.render(
      R.createElement(
        rq.QueryClientProvider,
        { client: new rq.QueryClient({ defaultOptions: { queries: { retry: false } } }) },
        R.createElement(FreshModal, {
          items: [kopi()],
          store: STORE,
          cashierName: "Kasir",
          cashierId: 1,
          onClose: jest.fn(),
          onTableChange: jest.fn(),
          onComplete,
          onApplyServerPrices: jest.fn()
        })
      )
    );
    try {
      const panel = await rtl.screen.findByTestId("checkout-attempt-panel");
      expect(panel).toHaveAttribute("data-attempt-status", "unknown");
      expect(rtl.screen.getByText("page.cashier.attempt.unknownTitle")).toBeInTheDocument();
      expect(rtl.screen.getByText("page.cashier.confirmPayment").closest("button")).toBeDisabled();

      rtl.fireEvent.click(rtl.screen.getByText("page.cashier.attempt.retrySame"));
      await rtl.waitFor(() => expect(order.createOrder).toHaveBeenCalledTimes(1));
      expect(order.createOrder.mock.calls[0][0]).toEqual(PERSISTED_PAYLOAD);
      await rtl.waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expect(attempts.getState().attempts[STORE]?.key).not.toBe("k-reload");
    } finally {
      rtl.cleanup();
    }
  });

  test("an in_flight attempt whose request is still running in this page stays non-retryable", async () => {
    let finish;
    createOrder.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const first = renderModal();
    await payByCard();
    await waitFor(() => expect(storedAttempt().status).toBe("in_flight"));
    first.unmount(); // the request keeps running

    renderModal(); // reopened while it runs
    const panel = await screen.findByTestId("checkout-attempt-panel");
    expect(panel).toHaveAttribute("data-attempt-status", "in_flight");
    expect(screen.queryByText("page.cashier.attempt.retrySame")).not.toBeInTheDocument();
    await act(async () => finish(createdOrder(11)));
    expect(createOrder).toHaveBeenCalledTimes(1);
  });
});
