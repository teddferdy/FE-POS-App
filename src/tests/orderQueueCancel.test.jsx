import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { toast } from "sonner";
import OrderQueue from "../page/cashier/components/OrderQueue";
import { getOrdersByStore, updateOrderStatus } from "../services/order";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, d) => (typeof d === "string" ? d : k) })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("../services/order", () => ({
  getOrdersByStore: jest.fn(),
  updateOrderStatus: jest.fn()
}));
jest.mock("../services/cash-register", () => ({
  getCurrentCashRegister: jest.fn(() => Promise.resolve({ data: { register: { id: 999 } } }))
}));
jest.mock("../services/socket", () => ({
  useSocket: () => ({ socket: null, connected: false })
}));

// DR-08: cancel ends an order only before payment. The queue offers cancel
// for unpaid orders with a two-tap arm (cancelling is terminal); the server
// owns the guard and anything collected is refused CANCEL_REQUIRES_VOID.

const unpaidOrder = {
  id: 61,
  orderNumber: "CUST-000061",
  status: "preparing",
  paymentStatus: "unpaid",
  source: "qr",
  tableId: 3,
  totalQuantity: 2,
  createdAt: new Date().toISOString(),
  cashRegisterId: 999,
  items: []
};

const renderQueue = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OrderQueue store={7} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} {...props} />
    </QueryClientProvider>
  );
};

const showQueue = async (order) => {
  getOrdersByStore
    .mockReset()
    .mockImplementation(({ status }) =>
      Promise.resolve({ data: status === "preparing" ? [order] : [] })
    );
  updateOrderStatus.mockReset();
  toast.success.mockReset();
  toast.error.mockReset();
  renderQueue();
  await waitFor(() => expect(screen.getByText("#00061")).toBeInTheDocument());
};

describe("OrderQueue — DR-08 cancel before payment", () => {
  test("unpaid order offers cancel with a two-tap arm and settles it", async () => {
    await showQueue(unpaidOrder);
    updateOrderStatus.mockResolvedValue({ data: { ...unpaidOrder, status: "cancelled" } });

    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.cancel"));
    // First tap only arms — no request yet.
    expect(updateOrderStatus).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByLabelText("page.cashier.orderQueue.confirmCancel")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.confirmCancel"));
    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
    expect(updateOrderStatus.mock.calls[0][0]).toMatchObject({
      id: 61,
      store: 7,
      status: "cancelled"
    });
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("page.cashier.orderQueue.cancelled")
    );
  });

  test("duplicate taps while cancelling issue a single request", async () => {
    await showQueue(unpaidOrder);
    let resolveCancel;
    updateOrderStatus.mockReturnValue(
      new Promise((resolve) => {
        resolveCancel = resolve;
      })
    );

    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.cancel"));
    const confirmBtn = await screen.findByLabelText("page.cashier.orderQueue.confirmCancel");
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    resolveCancel({ data: { ...unpaidOrder, status: "cancelled" } });
    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
  });

  test("collected payment surfaces the void path instead of a raw error", async () => {
    await showQueue(unpaidOrder);
    updateOrderStatus.mockRejectedValue({
      response: { status: 409, data: { code: "CANCEL_REQUIRES_VOID" } }
    });

    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.cancel"));
    fireEvent.click(await screen.findByLabelText("page.cashier.orderQueue.confirmCancel"));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("page.cashier.orderQueue.cancelRequiresVoid")
    );
  });

  test("paid orders offer no cancel button", async () => {
    await showQueue({ ...unpaidOrder, id: 62, paymentStatus: "paid" });
    expect(screen.queryByLabelText("page.cashier.orderQueue.cancel")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("page.cashier.orderQueue.confirmCancel")
    ).not.toBeInTheDocument();
  });

  test("partially-paid orders offer no cancel button (void path, out of queue scope)", async () => {
    await showQueue({ ...unpaidOrder, id: 63, paymentStatus: "partial" });
    expect(screen.queryByLabelText("page.cashier.orderQueue.cancel")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("page.cashier.orderQueue.confirmCancel")
    ).not.toBeInTheDocument();
  });
});
