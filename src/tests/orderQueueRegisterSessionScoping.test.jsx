import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import OrderQueue from "../page/cashier/components/OrderQueue";
import { getOrdersByStore } from "@/services/order";
import { getCurrentCashRegister } from "@/services/cash-register";

// Phase 39 Batch 6B: Order Queue register-session scoping. The FIVE
// existing order-fetch calls (pending/confirmed/preparing/ready/served)
// must never gain a cashRegisterId filter — the queue keeps returning
// every order regardless of which register it belongs to. The only new
// thing is FE-side classification of the already-present
// order.cashRegisterId against getCurrentCashRegister's id, purely for
// display/actionability grouping.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      if (typeof opts === "string") return opts;
      if (opts && opts.id != null) return `${k}:${opts.id}`;
      return k;
    }
  })
}));

jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn()
}));

jest.mock("@/services/cash-register", () => ({
  getCurrentCashRegister: jest.fn()
}));

jest.mock("@/services/socket", () => ({
  useSocket: () => ({ socket: null, connected: false })
}));

const CURRENT_REGISTER_ID = 11;

const makeOrder = (overrides) => ({
  id: overrides.id,
  orderNumber: `ORD${String(overrides.id).padStart(5, "0")}`,
  status: overrides.status || "preparing",
  paymentStatus: overrides.paymentStatus || "unpaid",
  source: "qr",
  tableId: 3,
  totalQuantity: 1,
  createdAt: overrides.createdAt || new Date().toISOString(),
  cashRegisterId: overrides.cashRegisterId,
  items: []
});

// One order per required fetch status so getOrdersByStore's mock can key
// off `status` and return exactly the fixture list configured for it.
const byStatus = (orders) => {
  const map = { pending: [], confirmed: [], preparing: [], ready: [], served: [] };
  orders.forEach((o) => map[o.status].push(o));
  return map;
};

const mockCurrentRegister = (id) => {
  getCurrentCashRegister.mockResolvedValue({
    data: id == null ? { register: null } : { register: { id, status: "open" } }
  });
};

const renderQueue = (props = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={7} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} {...props} />
      </QueryClientProvider>
    )
  };
};

