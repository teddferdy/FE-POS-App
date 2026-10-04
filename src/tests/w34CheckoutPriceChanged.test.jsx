import React from "react";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { createOrder } from "../services/order";
import { toast } from "sonner";

// W3-4: CheckoutModal sends the W3-2/K3 item contract through the real cart
// line mapping and handles 409 PRICE_CHANGED as an explicit cashier step.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin" } }]
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

const cartLines = (kopiPrice = 12000) => [
  {
    id: 1,
    cartKey: "1_",
    nameProduct: "Kopi",
    price: kopiPrice,
    count: 1,
    totalPrice: kopiPrice,
    priceAuthoritative: true,
    priceOverridden: false
  },
  {
    id: 2,
    cartKey: "2_Size - Large|Extra Shot",
    nameProduct: "Latte",
    variantName: "Size - Large + Extra Shot",
    price: 15000,
    count: 1,
    totalPrice: 15000,
    priceAuthoritative: true,
    priceOverridden: false,
    selectedOptions: [{ name: "Size - Large" }],
    selectedModifiers: [{ name: "Extra Shot" }]
  },
  {
    id: 3,
    cartKey: "3_",
    nameProduct: "Teh",
    price: 8000,
    count: 1,
    totalPrice: 8000,
    priceAuthoritative: true,
    priceOverridden: true
  },
  {
    id: 7,
    bundleId: 7,
    isBundle: true,
    cartKey: "bundle:7",
    nameProduct: "Paket",
    price: 50000,
    count: 1,
    totalPrice: 50000,
    priceAuthoritative: true,
    priceOverridden: false
  }
];

const priceChanged409 = (items) => ({
  response: {
    status: 409,
    data: {
      code: "PRICE_CHANGED",
      message: "One or more item prices changed. Please review the updated prices and resubmit.",
      items
    }
  }
});

const setup = ({ onComplete = jest.fn(), onApplyServerPrices = jest.fn() } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const ui = (items) => (
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={items}
        subtotal={items.reduce((sum, item) => sum + item.totalPrice, 0)}
        taxRate={0}
        store="1"
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={jest.fn()}
        onComplete={onComplete}
        onApplyServerPrices={onApplyServerPrices}
      />
    </QueryClientProvider>
  );
  const utils = render(ui(cartLines()));
  return {
    ...utils,
    rerenderWith: (items) => utils.rerender(ui(items)),
    onComplete,
    onApplyServerPrices
  };
};

const confirmButton = () => screen.getByText("page.cashier.confirmPayment").closest("button");

