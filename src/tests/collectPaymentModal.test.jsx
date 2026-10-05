import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CollectPaymentModal from "../page/cashier/components/CollectPaymentModal";
import { getOrderById, updateOrderStatus, createOrder } from "../services/order";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 9, fullName: "Kasir Uji", roleType: "admin" } }]
}));

jest.mock("../services/order", () => ({
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
  createOrder: jest.fn(),
  getOrdersByStore: jest.fn()
}));

// DR-04 P2-1: the modal imports the member service for points settlement
// (covered in collectPaymentModalPoints.test.jsx); never hit the network here.
jest.mock("../services/member", () => ({
  getMemberById: jest.fn()
}));

// ReceiptModal (with its existing, already-tested split-bill UI — see
// receiptModalSplitBill.test.jsx) is owned and rendered by the parent
// (CashierPage), exactly like the normal checkout-complete flow. This
// component's own responsibility ends at handing the parent a receipt-shaped
// payload via onOpenReceipt — so these tests assert that handoff rather than
// re-rendering/re-testing ReceiptModal itself.

const qrOrder = {
  id: 123,
  orderNumber: "CUST-00000123",
  source: "qr",
  store: 7,
  tableId: 10,
  customerId: 55,
  discountId: 7,
  promoCode: "ABC",
  splitCount: 3,
  paymentStatus: "unpaid",
  status: "served",
  totalPrice: 150000,
  items: [{ id: 1, productName: "Nasi Goreng", quantity: 2, price: 25000, totalPrice: 50000 }]
};

const renderModal = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CollectPaymentModal
        order={qrOrder}
        store={7}
        onClose={jest.fn()}
        onOpenReceipt={jest.fn()}
        {...props}
      />
    </QueryClientProvider>
  );
};

describe("CollectPaymentModal — F4-01 QR order settlement", () => {
  beforeEach(() => {
    getOrderById.mockReset().mockResolvedValue({ data: qrOrder });
    updateOrderStatus.mockReset();
    createOrder.mockReset();
  });

  test("F4-01-01: full payment targets the existing order id", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    renderModal();

    await waitFor(() =>
      expect(screen.getByText("page.cashier.collectPayment.payFull")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() =>
      expect(updateOrderStatus).toHaveBeenCalledWith(
        expect.objectContaining({ id: 123, status: "paid" })
      )
    );
  });

  test("F4-01-02: settling a QR order never calls order/create", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    renderModal();

    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalled());
    expect(createOrder).not.toHaveBeenCalled();
  });

  test("F4-01-03: full payment success refreshes the existing order and hands it to the receipt view", async () => {
    const paidOrder = { ...qrOrder, status: "paid", paymentStatus: "paid" };
    updateOrderStatus.mockResolvedValue({ data: paidOrder });
    getOrderById.mockReset();
    getOrderById
      .mockResolvedValueOnce({ data: qrOrder })
      .mockResolvedValueOnce({ data: paidOrder });
    const onOpenReceipt = jest.fn();
    const onClose = jest.fn();
    renderModal({ onOpenReceipt, onClose });

    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() =>
      expect(onOpenReceipt).toHaveBeenCalledWith(expect.objectContaining({ id: 123 }))
    );
    expect(onClose).toHaveBeenCalled();
    expect(getOrderById).toHaveBeenCalledTimes(2);
  });

  test("F4-01-04: split payment hands the SAME existing order id to the split-bill flow, without creating a new order", async () => {
    const onOpenReceipt = jest.fn();
    renderModal({ onOpenReceipt });

    await waitFor(() => screen.getByText("page.cashier.collectPayment.splitBill"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.splitBill"));

    await waitFor(() =>
      expect(onOpenReceipt).toHaveBeenCalledWith(expect.objectContaining({ id: 123 }))
    );
    expect(updateOrderStatus).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });

  test("F4-01-05: the settlement path never reconstructs a new order payload from cart-shaped fields", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    renderModal();

    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalled());
    const payload = updateOrderStatus.mock.calls[0][0];
    // Settlement operates on the existing order id/store only — it must not
    // carry cart-shaped fields (items/customerId/discountId/promoCode) the
    // way a POST /order/create payload would.
    expect(payload).not.toHaveProperty("items");
    expect(payload).not.toHaveProperty("customerId");
    expect(payload).not.toHaveProperty("discountId");
    expect(payload).not.toHaveProperty("promoCode");
    expect(createOrder).not.toHaveBeenCalled();
  });

  test("F4-01-06: settlement failure keeps the order retryable and shows no false success", async () => {
    updateOrderStatus.mockRejectedValue({ response: { data: { message: "Network error" } } });
    const onOpenReceipt = jest.fn();
    const onClose = jest.fn();
    renderModal({ onOpenReceipt, onClose });

    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
    expect(onOpenReceipt).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByText("page.cashier.collectPayment.confirm")).not.toBeDisabled()
    );
  });

  test("F4-01-07: duplicate submission is prevented while a payment request is in flight", async () => {
    let resolvePay;
    updateOrderStatus.mockReturnValue(
      new Promise((resolve) => {
        resolvePay = resolve;
      })
    );
    renderModal();

    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    const confirmBtn = screen.getByText("page.cashier.collectPayment.confirm");
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    resolvePay({ data: { ...qrOrder, status: "paid", paymentStatus: "paid" } });
    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
  });

  test("F4-01-08: an already-paid order cannot be paid again", async () => {
    getOrderById.mockReset().mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    renderModal();

    await waitFor(() =>
      expect(screen.getByText("page.cashier.collectPayment.alreadyPaid")).toBeInTheDocument()
    );
    expect(screen.queryByText("page.cashier.collectPayment.payFull")).not.toBeInTheDocument();
    expect(screen.queryByText("page.cashier.collectPayment.splitBill")).not.toBeInTheDocument();
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });
});