describe("OrderQueue — Phase 39 Batch 6B register-session scoping", () => {
  beforeEach(() => {
    getOrdersByStore.mockReset();
    getCurrentCashRegister.mockReset();
  });

  // 10-20: no "Register Sebelumnya" section any more — orders of an earlier
  // register of today share the one list with the open register's orders.
  test("Case 1 — current and earlier-register orders share one list, no section headers", async () => {
    const current = makeOrder({ id: 1, status: "preparing", cashRegisterId: CURRENT_REGISTER_ID });
    const earlier = makeOrder({ id: 2, status: "ready", cashRegisterId: 5 });
    const statusMap = byStatus([current, earlier]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();

    const rail = await screen.findByTestId("order-queue-rail");
    await waitFor(() => expect(rail).toHaveTextContent("#00002"));
    expect(rail).toHaveTextContent("#00001");
    expect(screen.queryByText("page.cashier.orderQueue.previousRegister")).not.toBeInTheDocument();
    expect(screen.queryByText("page.cashier.orderQueue.currentRegister")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-queue-rail-previous")).not.toBeInTheDocument();
  });

  test("Case 2 — an earlier-register order carries no register label", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const earlier = makeOrder({ id: 2, status: "ready", cashRegisterId: 5 });
    const statusMap = byStatus([current, earlier]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();

    expect(await screen.findByText("#00002")).toBeInTheDocument();
    expect(screen.queryByText(/page.cashier.orderQueue.registerLabel/)).not.toBeInTheDocument();
  });

  test("Case 3 — an unpaid earlier-register order remains actionable", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const earlierUnpaid = makeOrder({
      id: 2,
      status: "served",
      cashRegisterId: 5,
      paymentStatus: "unpaid"
    });
    const statusMap = byStatus([current, earlierUnpaid]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);
    const onLoadOrder = jest.fn();
    const onCollectPayment = jest.fn();

    renderQueue({ onLoadOrder, onCollectPayment });
    await screen.findByText("#00002");

    fireEvent.click(screen.getByText("#00002"));
    expect(onLoadOrder).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
    const buttons = screen.getAllByLabelText("page.cashier.orderQueue.collectPayment");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => fireEvent.click(button));
    expect(onCollectPayment).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  test("Case 4 — a paid order of an earlier register today stays visible but read-only", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const earlierPaid = makeOrder({
      id: 2,
      status: "served",
      cashRegisterId: 5,
      paymentStatus: "paid"
    });
    const statusMap = byStatus([current, earlierPaid]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);
    const onLoadOrder = jest.fn();

    renderQueue({ onLoadOrder });
    await screen.findByText("#00002");
    await waitFor(() => expect(getCurrentCashRegister).toHaveBeenCalled());

    // only the open register's unpaid order offers collect payment
    expect(screen.queryAllByLabelText("page.cashier.orderQueue.collectPayment")).toHaveLength(1);
    fireEvent.click(screen.getByText("#00002"));
    expect(onLoadOrder).not.toHaveBeenCalled();
  });

  test("Case 4b — paid orders from earlier days are hidden; unpaid ones stay", async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const today = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const oldPaid = makeOrder({
      id: 2,
      status: "served",
      cashRegisterId: 5,
      paymentStatus: "paid",
      createdAt: twoDaysAgo
    });
    const oldUnpaid = makeOrder({
      id: 3,
      status: "served",
      cashRegisterId: 5,
      paymentStatus: "unpaid",
      createdAt: twoDaysAgo
    });
    const statusMap = byStatus([today, oldPaid, oldUnpaid]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();

    expect(await screen.findByText("#00003")).toBeInTheDocument();
    expect(screen.getByText("#00001")).toBeInTheDocument();
    expect(screen.queryByText("#00002")).not.toBeInTheDocument();
    expect(screen.getByText("page.cashier.orderQueue.timeAgo.days")).toBeInTheDocument();
  });

  test("Case 4c — only paid orders from earlier days: the queue is not shown at all", async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const oldPaid = makeOrder({
      id: 2,
      status: "served",
      cashRegisterId: 5,
      paymentStatus: "paid",
      createdAt: twoDaysAgo
    });
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: status === "served" ? [oldPaid] : [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    const { container } = renderQueue();

    // loaded (skeleton gone) — and nothing rendered: the old paid order is
    // filtered out, so there is no queue at all
    await waitFor(() => expect(getOrdersByStore).toHaveBeenCalledTimes(5));
    await waitFor(() => expect(container.querySelector(".animate-pulse")).toBeNull());
    expect(container.firstChild).toBeEmptyDOMElement();
    expect(screen.queryByText("#00002")).not.toBeInTheDocument();
    expect(screen.queryByText("page.cashier.orderQueue.title")).not.toBeInTheDocument();
  });

  test("Case 5 — unassigned/self-order (cashRegisterId null) appears in the Unassigned bucket", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const unassigned = makeOrder({ id: 3, status: "pending", cashRegisterId: null });
    const statusMap = byStatus([current, unassigned]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();

    expect(await screen.findByText("page.cashier.orderQueue.unassignedOrders")).toBeInTheDocument();
    expect(screen.getByTestId("order-queue-rail-unassigned")).toHaveTextContent("#00003");
  });

  test("Case 6 — null cashRegisterId is classified as unassigned, never previous-register", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const unassigned = makeOrder({ id: 3, status: "pending", cashRegisterId: null });
    const statusMap = byStatus([current, unassigned]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();
    await screen.findByTestId("order-queue-rail-unassigned");

    // No Previous Register section exists at all for this fixture.
    expect(screen.queryByTestId("order-queue-rail-previous")).not.toBeInTheDocument();
    expect(screen.queryByText("page.cashier.orderQueue.previousRegister")).not.toBeInTheDocument();
  });

  test("Case 7 — current register not yet loaded: orders are not misclassified as previous-register", async () => {
    const current = makeOrder({ id: 1, status: "preparing", cashRegisterId: CURRENT_REGISTER_ID });
    const statusMap = byStatus([current]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    // Current-register lookup never resolves during this test.
    getCurrentCashRegister.mockReturnValue(new Promise(() => {}));

    renderQueue();

    expect(await screen.findByText("#00001")).toBeInTheDocument();
    // No "Previous Register" label/rail — the order stays in the
    // single, unbucketed default rail while identity is unknown.
    expect(screen.queryByText("page.cashier.orderQueue.previousRegister")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-queue-rail-previous")).not.toBeInTheDocument();
    expect(screen.getByTestId("order-queue-rail")).toHaveTextContent("#00001");
  });

  test("Case 8 — the five existing fetch calls never receive a cashRegisterId filter", async () => {
    getOrdersByStore.mockResolvedValue({ data: [] });
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();
    await waitFor(() => expect(getOrdersByStore).toHaveBeenCalledTimes(5));

    for (const call of getOrdersByStore.mock.calls) {
      expect(call[0]).not.toHaveProperty("cashRegisterId");
    }
    const calledStatuses = getOrdersByStore.mock.calls.map((c) => c[0].status).sort();
    expect(calledStatuses).toEqual(["confirmed", "pending", "preparing", "ready", "served"]);
  });

  test("Case 9 — store change re-derives current-register identity from the new store", async () => {
    getOrdersByStore.mockResolvedValue({ data: [] });
    mockCurrentRegister(CURRENT_REGISTER_ID);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={7} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
      </QueryClientProvider>
    );
    await waitFor(() => expect(getCurrentCashRegister).toHaveBeenCalledWith(7));

    rerender(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={99} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
      </QueryClientProvider>
    );
    await waitFor(() => expect(getCurrentCashRegister).toHaveBeenCalledWith(99));
  });

  test("Case 10 — no previous/unassigned orders: renders exactly as before Batch 6B (no section headers)", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const statusMap = byStatus([current]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();

    expect(await screen.findByTestId("order-queue-rail")).toHaveTextContent("#00001");
    expect(screen.queryByText("page.cashier.orderQueue.currentRegister")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-queue-rail-previous")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-queue-rail-unassigned")).not.toBeInTheDocument();
  });

  test("Case 11 — existing current-register order actions (load + collect payment) remain intact", async () => {
    const current = makeOrder({
      id: 1,
      status: "served",
      cashRegisterId: CURRENT_REGISTER_ID,
      paymentStatus: "unpaid"
    });
    const statusMap = byStatus([current]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);
    const onLoadOrder = jest.fn();
    const onCollectPayment = jest.fn();

    renderQueue({ onLoadOrder, onCollectPayment });
    await screen.findByText("#00001");

    fireEvent.click(screen.getByLabelText("page.cashier.orderQueue.collectPayment"));
    expect(onCollectPayment).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onLoadOrder).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("#00001"));
    expect(onLoadOrder).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test("Case 13 — an empty bucket renders no section at all", async () => {
    // Only unassigned + current; previous is empty and must not render.
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const unassigned = makeOrder({ id: 3, status: "pending", cashRegisterId: null });
    const statusMap = byStatus([current, unassigned]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    mockCurrentRegister(CURRENT_REGISTER_ID);

    renderQueue();
    await screen.findByTestId("order-queue-rail-unassigned");

    expect(screen.queryByTestId("order-queue-rail-previous")).not.toBeInTheDocument();
    expect(screen.queryByText("page.cashier.orderQueue.previousRegister")).not.toBeInTheDocument();
  });

  test("Case 14 — loading skeleton behavior is unchanged by the (independent) current-register query", async () => {
    const current = makeOrder({ id: 1, cashRegisterId: CURRENT_REGISTER_ID });
    const statusMap = byStatus([current]);
    getOrdersByStore.mockImplementation(({ status }) =>
      Promise.resolve({ data: statusMap[status] || [] })
    );
    // current-register lookup never resolves — orders must still render
    // once the 5 order queries settle, not be blocked on this query too.
    getCurrentCashRegister.mockReturnValue(new Promise(() => {}));

    renderQueue();

    expect(await screen.findByText("#00001")).toBeInTheDocument();
  });
});
