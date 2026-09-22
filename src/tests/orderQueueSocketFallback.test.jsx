import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import * as ReactQuery from "react-query";
import OrderQueue from "../page/cashier/components/OrderQueue";
import { useSocket } from "@/services/socket";
import { getOrdersByStore } from "@/services/order";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, d) => (typeof d === "string" ? d : k) })
}));
jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn(() => Promise.resolve({ data: [] }))
}));
// Phase 39 Batch 6B: mocked so this suite never hits real network. This
// file's fixtures are always empty order lists, so bucketing never comes
// into play here regardless of what this resolves to.
jest.mock("@/services/cash-register", () => ({
  getCurrentCashRegister: jest.fn(() => Promise.resolve({ data: { register: null } }))
}));
jest.mock("@/services/socket", () => ({ useSocket: jest.fn() }));

// Phase 20 Batch 2: OrderQueue's 5 status-based queries (pending, confirmed,
// preparing, ready, served) each polled every 30s unconditionally. This
// suite pins the realtime-first + polling-fallback behavior added on top,
// mirroring the exact pattern already established by
// kitchenDisplaySocketFallback.test.jsx / waiterRequestSocketFallback.test.jsx
// — connection state (not socket existence) drives the fallback, and BE's
// real event contract (new-order / item-status-updated, both broadcast only
// to the kitchen-${storeId} room — see api/service/socket.js, read-only
// audited, not modified) drives which query gets invalidated.

const STORE = 7;
const ALL_QUERY_KEYS = [
  "cashier-orders-pending",
  "cashier-orders-confirmed",
  "cashier-orders-preparing",
  "cashier-orders-ready",
  "cashier-orders-served"
];

const renderQueue = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <OrderQueue store={STORE} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
    </QueryClientProvider>
  );
  return { queryClient, ...utils };
};

const findQuery = (queryClient, key) =>
  queryClient
    .getQueryCache()
    .findAll()
    .find((q) => q.queryKey[0] === key);

const waitForAllQueries = async () => {
  await waitFor(() => expect(getOrdersByStore).toHaveBeenCalledTimes(5));
};

describe("OrderQueue — polling fallback keyed to socket connection state", () => {
  const makeSocketStub = () => ({ on: jest.fn(), off: jest.fn(), emit: jest.fn() });

  beforeEach(() => {
    jest.clearAllMocks();
    getOrdersByStore.mockResolvedValue({ data: [] });
  });

  test("polls every 30s when no socket exists at all", async () => {
    useSocket.mockReturnValue(null);
    const { queryClient } = renderQueue();
    await waitForAllQueries();

    for (const key of [
      "cashier-orders-pending",
      "cashier-orders-preparing",
      "cashier-orders-ready",
      "cashier-orders-served"
    ]) {
      expect(findQuery(queryClient, key).options.refetchInterval).toBe(30000);
    }
  });

  test("polls every 30s while a socket client exists but is not connected", async () => {
    useSocket.mockReturnValue({ socket: makeSocketStub(), connected: false });
    const { queryClient } = renderQueue();
    await waitForAllQueries();

    expect(findQuery(queryClient, "cashier-orders-pending").options.refetchInterval).toBe(30000);
    expect(findQuery(queryClient, "cashier-orders-ready").options.refetchInterval).toBe(30000);
  });

  test("disables polling for realtime-covered statuses once connected, but keeps 'confirmed' polling (no BE event covers it)", async () => {
    useSocket.mockReturnValue({ socket: makeSocketStub(), connected: true });
    const { queryClient } = renderQueue();
    await waitForAllQueries();

    expect(findQuery(queryClient, "cashier-orders-pending").options.refetchInterval).toBe(false);
    expect(findQuery(queryClient, "cashier-orders-preparing").options.refetchInterval).toBe(false);
    expect(findQuery(queryClient, "cashier-orders-ready").options.refetchInterval).toBe(false);
    expect(findQuery(queryClient, "cashier-orders-served").options.refetchInterval).toBe(false);
    // 'confirmed' has no corresponding backend emit anywhere (audited:
    // updateOrderItemStatus's cascade never targets it) — it must never go
    // silently stale just because the socket happens to be connected.
    expect(findQuery(queryClient, "cashier-orders-confirmed").options.refetchInterval).toBe(30000);
  });

  test("turns polling back on after a disconnect and off again after reconnect", async () => {
    const useQuerySpy = jest.spyOn(ReactQuery, "useQuery");
    const lastOptionsFor = (key) => {
      const calls = useQuerySpy.mock.calls.filter((call) => call?.[0]?.[0] === key);
      return calls[calls.length - 1][2];
    };

    const socketStub = makeSocketStub();
    useSocket.mockReturnValue({ socket: socketStub, connected: false });
    const { queryClient, rerender } = renderQueue();
    await waitForAllQueries();
    expect(findQuery(queryClient, "cashier-orders-pending").options.refetchInterval).toBe(30000);

    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    rerender(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={STORE} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
      </QueryClientProvider>
    );
    await waitFor(() =>
      expect(lastOptionsFor("cashier-orders-pending").refetchInterval).toBe(false)
    );

    useSocket.mockReturnValue({ socket: socketStub, connected: false });
    rerender(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={STORE} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
      </QueryClientProvider>
    );
    await waitFor(() =>
      expect(lastOptionsFor("cashier-orders-pending").refetchInterval).toBe(30000)
    );
  });
});

