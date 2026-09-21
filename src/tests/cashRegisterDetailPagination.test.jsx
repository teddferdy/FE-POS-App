import React from "react";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterDetail from "../page/cash-register/CashRegisterDetail";
import { getZReport } from "@/services/cash-register";
import { getOrdersByStore } from "@/services/order";

// Phase 39 Batch 6A: Register Detail hardcoded `limit: 100` with no page
// state on both the in-window and outside-window transaction lists, even
// though the backend already returns an accurate pagination.total/totalPages
// — a register session with more than 100 transactions silently hid the
// rest. These tests cover the pagination fix and guard the Finding #3 badge
// (pagination.total, never orders.length) against regressing now that
// `orders`/`outsideOrders` are routinely a partial page again.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => (opts?.count != null ? `${k}:${opts.count}` : k)
  })
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1" }]
}));

jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn()
}));

jest.mock("@/services/cash-register", () => ({
  getZReport: jest.fn()
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    state: {
      item: {
        id: 7001,
        store: 1,
        status: "closed",
        openingBalance: 100000,
        totalSales: 0,
        totalExpenses: 0,
        closingBalance: 100000,
        openedAt: "2026-09-12T10:00:00.000Z",
        closedAt: "2026-09-12T12:00:00.000Z",
        storeData: { name: "Store A" },
        userData: { fullName: "angga" }
      }
    }
  })
}));

const buildOrders = (start, count) =>
  Array.from({ length: count }, (_, i) => ({
    id: start + i,
    orderNumber: `ORD-${start + i}`,
    status: "served",
    paymentMethod: "cash",
    totalPrice: 1000,
    createdAt: "2026-09-12T10:02:00.000Z"
  }));

