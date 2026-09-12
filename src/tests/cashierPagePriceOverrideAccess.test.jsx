import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashierPage from "../page/cashier/CashierPage";
import { orderList } from "../state/order-list";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && "count" in opts) return `${k}:${opts.count}`;
      return k;
    }
  })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));

let mockCookieUser;
jest.mock("react-cookie", () => ({
  useCookies: () => ({ user: mockCookieUser, activeStore: "1" })
}));

let mockTaxRateData;
jest.mock("@/services/order", () => ({
  getCustomerTaxRate: jest.fn(() => Promise.resolve(mockTaxRateData))
}));

jest.mock("@/services/product", () => ({
  getProductByOutlet: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/tax-config", () => ({
  getAllTaxConfig: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/parked-cart", () => ({
  createParkedCart: jest.fn()
}));
jest.mock("@/utils/customerDisplayBoard", () => ({
  CART_MIRROR_KEY: "cart-mirror-test",
  DISPLAY_EVENT_TYPES: { TRANSACTION_SUCCESS: "transaction-success" },
  dispatchDisplayEvent: jest.fn()
}));
jest.mock("@/state/theme", () => ({
  useThemeStore: () => ({ toggleTheme: jest.fn() })
}));
jest.mock("@/hooks/useThemeEffect", () => ({
  useThemeEffect: jest.fn()
}));
jest.mock("@/components/layout/Sidebar", () => () => null);
jest.mock("@/components/layout/Header", () => ({
  UserDropdown: () => null,
  NotificationBell: () => null
}));

jest.mock("../page/cashier/components/ProductGrid", () => () => null);
jest.mock("../page/cashier/components/OrderQueue", () => () => null);
jest.mock("../page/cashier/components/CheckoutModal", () => () => null);
jest.mock("../page/cashier/components/ReceiptModal", () => () => null);
jest.mock("../page/cashier/components/CollectPaymentModal", () => () => null);
jest.mock("../page/cashier/components/ParkedCartPanel", () => () => null);

const renderCashierPage = (initialEntry = "/") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={queryClient}>
        <CashierPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const baseItem = {
  id: 1,
  cartKey: "1_",
  nameProduct: "Nasi Goreng",
  price: 10000,
  count: 2,
  totalPrice: 20000
};

const seedCart = () => orderList.setState({ order: [{ ...baseItem }] });

describe("CashierPage price-override authorization (F7-01)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    orderList.setState({ order: [] });
    mockTaxRateData = { data: { rate: 0, serviceChargeRate: 0 } };
  });

  const expectEditAffordance = async (visible) => {
    renderCashierPage();
    await waitFor(() => expect(screen.getAllByText("Nasi Goreng").length).toBeGreaterThan(0));
    const affordance = screen.queryAllByLabelText("Edit price");
    expect(affordance.length).toBe(visible ? 1 : 0);
  };

  test("an admin sees the price-edit affordance on a cart line", async () => {
    seedCart();
    mockCookieUser = { id: 1, roleType: "admin", store: "1" };
    await expectEditAffordance(true);
  });

  test("a super_admin sees the price-edit affordance once a store is active (implicit admin capability)", async () => {
    seedCart();
    mockCookieUser = { id: 1, roleType: "super_admin", store: "1" };
    renderCashierPage("/?store=1");
    await waitFor(() => expect(screen.getAllByText("Nasi Goreng").length).toBeGreaterThan(0));
    expect(screen.queryAllByLabelText("Edit price").length).toBe(1);
  });

  test("a kasir never sees the price-edit affordance", async () => {
    seedCart();
    mockCookieUser = { id: 1, roleType: "kasir", store: "1" };
    await expectEditAffordance(false);
  });

  test("a plain user never sees the price-edit affordance", async () => {
    seedCart();
    mockCookieUser = { id: 1, roleType: "user", store: "1" };
    await expectEditAffordance(false);
  });

  test("a missing/undefined role fails closed with no price-edit affordance", async () => {
    seedCart();
    mockCookieUser = undefined;
    await expectEditAffordance(false);
  });

  test("subtotal, tax, and grand total stay correct after an authorized price override", async () => {
    seedCart();
    mockCookieUser = { id: 1, roleType: "admin", store: "1" };
    mockTaxRateData = { data: { rate: 10, serviceChargeRate: 0 } };
    renderCashierPage();

    await waitFor(() => {
      expect(screen.getAllByText("Rp 20.000").length).toBeGreaterThan(0);
    });
    await waitFor(() => {
      expect(screen.getByText("page.cashier.tax (10%)")).toBeInTheDocument();
    });

    act(() => {
      orderList.getState().updateItemPrice(orderList.getState().order[0], 12000);
    });

    expect(screen.getAllByText("Rp 24.000").length).toBeGreaterThan(0);
    expect(screen.getByText("Rp 2.400")).toBeInTheDocument();
    expect(screen.getByText("Rp 26.400")).toBeInTheDocument();
  });
});
