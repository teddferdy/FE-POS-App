import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterDetail from "../page/cash-register/CashRegisterDetail";
import { getZReport } from "@/services/cash-register";
import { getOrdersByStore } from "@/services/order";

// Batch B: /cash-register/history/detail rendered a frozen snapshot next to
// an unrelated store+date order list with no inclusion rules. It must now
// fetch the Z-report reconciliation, render the live breakdown, and badge
// every history row as included/excluded with the backend reason code.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
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
        id: 5001,
        store: 1,
        status: "closed",
        openingBalance: 200000,
        totalSales: 0,
        totalExpenses: 0,
        closingBalance: 200000,
        openedAt: "2026-09-12T10:00:00.000Z",
        closedAt: "2026-09-12T10:05:00.000Z",
        storeData: { name: "Store A" },
        userData: { fullName: "angga" }
      }
    }
  })
}));

const REPORT = {
  register: { id: 5001, openingBalance: 200000, closingBalance: 200000 },
  summary: {
    totalSales: 83250,
    totalExpenses: 15000,
    totalCashPayment: 27750,
    activeCashIn: 5000,
    activeCashOut: 2000,
    expectedCash: 235750,
    variance: -35750
  },
  expenses: [{ category: "Lainnya", amount: 15000, count: 1 }],
  reconciliation: {
    window: { openedAt: "2026-09-12T10:00:00.000Z", endAt: "2026-09-12T10:05:00.000Z" },
    sales: {
      eligible: {
        count: 2,
        total: 83250,
        orderIds: [101, 102],
        byPaymentMethod: [
          { type: "cash", orders: 1, amount: 27750 },
          { type: "qris", orders: 1, amount: 55500 }
        ]
      },
      excluded: [
        { code: "UNPAID", reason: "x", count: 1, total: 27750, orderIds: [103] },
        { code: "CANCELLED_VOID", reason: "x", count: 1, total: 27750, orderIds: [104] }
      ]
    },
    expenses: {
      includedCash: { count: 1, total: 15000, expenseIds: [201] },
      records: [
        {
          id: 201,
          amount: 15000,
          category: "Lainnya",
          createdAt: "2026-09-12T10:02:00.000Z",
          notes: "parkir",
          createdBy: 7
        }
      ],
      excluded: [{ code: "NOT_APPROVED", reason: "x", count: 1, total: 30000 }]
    },
    movements: {
      cashIn: { count: 1, total: 5000 },
      cashOut: { count: 1, total: 2000 },
      pending: { count: 0, total: 0 }
    }
  }
};

const ORDERS = [
  { id: 101, orderNumber: "ORD-101", status: "served", paymentMethod: "cash", totalPrice: 27750 },
  { id: 103, orderNumber: "ORD-103", status: "preparing", paymentMethod: "qris", totalPrice: 27750 }
];

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

describe("CashRegisterDetail reconciliation (Batch B)", () => {
  beforeEach(() => {
    getZReport.mockResolvedValue({ data: REPORT });
    getOrdersByStore.mockResolvedValue({ data: ORDERS });
  });

  test("fetches the Z-report for the register and renders the live sales total", async () => {
    renderPage();
    await waitFor(() => expect(getZReport).toHaveBeenCalledWith(5001));
    // Live eligible total (83.250), NOT the frozen snapshot (0).
    expect(await screen.findByText("Rp 83.250")).toBeInTheDocument();
  });

  test("renders the payment-method breakdown and exclusion buckets", async () => {
    renderPage();
    expect(
      await screen.findByText("page.cashRegister.detail.salesBreakdown", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText("page.cashRegister.detail.salesExcluded")).toBeInTheDocument();
    expect(screen.getByText("cash · 1x")).toBeInTheDocument();
    expect(screen.getByText("qris · 1x")).toBeInTheDocument();
    expect(screen.getByText("page.cashRegister.detail.reason.UNPAID · 1x")).toBeInTheDocument();
  });

  test("badges history rows as included or excluded with the backend reason", async () => {
    renderPage();
    expect(await screen.findByText("page.cashRegister.detail.included")).toBeInTheDocument();
    expect(screen.getByText("page.cashRegister.detail.reason.UNPAID")).toBeInTheDocument();
  });

  test("falls back to the stored snapshot when the report is unreachable", async () => {
    getZReport.mockRejectedValue(new Error("network down"));
    renderPage();
    // Snapshot aggregates still render (opening + closing both 200.000);
    // no live breakdown sections.
    const snapshotValues = await screen.findAllByText("Rp 200.000");
    expect(snapshotValues.length).toBeGreaterThanOrEqual(2);
    expect(
      screen.queryByText("page.cashRegister.detail.salesBreakdown", { exact: false })
    ).not.toBeInTheDocument();
  });
});
