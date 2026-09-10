import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import * as ReactQuery from "react-query";
import KitchenDisplay from "../page/kitchen-display";
import { useSocket } from "@/services/socket";
import { getKitchenOrders } from "@/services/kitchen";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { roleType: "kasir", store: 7 }, activeStore: 7 }]
}));
jest.mock("@/hooks/useGlobalStoreFilter", () => ({
  useGlobalStoreFilter: () => ["all", jest.fn()]
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [{ id: 7 }] }))
}));
jest.mock("@/services/kitchen", () => ({
  getKitchenOrders: jest.fn(() => Promise.resolve({ data: [] })),
  updateOrderItemStatus: jest.fn()
}));
jest.mock("@/services/socket", () => ({ useSocket: jest.fn() }));

// Stub every child UI component — this test only cares about the query
// config (refetchInterval), not the rendered kitchen cards markup.
jest.mock("@/components/ui/NoStore", () => () => null);
jest.mock("@/components/ui/button", () => ({
  Button: function ButtonStub() {
    return <div />;
  }
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: function SkeletonStub() {
    return <div />;
  }
}));
jest.mock(
  "@/components/ui/StoreFilter",
  () =>
    function StoreFilterStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/organism/abort-controller",
  () =>
    function AbortControllerStub() {
      return <div />;
    }
);
jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      {
        get: () =>
          function MockIcon() {
            return null;
          }
      }
    )
);

// Mirrors waiterRequestSocketFallback.test.jsx: the kitchen screen polls as a
// fallback whenever the socket is NOT connected (realtime events only arrive
// over an established connection), so the refetchInterval must track the
// `connected` flag from useSocket — not merely whether a socket client object
// exists (it exists even while disconnected / never connected).
describe("KitchenDisplay — polling fallback keyed to socket connection state", () => {
  const socketStub = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };

  const renderWithClient = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    const utils = render(
      <QueryClientProvider client={queryClient}>
        <KitchenDisplay />
      </QueryClientProvider>
    );
    return { queryClient, ...utils };
  };

  const getKitchenQuery = (queryClient) =>
    queryClient
      .getQueryCache()
      .findAll()
      .find((q) => q.queryKey[0] === "kitchen-orders");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("polls (15000) when no socket exists at all", async () => {
    useSocket.mockReturnValue({ socket: null, connected: false });
    const { queryClient } = renderWithClient();

    await waitFor(() => expect(getKitchenOrders).toHaveBeenCalled());
    expect(getKitchenQuery(queryClient).options.refetchInterval).toBe(15000);
  });

  test("polls (15000) while a socket client exists but is not connected", async () => {
    useSocket.mockReturnValue({ socket: socketStub, connected: false });
    const { queryClient } = renderWithClient();

    await waitFor(() => expect(getKitchenOrders).toHaveBeenCalled());
    expect(getKitchenQuery(queryClient).options.refetchInterval).toBe(15000);
  });

  test("disables polling once the socket is connected (relies on socket events)", async () => {
    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    const { queryClient } = renderWithClient();

    await waitFor(() => expect(getKitchenOrders).toHaveBeenCalled());
    expect(getKitchenQuery(queryClient).options.refetchInterval).toBe(false);
  });

  test("turns polling back on after a disconnect and off again after reconnect", async () => {
    const useQuerySpy = jest.spyOn(ReactQuery, "useQuery");
    const lastKitchenOptions = () => {
      const calls = useQuerySpy.mock.calls.filter((call) => call?.[0]?.[0] === "kitchen-orders");
      return calls[calls.length - 1][2];
    };

    useSocket.mockReturnValue({ socket: socketStub, connected: false });
    const { queryClient, rerender } = renderWithClient();

    await waitFor(() => expect(getKitchenOrders).toHaveBeenCalled());
    expect(getKitchenQuery(queryClient).options.refetchInterval).toBe(15000);

    useSocket.mockReturnValue({ socket: socketStub, connected: true });
    rerender(
      <QueryClientProvider client={queryClient}>
        <KitchenDisplay />
      </QueryClientProvider>
    );
    await waitFor(() => expect(lastKitchenOptions().refetchInterval).toBe(false));

    useSocket.mockReturnValue({ socket: socketStub, connected: false });
    rerender(
      <QueryClientProvider client={queryClient}>
        <KitchenDisplay />
      </QueryClientProvider>
    );
    await waitFor(() => expect(lastKitchenOptions().refetchInterval).toBe(15000));
  });
});
