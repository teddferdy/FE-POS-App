import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterHistory from "../page/cash-register/CashRegisterHistory";
import CashRegisterDetail from "../page/cash-register/CashRegisterDetail";
import { getCashRegisterHistory, getZReport } from "@/services/cash-register";
import { getOrdersByStore } from "@/services/order";

// An OPEN register has no closing balance yet. History and Detail printed
// its stored placeholder as "Rp 0", which reads like a finalized closing
// balance. Same rule as XZReport: the closing balance exists only once the
// register is CLOSED.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => (opts?.count != null ? `${k}:${opts.count}` : k)
  })
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1", user: { id: 1, roleType: "admin", store: 1 } }]
}));

jest.mock("@/services/cash-register", () => ({
  getCashRegisterHistory: jest.fn(),
  closeCashRegister: jest.fn(),
  getZReport: jest.fn()
}));

jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));

jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn(() => Promise.resolve({ data: [], pagination: { total: 0 } }))
}));

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

jest.mock("@/hooks/useGlobalStoreFilter", () => ({
  useGlobalStoreFilter: () => ["all", jest.fn()]
}));

jest.mock("@/components/ui/StoreFilter", () => () => null);

let mockLocationItem;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: { item: mockLocationItem } })
}));

const OPEN_ROW = {
  id: 3,
  store: 1,
  status: "open",
  openingBalance: 200000,
  totalSales: 1110000,
  totalExpenses: 0,
  closingBalance: 0,
  openedAt: "2026-10-09T02:09:07.000Z",
  closedAt: null,
  storeData: { name: "Angga Vapestore" },
  userData: { fullName: "Super Admin" }
};

const CLOSED_ROW = {
  ...OPEN_ROW,
  id: 2,
  status: "closed",
  closingBalance: 755000,
  closedAt: "2026-10-09T10:00:00.000Z"
};

const renderWithClient = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe("CashRegisterHistory closing balance column", () => {
  beforeEach(() => {
    getCashRegisterHistory.mockResolvedValue({
      data: [OPEN_ROW, CLOSED_ROW],
      pagination: { total: 2, totalPages: 1 }
    });
  });

  test("OPEN register shows a non-final placeholder, not Rp 0", async () => {
    renderWithClient(<CashRegisterHistory />);
    const cell = await screen.findByTestId("closing-balance-3");
    expect(cell).toHaveTextContent(/^-$/);
    expect(cell).not.toHaveTextContent("Rp");
    expect(within(cell).getByTitle("page.cashRegister.history.notClosedYet")).toBeInTheDocument();
  });

  test("CLOSED register shows its finalized closing balance", async () => {
    renderWithClient(<CashRegisterHistory />);
    const cell = await screen.findByTestId("closing-balance-2");
    expect(cell).toHaveTextContent("Rp 755.000");
  });
});

describe("CashRegisterDetail closing balance", () => {
  const closingValueCell = async () => {
    const label = await screen.findByText("page.cashRegister.detail.closingBalance");
    return label.closest("tr").querySelectorAll("td")[1];
  };

  test("OPEN register shows a non-final placeholder, not Rp 0", async () => {
    mockLocationItem = OPEN_ROW;
    getZReport.mockResolvedValue({
      data: { register: { id: 3, status: "open", openingBalance: 200000, closingBalance: 0 } }
    });
    renderWithClient(<CashRegisterDetail />);
    const cell = await closingValueCell();
    expect(cell).toHaveTextContent(/^-$/);
    expect(getOrdersByStore).toBeDefined();
  });

  test("CLOSED register shows its finalized closing balance", async () => {
    mockLocationItem = CLOSED_ROW;
    getZReport.mockResolvedValue({
      data: {
        register: { id: 2, status: "closed", openingBalance: 200000, closingBalance: 755000 }
      }
    });
    renderWithClient(<CashRegisterDetail />);
    const cell = await closingValueCell();
    expect(cell).toHaveTextContent("Rp 755.000");
  });
});
