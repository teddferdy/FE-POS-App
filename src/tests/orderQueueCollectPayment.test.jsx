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

const qrOrder = {
  id: 55,
  orderNumber: "CUST-000055",
  status: "preparing",
  paymentStatus: "unpaid",
  source: "qr",
  tableId: 3,
  totalQuantity: 2,
  createdAt: new Date().toISOString(),
  items: []
};

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

describe("OrderQueue — F4-01 collect-payment entry point", () => {
  beforeEach(() => {
    getOrdersByStore
      .mockReset()
      .mockImplementation(({ status }) =>
        Promise.resolve({ data: status === "preparing" ? [qrOrder] : [] })
      );
  });

  test("existing card click still loads the order into the cart (regression, unchanged)", async () => {
    const onLoadOrder = jest.fn();
    renderQueue({ onLoadOrder });

    await waitFor(() => expect(screen.getByText("#00055")).toBeInTheDocument());
    fireEvent.click(screen.getByText("#00055"));

    expect(onLoadOrder).toHaveBeenCalledWith(expect.objectContaining({ id: 55 }));
  });

  test("collect-payment button invokes onCollectPayment with the order and does not also load the cart", async () => {
    const onLoadOrder = jest.fn();
    const onCollectPayment = jest.fn();
    renderQueue({ onLoadOrder, onCollectPayment });

    await waitFor(() =>
      expect(screen.getByLabelText("page.cashier.orderQueue.collectPayment")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.collectPayment"));

    expect(onCollectPayment).toHaveBeenCalledWith(expect.objectContaining({ id: 55 }));
    expect(onLoadOrder).not.toHaveBeenCalled();
  });
});
