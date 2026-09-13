import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import OrderQueue from "../page/cashier/components/OrderQueue";

let mockOrdersByStatus = {
  pending: [],
  confirmed: [],
  preparing: [],
  ready: [],
  served: []
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn(({ status }) =>
    Promise.resolve({ data: mockOrdersByStatus[status] || [] })
  )
}));

if (!Element.prototype.scrollBy) Element.prototype.scrollBy = jest.fn();

const makeOrder = (n) => ({
  id: n,
  orderNumber: `XX${n}`,
  status: "confirmed",
  paymentStatus: "unpaid",
  tableId: 211,
  source: "qr",
  totalQuantity: 1,
  createdAt: "2026-09-01T00:00:00.000Z"
});

const renderQueue = (orders) => {
  mockOrdersByStatus = { pending: [], confirmed: orders, preparing: [], ready: [], served: [] };
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <OrderQueue store={1} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
    </QueryClientProvider>
  );
};

const setRailOverflow = (scrollWidth = 1600, clientWidth = 400, scrollLeft = 0) => {
  const rail = screen.getByTestId("order-queue-rail");
  Object.defineProperty(rail, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(rail, "clientWidth", { configurable: true, value: clientWidth });
  Object.defineProperty(rail, "scrollLeft", { configurable: true, value: scrollLeft });
  fireEvent.scroll(rail);
  return rail;
};

describe("OrderQueue — horizontal rail scroll affordance", () => {
  test("no overflow: chevrons present but disabled, no edge fades", async () => {
    renderQueue([makeOrder(1), makeOrder(2)]);

    await screen.findAllByText("page.cashier.orderQueue.status.confirmed");

    const left = screen.getByRole("button", { name: "page.cashier.orderQueue.scrollLeft" });
    const right = screen.getByRole("button", { name: "page.cashier.orderQueue.scrollRight" });
    expect(left).toBeDisabled();
    expect(right).toBeDisabled();
    expect(screen.queryByTestId("order-queue-fade-left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-queue-fade-right")).not.toBeInTheDocument();
  });

  test("overflow to the right: right chevron enabled + right edge fade, left stays disabled", async () => {
    renderQueue(Array.from({ length: 10 }, (_, i) => makeOrder(i + 1)));

    await screen.findAllByText("page.cashier.orderQueue.status.confirmed");
    setRailOverflow();

    const left = screen.getByRole("button", { name: "page.cashier.orderQueue.scrollLeft" });
    const right = screen.getByRole("button", { name: "page.cashier.orderQueue.scrollRight" });
    expect(left).toBeDisabled();
    expect(right).toBeEnabled();
    expect(screen.queryByTestId("order-queue-fade-left")).not.toBeInTheDocument();
    expect(screen.getByTestId("order-queue-fade-right")).toBeInTheDocument();
  });

  test("right chevron scrolls the rail forward", async () => {
    Element.prototype.scrollBy = jest.fn();

    renderQueue(Array.from({ length: 10 }, (_, i) => makeOrder(i + 1)));

    await screen.findAllByText("page.cashier.orderQueue.status.confirmed");
    setRailOverflow();

    fireEvent.click(screen.getByRole("button", { name: "page.cashier.orderQueue.scrollRight" }));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({
      left: 300,
      behavior: "smooth"
    });
  });

  test("scrolled into the middle: both chevrons enabled, both fades, left scrolls back", async () => {
    Element.prototype.scrollBy = jest.fn();

    renderQueue(Array.from({ length: 10 }, (_, i) => makeOrder(i + 1)));

    await screen.findAllByText("page.cashier.orderQueue.status.confirmed");
    setRailOverflow(1600, 400, 800);

    const left = screen.getByRole("button", { name: "page.cashier.orderQueue.scrollLeft" });
    const right = screen.getByRole("button", { name: "page.cashier.orderQueue.scrollRight" });
    expect(left).toBeEnabled();
    expect(right).toBeEnabled();
    expect(screen.getByTestId("order-queue-fade-left")).toBeInTheDocument();
    expect(screen.getByTestId("order-queue-fade-right")).toBeInTheDocument();

    fireEvent.click(left);
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({
      left: -300,
      behavior: "smooth"
    });
  });

  test("scrolled to the end: left chevron enabled, right chevron disabled", async () => {
    renderQueue(Array.from({ length: 10 }, (_, i) => makeOrder(i + 1)));

    await screen.findAllByText("page.cashier.orderQueue.status.confirmed");
    setRailOverflow(1600, 400, 1200);

    expect(
      screen.getByRole("button", { name: "page.cashier.orderQueue.scrollLeft" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "page.cashier.orderQueue.scrollRight" })
    ).toBeDisabled();
  });
});
