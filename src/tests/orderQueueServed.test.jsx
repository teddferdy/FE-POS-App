import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import OrderQueue from "../page/cashier/components/OrderQueue";
import { getOrdersByStore } from "../services/order";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, d) => (typeof d === "string" ? d : k) })
}));

jest.mock("../services/order", () => ({
  getOrdersByStore: jest.fn()
}));
jest.mock("../services/socket", () => ({
  useSocket: () => ({ socket: null, connected: false })
}));

const servedOrder = {
  id: 77,
  orderNumber: "CUST-000077",
  status: "served",
  paymentStatus: "unpaid",
  source: "qr",
  tableId: 4,
  totalQuantity: 3,
  createdAt: new Date().toISOString(),
  items: []
};

const ALL_STATUSES = ["pending", "confirmed", "preparing", "ready", "served"];

const renderQueue = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OrderQueue store={7} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} {...props} />
    </QueryClientProvider>
  );
};

describe("OrderQueue — P5-03 served order payment reachability", () => {
  beforeEach(() => {
    getOrdersByStore
      .mockReset()
      .mockImplementation(({ status }) =>
        Promise.resolve({ data: status === "served" ? [servedOrder] : [] })
      );
  });

  test("a served QR order appears in OrderQueue", async () => {
    renderQueue();

    await waitFor(() => expect(screen.getByText("#00077")).toBeInTheDocument());
    // The served card can only come from a served-scoped backend query.
    expect(getOrdersByStore).toHaveBeenCalledWith(
      expect.objectContaining({ status: "served", location: 7 })
    );
  });

  test("served order exposes Collect Payment (F4-01 flow)", async () => {
    const onCollectPayment = jest.fn();
    renderQueue({ onCollectPayment });

    await waitFor(() =>
      expect(screen.getByLabelText("page.cashier.orderQueue.collectPayment")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.collectPayment"));

    expect(onCollectPayment).toHaveBeenCalledWith(
      expect.objectContaining({ id: 77, status: "served" })
    );
  });

  test("served order renders an explicit served status, not pending/undefined", async () => {
    renderQueue();
    await waitFor(() => expect(screen.getByText("#00077")).toBeInTheDocument());

    expect(screen.getByText("Served")).toBeInTheDocument();
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });

  test("existing pending/confirmed/preparing/ready behavior is preserved", async () => {
    getOrdersByStore.mockReset().mockImplementation(({ status }) =>
      Promise.resolve({
        data: ALL_STATUSES.includes(status)
          ? [{ id: 100 + ALL_STATUSES.indexOf(status), status }]
          : []
      })
    );
    renderQueue();

    await waitFor(() => expect(screen.getAllByText(/^#/)).toHaveLength(5));
    for (const s of ALL_STATUSES) {
      expect(getOrdersByStore).toHaveBeenCalledWith(
        expect.objectContaining({ status: s, location: 7 })
      );
    }
  });
});