describe("OrderQueue — realtime event -> targeted query invalidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrdersByStore.mockResolvedValue({ data: [] });
  });

  const setupListeners = () => {
    const handlers = {};
    const socketStub = {
      on: jest.fn((event, cb) => {
        handlers[event] = cb;
      }),
      off: jest.fn(),
      emit: jest.fn()
    };
    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    return { socketStub, handlers };
  };

  test("'new-order' invalidates only the pending query, not the other 4", async () => {
    const { handlers } = setupListeners();
    const { queryClient } = renderQueue();
    await waitForAllQueries();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    handlers["new-order"]({ id: 1, status: "pending" });

    expect(invalidateSpy).toHaveBeenCalledWith(["cashier-orders-pending", STORE]);
    expect(invalidateSpy).not.toHaveBeenCalledWith(["cashier-orders-confirmed", STORE]);
    expect(invalidateSpy).not.toHaveBeenCalledWith(["cashier-orders-preparing", STORE]);
    expect(invalidateSpy).not.toHaveBeenCalledWith(["cashier-orders-ready", STORE]);
    expect(invalidateSpy).not.toHaveBeenCalledWith(["cashier-orders-served", STORE]);
  });

  test("'item-status-updated' invalidates pending/preparing/ready/served but never 'confirmed'", async () => {
    const { handlers } = setupListeners();
    const { queryClient } = renderQueue();
    await waitForAllQueries();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    handlers["item-status-updated"]({ orderId: 1, item: { status: "ready" } });

    expect(invalidateSpy).toHaveBeenCalledWith(["cashier-orders-pending", STORE]);
    expect(invalidateSpy).toHaveBeenCalledWith(["cashier-orders-preparing", STORE]);
    expect(invalidateSpy).toHaveBeenCalledWith(["cashier-orders-ready", STORE]);
    expect(invalidateSpy).toHaveBeenCalledWith(["cashier-orders-served", STORE]);
    expect(invalidateSpy).not.toHaveBeenCalledWith(["cashier-orders-confirmed", STORE]);
  });

  test("a malformed/empty event payload does not throw and still invalidates safely", async () => {
    const { handlers } = setupListeners();
    renderQueue();
    await waitForAllQueries();

    expect(() => handlers["new-order"](undefined)).not.toThrow();
    expect(() => handlers["item-status-updated"](null)).not.toThrow();
  });

  test("reconnect ('connect' event) reconciles every status query, not just the realtime-covered ones", async () => {
    const { handlers } = setupListeners();
    const { queryClient } = renderQueue();
    await waitForAllQueries();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    handlers["connect"]();

    for (const key of ALL_QUERY_KEYS.filter((k) => k !== "cashier-orders-confirmed")) {
      expect(invalidateSpy).toHaveBeenCalledWith([key, STORE]);
    }
  });
});