describe("CollectPaymentModal — accessible dialog semantics (F9-04)", () => {
  beforeEach(() => {
    getOrderById.mockReset().mockResolvedValue({ data: qrOrder });
    updateOrderStatus.mockReset();
    createOrder.mockReset();
  });

  test("renders as a properly-labelled dialog", async () => {
    renderModal();
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("page.cashier.collectPayment.title");
  });

  test("Escape closes the modal the same way its own close button already does", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await screen.findByRole("dialog");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  test("the existing close button still works", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    const dialog = await screen.findByRole("dialog");

    // The header's own close button renders before any payment-action
    // buttons in DOM order.
    fireEvent.click(within(dialog).getAllByRole("button")[0]);

    expect(onClose).toHaveBeenCalled();
  });
});

describe("CollectPaymentModal — DR-04 settlement tender", () => {
  beforeEach(() => {
    getOrderById.mockReset().mockResolvedValue({ data: qrOrder });
    updateOrderStatus.mockReset();
    createOrder.mockReset();
  });

  const openConfirm = async () => {
    renderModal();
    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    await waitFor(() => screen.getByText("page.cashier.collectPayment.confirm"));
  };

  test("DR04-01: default cash exact-tender sends the method with no cash fields", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    await openConfirm();
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalled());
    const payload = updateOrderStatus.mock.calls[0][0];
    expect(payload.paymentMethod).toBe("cash");
    expect(payload).not.toHaveProperty("cashAmount");
    expect(payload).not.toHaveProperty("changeAmount");
  });

  test("DR04-02: typed cash sends actual tender values and the receipt reflects them", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    const onOpenReceipt = jest.fn();
    renderModal({ onOpenReceipt });
    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));

    fireEvent.change(screen.getByPlaceholderText("150000"), {
      target: { value: "200000" }
    });
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalled());
    const payload = updateOrderStatus.mock.calls[0][0];
    expect(payload).toMatchObject({
      paymentMethod: "cash",
      cashAmount: 200000,
      changeAmount: 50000
    });
    await waitFor(() => expect(onOpenReceipt).toHaveBeenCalled());
    const receipt = onOpenReceipt.mock.calls[0][0];
    expect(receipt.paymentMethod).toBe("cash");
    expect(receipt.cashAmount).toBe(200000);
    expect(receipt.changeAmount).toBe(50000);
  });

  test("DR04-03: non-cash sends the method with no fake cash fields", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    const onOpenReceipt = jest.fn();
    renderModal({ onOpenReceipt });
    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "qris" } });
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalled());
    const payload = updateOrderStatus.mock.calls[0][0];
    expect(payload.paymentMethod).toBe("qris");
    expect(payload).not.toHaveProperty("cashAmount");
    expect(payload).not.toHaveProperty("changeAmount");
    await waitFor(() => expect(onOpenReceipt).toHaveBeenCalled());
    const receipt = onOpenReceipt.mock.calls[0][0];
    expect(receipt.paymentMethod).toBe("qris");
    expect(receipt.cashAmount).toBeNull();
  });

  test("DR04-04: a QR order's stated intent is preselected as the method", async () => {
    getOrderById.mockReset().mockResolvedValue({
      data: { ...qrOrder, paymentMethod: "qris" }
    });
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    await openConfirm();
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalled());
    expect(updateOrderStatus.mock.calls[0][0].paymentMethod).toBe("qris");
  });

  test("DR04-05: a rejected tender (422) presents no false reconciliation", async () => {
    updateOrderStatus.mockRejectedValue({
      response: { data: { message: "No open cash register for this store" } }
    });
    const onOpenReceipt = jest.fn();
    const onClose = jest.fn();
    renderModal({ onOpenReceipt, onClose });
    await waitFor(() => screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.payFull"));
    fireEvent.click(screen.getByText("page.cashier.collectPayment.confirm"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
    expect(onOpenReceipt).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("DR04-06: cash that cannot cover the bill blocks confirmation", async () => {
    updateOrderStatus.mockResolvedValue({
      data: { ...qrOrder, status: "paid", paymentStatus: "paid" }
    });
    await openConfirm();

    fireEvent.change(screen.getByPlaceholderText("150000"), {
      target: { value: "100000" }
    });
    expect(screen.getByText("page.cashier.collectPayment.confirm")).toBeDisabled();
    expect(updateOrderStatus).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("150000"), {
      target: { value: "150000" }
    });
    expect(screen.getByText("page.cashier.collectPayment.confirm")).not.toBeDisabled();
  });
});