describe("W3-4 CheckoutModal item payload (W3-2 + K3)", () => {
  beforeEach(() => {
    createOrder.mockReset();
    toast.error.mockClear();
    createOrder.mockResolvedValue({
      data: { id: 1, totalPrice: 85000, subTotal: 85000, items: [] }
    });
  });

  test("sends expectedPrice, separate options/modifiers, the price override and bundleId", async () => {
    const { onComplete } = setup();

    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(confirmButton());

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const [kopi, latte, teh, paket] = createOrder.mock.calls[0][0].items;

    expect(kopi).toMatchObject({ product: 1, quantity: 1, expectedPrice: 12000 });
    expect(kopi).not.toHaveProperty("priceOverride");

    expect(latte).toMatchObject({
      product: 2,
      expectedPrice: 15000,
      options: [{ name: "Size - Large" }],
      modifiers: [{ name: "Extra Shot" }]
    });

    // priceOverridden used to be dropped by the checkout line mapping.
    expect(teh.priceOverride).toBe(8000);
    expect(teh).not.toHaveProperty("expectedPrice");

    expect(paket).toMatchObject({ bundleId: 7, quantity: 1, expectedPrice: 50000 });
    expect(paket).not.toHaveProperty("product");
    expect(paket).not.toHaveProperty("priceOverride");

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
});

describe("W3-4 CheckoutModal 409 PRICE_CHANGED", () => {
  beforeEach(() => {
    createOrder.mockReset();
    toast.error.mockClear();
  });

  test("shows the changed prices, blocks payment and leaves the cart untouched", async () => {
    createOrder.mockRejectedValueOnce(
      priceChanged409([{ index: 0, productId: 1, expectedPrice: 12000, currentPrice: 13000 }])
    );
    const { onApplyServerPrices, onComplete } = setup();

    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(confirmButton());

    const panel = await screen.findByTestId("price-change-panel");
    expect(panel).toHaveAttribute("role", "alert");
    expect(within(panel).getByText("page.cashier.priceChanged.title")).toBeInTheDocument();
    expect(within(panel).getByText("Kopi")).toBeInTheDocument();
    expect(within(panel).getByText("Rp 12.000")).toBeInTheDocument();
    expect(within(panel).getByText("Rp 13.000")).toBeInTheDocument();

    expect(confirmButton()).toBeDisabled();
    expect(onApplyServerPrices).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("page.cashier.priceChanged.title");

    // A blocked confirm can never resend the stale expectation.
    fireEvent.click(confirmButton());
    await act(async () => {
      await Promise.resolve();
    });
    expect(createOrder).toHaveBeenCalledTimes(1);
  });

  test("applying the server prices is an explicit step, then the retry sends the new expectedPrice", async () => {
    createOrder.mockRejectedValueOnce(
      priceChanged409([
        { index: 0, productId: 1, expectedPrice: 12000, currentPrice: 13000 },
        { index: 3, bundleId: 7, expectedPrice: 50000, currentPrice: 55000 }
      ])
    );
    createOrder.mockResolvedValueOnce({
      data: { id: 2, totalPrice: 91000, subTotal: 91000, items: [] }
    });
    const { onApplyServerPrices, onComplete, rerenderWith } = setup();

    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(confirmButton());
    await screen.findByTestId("price-change-panel");

    fireEvent.click(screen.getByText("page.cashier.priceChanged.apply"));

    expect(onApplyServerPrices).toHaveBeenCalledTimes(1);
    expect(onApplyServerPrices).toHaveBeenCalledWith([
      { cartKey: "1_", price: 13000 },
      { cartKey: "bundle:7", price: 55000 }
    ]);
    const panel = screen.getByTestId("price-change-panel");
    expect(panel).toHaveAttribute("role", "status");
    expect(within(panel).getByText("page.cashier.priceChanged.appliedTitle")).toBeInTheDocument();

    // The parent cart re-renders the modal with the applied prices.
    const updated = cartLines(13000).map((line) =>
      line.isBundle ? { ...line, price: 55000, totalPrice: 55000 } : line
    );
    rerenderWith(updated);

    expect(confirmButton()).not.toBeDisabled();
    fireEvent.click(confirmButton());

    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    const retryItems = createOrder.mock.calls[1][0].items;
    expect(retryItems[0].expectedPrice).toBe(13000);
    expect(retryItems[3]).toMatchObject({ bundleId: 7, expectedPrice: 55000 });
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(screen.queryByTestId("price-change-panel")).not.toBeInTheDocument();
  });

  test("a QRIS confirmation built from stale prices is dropped after PRICE_CHANGED", async () => {
    createOrder.mockRejectedValueOnce(
      priceChanged409([{ index: 0, productId: 1, expectedPrice: 12000, currentPrice: 13000 }])
    );
    setup();

    fireEvent.click(await screen.findByText("QRIS"));
    fireEvent.click(confirmButton());
    fireEvent.click(await screen.findByText("page.cashier.qris.confirmReceived"));

    await screen.findByTestId("price-change-panel");
    expect(screen.queryByText("page.cashier.qris.confirmReceived")).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
    expect(createOrder).toHaveBeenCalledTimes(1);
  });

  test("other 409 errors keep the existing toast and show no price panel", async () => {
    createOrder.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { message: "idempotencyKey already used with a different payload" }
      }
    });
    setup();

    fireEvent.click(await screen.findByText("Card"));
    fireEvent.click(confirmButton());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "idempotencyKey already used with a different payload"
      )
    );
    expect(screen.queryByTestId("price-change-panel")).not.toBeInTheDocument();
    expect(confirmButton()).not.toBeDisabled();
  });
});