const emptyOutside = { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 1 } };

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CashRegisterDetail />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("CashRegisterDetail transaction-history pagination (Batch 6A)", () => {
  beforeEach(() => {
    getZReport.mockResolvedValue({ data: null });
  });

  test("Test 1 — requests the transaction API with page, limit, cashRegisterId, and window", async () => {
    getOrdersByStore.mockImplementation((payload) =>
      payload?.window === "outside"
        ? Promise.resolve(emptyOutside)
        : Promise.resolve({
            data: buildOrders(1, 50),
            pagination: { total: 150, page: 1, limit: 50, totalPages: 3 }
          })
    );
    renderPage();
    await waitFor(() =>
      expect(getOrdersByStore).toHaveBeenCalledWith({
        location: 1,
        cashRegisterId: 7001,
        page: 1,
        limit: 50
      })
    );
    expect(getOrdersByStore).toHaveBeenCalledWith({
      location: 1,
      cashRegisterId: 7001,
      window: "outside",
      page: 1,
      limit: 50
    });
  });

  test("Test 2 — first page renders its rows, the total badge, and visible pagination", async () => {
    getOrdersByStore.mockImplementation((payload) =>
      payload?.window === "outside"
        ? Promise.resolve(emptyOutside)
        : Promise.resolve({
            data: buildOrders(1, 50),
            pagination: { total: 150, page: 1, limit: 50, totalPages: 3 }
          })
    );
    renderPage();
    expect(await screen.findByText("ORD-1")).toBeInTheDocument();
    expect(screen.getByText("ORD-50")).toBeInTheDocument();
    expect(screen.getByText("page.cashRegister.detail.transactionCount:150")).toBeInTheDocument();
    // Row-number cells also render plain digits, so scope to the
    // pagination <nav> (role="navigation") to find the page-number links.
    const nav = await screen.findByRole("navigation", { name: "pagination" });
    expect(within(nav).getByText("2")).toBeInTheDocument();
    expect(within(nav).getByText("3")).toBeInTheDocument();
  });

  test("Test 3 — navigating to page 2 requests page=2, renders page-2 rows, keeps the same total", async () => {
    getOrdersByStore.mockImplementation((payload) => {
      if (payload?.window === "outside") return Promise.resolve(emptyOutside);
      const page = payload?.page || 1;
      const start = (page - 1) * 50 + 1;
      return Promise.resolve({
        data: buildOrders(start, 50),
        pagination: { total: 150, page, limit: 50, totalPages: 3 }
      });
    });
    renderPage();
    expect(await screen.findByText("ORD-1")).toBeInTheDocument();

    const nav = await screen.findByRole("navigation", { name: "pagination" });
    fireEvent.click(within(nav).getByText("2"));

    await waitFor(() =>
      expect(getOrdersByStore).toHaveBeenCalledWith({
        location: 1,
        cashRegisterId: 7001,
        page: 2,
        limit: 50
      })
    );
    expect(await screen.findByText("ORD-51")).toBeInTheDocument();
    expect(screen.queryByText("ORD-1")).not.toBeInTheDocument();
    expect(screen.getByText("page.cashRegister.detail.transactionCount:150")).toBeInTheDocument();
  });

  test("Test 4 — the last page is reachable and renders its rows", async () => {
    getOrdersByStore.mockImplementation((payload) => {
      if (payload?.window === "outside") return Promise.resolve(emptyOutside);
      const page = payload?.page || 1;
      const start = (page - 1) * 50 + 1;
      return Promise.resolve({
        data: buildOrders(start, 50),
        pagination: { total: 150, page, limit: 50, totalPages: 3 }
      });
    });
    renderPage();
    await screen.findByText("ORD-1");

    const nav = await screen.findByRole("navigation", { name: "pagination" });
    fireEvent.click(within(nav).getByText("3"));

    await waitFor(() =>
      expect(getOrdersByStore).toHaveBeenCalledWith({
        location: 1,
        cashRegisterId: 7001,
        page: 3,
        limit: 50
      })
    );
    expect(await screen.findByText("ORD-101")).toBeInTheDocument();
    expect(await screen.findByText("ORD-150")).toBeInTheDocument();
  });

  test("Test 5 — a one-page result does not render pagination controls", async () => {
    getOrdersByStore.mockImplementation((payload) =>
      payload?.window === "outside"
        ? Promise.resolve(emptyOutside)
        : Promise.resolve({
            data: buildOrders(1, 10),
            pagination: { total: 10, page: 1, limit: 50, totalPages: 1 }
          })
    );
    renderPage();
    await screen.findByText("ORD-1");
    expect(screen.queryByLabelText("Go to next page")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Go to previous page")).not.toBeInTheDocument();
  });

  test("Test 6 — in-window and outside-window pagination state are independent", async () => {
    getOrdersByStore.mockImplementation((payload) => {
      const page = payload?.page || 1;
      const start = (page - 1) * 50 + 1;
      if (payload?.window === "outside") {
        return Promise.resolve({
          data: buildOrders(9000 + start, 50),
          pagination: { total: 120, page, limit: 50, totalPages: 3 }
        });
      }
      return Promise.resolve({
        data: buildOrders(start, 50),
        pagination: { total: 150, page, limit: 50, totalPages: 3 }
      });
    });
    renderPage();
    await screen.findByText("ORD-1");
    expect(await screen.findByText("ORD-9001")).toBeInTheDocument();

    // Both lists show 3-page pagination, each with its own <nav> — the
    // in-window section is rendered first in the DOM, so its nav is first.
    const navs = await screen.findAllByRole("navigation", { name: "pagination" });
    expect(navs).toHaveLength(2);
    fireEvent.click(within(navs[0]).getByText("2"));

    await waitFor(() =>
      expect(getOrdersByStore).toHaveBeenCalledWith({
        location: 1,
        cashRegisterId: 7001,
        page: 2,
        limit: 50
      })
    );
    expect(await screen.findByText("ORD-51")).toBeInTheDocument();

    // The outside-window list must never have been requested at page 2 as
    // a side effect of paging the in-window list.
    const outsideCalls = getOrdersByStore.mock.calls.filter((c) => c[0]?.window === "outside");
    expect(outsideCalls.every((c) => c[0].page === 1)).toBe(true);
    expect(screen.getByText("ORD-9001")).toBeInTheDocument();
  });

  test("Test 7 — the total badge uses pagination.total, not the current page's row count (Finding #3 regression)", async () => {
    getOrdersByStore.mockImplementation((payload) =>
      payload?.window === "outside"
        ? Promise.resolve(emptyOutside)
        : Promise.resolve({
            data: buildOrders(1, 50),
            pagination: { total: 150, page: 1, limit: 50, totalPages: 3 }
          })
    );
    renderPage();
    expect(
      await screen.findByText("page.cashRegister.detail.transactionCount:150")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("page.cashRegister.detail.transactionCount:50")
    ).not.toBeInTheDocument();
  });
});
