import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import WaiterRequestList from "../page/waiterRequest/WaiterRequestList";
import { useSocket } from "@/services/socket";
import { getWaiterRequestList } from "@/services/waiterRequest";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { roleType: "kasir", store: 7 }, activeStore: 7 }]
}));
jest.mock("@/hooks/useGlobalStoreFilter", () => ({
  useGlobalStoreFilter: () => ["all", jest.fn()]
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/waiterRequest", () => ({
  getWaiterRequestList: jest.fn(() =>
    Promise.resolve({ data: [], pagination: { total: 0, totalPages: 1 } })
  ),
  updateWaiterRequestStatus: jest.fn()
}));
jest.mock("@/services/socket", () => ({ useSocket: jest.fn() }));

// Stub every child UI component — this test only cares about the query
// config (refetchInterval), not the rendered table/toolbar/modal markup.
jest.mock(
  "@/components/ui/DataTable",
  () =>
    function DataTableStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/ui/StatCard",
  () =>
    function StatCardStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/ui/PageHeader",
  () =>
    function PageHeaderStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/ui/TableToolbar",
  () =>
    function TableToolbarStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/ui/StoreFilter",
  () =>
    function StoreFilterStub() {
      return <div />;
    }
);
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub() {
    return <div />;
  }
}));
jest.mock(
  "@/components/organism/modal",
  () =>
    function ModalStub() {
      return null;
    }
);
jest.mock(
  "@/components/organism/abort-controller",
  () =>
    function AbortControllerStub({ children }) {
      return <>{children}</>;
    }
);

// Regression coverage for a bug where, on a deployment where sockets are
// disabled entirely (useSocket returns socket: null), this screen had zero
// refresh mechanism at all — refetchOnWindowFocus/refetchOnReconnect are
// off globally and no refetchInterval compensated, so new/changed waiter
// requests never appeared without a manual page reload. Reverting the
// `pollFallback` wiring would make the first assertion below fail (the
// query would have no refetchInterval when there's no socket).
describe("WaiterRequestList — polling fallback when no socket is available", () => {
  const renderWithClient = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    render(
      <QueryClientProvider client={queryClient}>
        <WaiterRequestList />
      </QueryClientProvider>
    );
    return queryClient;
  };

  test("sets a refetchInterval on the main list query when no socket exists", async () => {
    useSocket.mockReturnValue({ socket: null });
    const queryClient = renderWithClient();

    await waitFor(() => expect(getWaiterRequestList).toHaveBeenCalled());

    const query = queryClient
      .getQueryCache()
      .findAll()
      .find((q) => q.queryKey[0] === "waiter-request-list");
    expect(query.options.refetchInterval).toBe(15000);
  });

  test("disables refetchInterval (relies on socket events) when a live socket exists", async () => {
    useSocket.mockReturnValue({ socket: { on: jest.fn(), off: jest.fn(), emit: jest.fn() } });
    const queryClient = renderWithClient();

    await waitFor(() => expect(getWaiterRequestList).toHaveBeenCalled());

    const query = queryClient
      .getQueryCache()
      .findAll()
      .find((q) => q.queryKey[0] === "waiter-request-list");
    expect(query.options.refetchInterval).toBe(false);
  });
});