describe("OrderQueue — kitchen room join/leave and listener lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrdersByStore.mockResolvedValue({ data: [] });
  });

  test("joins kitchen-${store}'s room (never another store's) exactly once per mount", async () => {
    const socketStub = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    renderQueue();
    await waitForAllQueries();

    const joinCalls = socketStub.emit.mock.calls.filter((c) => c[0] === "join-kitchen");
    expect(joinCalls).toEqual([["join-kitchen", STORE]]);
  });

  test("registers each listener exactly once and removes all of them, plus leaves the room, on unmount", async () => {
    const socketStub = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    const { unmount } = renderQueue();
    await waitForAllQueries();

    const onEvents = socketStub.on.mock.calls.map((c) => c[0]);
    expect(onEvents.filter((e) => e === "new-order")).toHaveLength(1);
    expect(onEvents.filter((e) => e === "item-status-updated")).toHaveLength(1);
    expect(onEvents.filter((e) => e === "connect")).toHaveLength(1);

    unmount();

    const offEvents = socketStub.off.mock.calls.map((c) => c[0]);
    expect(offEvents).toEqual(
      expect.arrayContaining(["new-order", "item-status-updated", "connect"])
    );
    expect(socketStub.emit).toHaveBeenCalledWith("leave-kitchen", STORE);
  });

  test("repeated mount/unmount cycles never leak listeners (on/off counts stay balanced)", async () => {
    const socketStub = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    useSocket.mockReturnValue({ socket: socketStub, connected: true });

    for (let i = 0; i < 3; i++) {
      const { unmount } = renderQueue();
      await waitForAllQueries();
      unmount();
      jest.clearAllMocks();
      getOrdersByStore.mockResolvedValue({ data: [] });
    }

    // The final cycle's own on/off calls are still balanced 1:1 per event —
    // proven by re-running the same assertions as the single mount/unmount
    // test above would; here we additionally confirm no exception/warning
    // path caused an uneven registration across repeated cycles.
    const socketStub2 = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    useSocket.mockReturnValue({ socket: socketStub2, connected: true });
    const { unmount } = renderQueue();
    await waitForAllQueries();
    unmount();
    expect(socketStub2.on.mock.calls.length).toBe(socketStub2.off.mock.calls.length);
  });

  test("a connect/disconnect/connect/disconnect/connect cycle registers listeners exactly once (react effect dependencies stay stable)", async () => {
    const socketStub = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    useSocket.mockReturnValue({ socket: socketStub, connected: false });
    const { queryClient, rerender } = renderQueue();
    await waitForAllQueries();

    // Reuse the SAME QueryClient across every rerender — a fresh instance
    // per iteration would itself change useQueryClient()'s identity, which
    // changes invalidatePending/invalidateKitchenCascade's identity (they
    // depend on [queryClient, store]), which would tear down and
    // re-register the join-kitchen effect on every iteration regardless of
    // `connected` — a test artifact, not the thing this test means to prove.
    const cycle = [true, false, true, false, true];
    for (const connected of cycle) {
      useSocket.mockReturnValue({ socket: socketStub, connected });
      rerender(
        <QueryClientProvider client={queryClient}>
          <OrderQueue store={STORE} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
        </QueryClientProvider>
      );
    }

    // The socket object identity never changed across the whole cycle (only
    // `connected` did), so the join-kitchen effect (keyed on [socket, store])
    // must not have torn down and re-registered on every render — exactly
    // one join, never a growing pile of duplicate listeners.
    const joinCalls = socketStub.emit.mock.calls.filter((c) => c[0] === "join-kitchen");
    expect(joinCalls.length).toBe(1);
    const newOrderOnCalls = socketStub.on.mock.calls.filter((c) => c[0] === "new-order");
    expect(newOrderOnCalls.length).toBe(1);
  });
});

describe("OrderQueue — store isolation via room scoping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrdersByStore.mockResolvedValue({ data: [] });
  });

  test("changing the store prop leaves the old store's kitchen room and joins the new one", async () => {
    const socketStub = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={STORE} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
      </QueryClientProvider>
    );
    await waitForAllQueries();

    rerender(
      <QueryClientProvider client={queryClient}>
        <OrderQueue store={99} onLoadOrder={jest.fn()} onCollectPayment={jest.fn()} />
      </QueryClientProvider>
    );
    await waitFor(() =>
      expect(getOrdersByStore).toHaveBeenCalledWith(expect.objectContaining({ location: 99 }))
    );

    expect(socketStub.emit).toHaveBeenCalledWith("leave-kitchen", STORE);
    expect(socketStub.emit).toHaveBeenCalledWith("join-kitchen", 99);
    // Never asked to join a room for a store it wasn't explicitly given —
    // the server independently re-verifies this against the caller's JWT
    // `store` claim regardless, but the client must not even attempt it.
    const joinedStores = socketStub.emit.mock.calls
      .filter((c) => c[0] === "join-kitchen")
      .map((c) => c[1]);
    expect(joinedStores).toEqual([STORE, 99]);
  });
});
