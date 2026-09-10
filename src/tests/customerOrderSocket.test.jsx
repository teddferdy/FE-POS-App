import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CustomerOrderManagement from "../page/customer-order";
import { useSocket } from "@/services/socket";
import { axiosInstance } from "@/services";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, d) => (typeof d === "string" ? d : k) })
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { roleType: "kasir", store: 7 }, activeStore: 7 }]
}));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));
jest.mock("@/hooks/useGlobalStoreFilter", () => ({
  useGlobalStoreFilter: () => ["all", jest.fn()]
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services", () => ({
  axiosInstance: { get: jest.fn(), put: jest.fn() }
}));
jest.mock("@/services/socket", () => ({ useSocket: jest.fn() }));

// Stub every heavy/irrelevant child UI piece — this test only cares about the
// socket wiring (join-store emission, new-order listener, cleanup), not the
// rendered cards/modals/toolbars.
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...rest }) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}));
jest.mock("@/components/ui/SearchInput", () => ({ SearchInput: () => null }));
jest.mock("@/components/ui/badge", () => ({ Badge: ({ children }) => <span>{children}</span> }));
jest.mock("@/components/ui/card", () => ({ Card: ({ children }) => <div>{children}</div> }));
jest.mock("@/components/ui/separator", () => ({ Separator: () => null }));
jest.mock("@/components/ui/skeleton", () => ({ Skeleton: () => null }));
jest.mock("@/components/ui/StoreFilter", () => () => null);
jest.mock(
  "@/components/ui/TableToolbar",
  () =>
    function TableToolbarStub({ children }) {
      return <>{children}</>;
    }
);
jest.mock("@/components/ui/NoStore", () => () => null);
jest.mock("@/components/ui/loading", () => ({ Loading: () => null }));
jest.mock("@/components/organism/modal", () => () => null);
jest.mock("@/components/ui/dialog", () => ({
  Dialog: () => null,
  DialogContent: () => null,
  DialogHeader: () => null,
  DialogFooter: () => null,
  DialogTitle: () => null,
  DialogDescription: () => null
}));
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

// Regression coverage for a bug where the staff Customer Order screen only
// refreshed on a manual button click: QR orders placed by customers were
// invisible until the cashier pressed Refresh. The backend already emits a
// store-scoped `new-order` socket event (BE api/service/socket.js emitNewOrder
// -> io.to(`store-${storeId}`).emit('new-order', order)); the screen must join
// that room and refetch the pending list when the event arrives.
describe("CustomerOrderManagement — P5-01 realtime new-order refresh", () => {
  let handlers;
  let socket;

  const makeSocket = () => {
    handlers = {};
    return {
      on: jest.fn((event, cb) => {
        handlers[event] = cb;
      }),
      off: jest.fn(),
      emit: jest.fn()
    };
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    const utils = render(
      <QueryClientProvider client={queryClient}>
        <CustomerOrderManagement />
      </QueryClientProvider>
    );
    return { queryClient, ...utils };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: { data: [] } });
    socket = makeSocket();
    useSocket.mockReturnValue({ socket });
  });

  test("registers a new-order listener and joins the store room scoped to the staff store", async () => {
    renderPage();

    await waitFor(() =>
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/order/get-orders?source=qr&status=pending&limit=100&store=7"
      )
    );

    expect(socket.emit).toHaveBeenCalledWith("join-store", 7);
    expect(socket.on).toHaveBeenCalledWith("new-order", expect.any(Function));
    // The join must be scoped to the staff's own store only.
    expect(socket.emit.mock.calls.map((c) => c[0])).not.toContain("join-store=all");
  });

  test("refetches the pending customer-order list when a new-order event arrives", async () => {
    renderPage();
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    handlers["new-order"]({ id: 999, orderNumber: "CUST-000099" });

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(2));
    expect(axiosInstance.get.mock.calls[1][0]).toBe(
      "/order/get-orders?source=qr&status=pending&limit=100&store=7"
    );
  });

  test("unsubscribes the new-order listener and leaves the store room on unmount", async () => {
    const { unmount } = renderPage();
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    const listener = handlers["new-order"];
    unmount();

    expect(socket.off).toHaveBeenCalledWith("new-order", listener);
    expect(socket.emit).toHaveBeenCalledWith("leave-store", 7);
  });

  test("does not register duplicate listeners across rerenders", async () => {
    const { queryClient, rerender } = renderPage();
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    // A plain internal rerender (state change) must not stack new listeners:
    // the effect depends only on socket + query key inputs, all unchanged.
    rerender(
      <QueryClientProvider client={queryClient}>
        <CustomerOrderManagement />
      </QueryClientProvider>
    );
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    const newOrderSubscriptions = socket.on.mock.calls.filter(([event]) => event === "new-order");
    expect(newOrderSubscriptions).toHaveLength(1);
  });

  test("keeps the manual refresh button working alongside the socket listener", async () => {
    const { getByText } = renderPage();
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    const refreshBtn = getByText("page.customerOrder.refresh");
    await waitFor(() => expect(refreshBtn).not.toBeDisabled());
    fireEvent.click(refreshBtn);
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledTimes(2));
  });

  test("falls back to manual refresh without breaking the query when no socket exists", async () => {
    useSocket.mockReturnValue({ socket: null });
    const { queryClient } = renderPage();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

    const query = queryClient
      .getQueryCache()
      .findAll()
      .find((q) => q.queryKey[0] === "customer-orders");
    expect(query.options.refetchInterval).toBeFalsy();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/order/get-orders?source=qr&status=pending&limit=100&store=7"
    );
  });
});
