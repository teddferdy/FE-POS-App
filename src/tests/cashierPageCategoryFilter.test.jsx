import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

jest.mock("react-cookie", () => ({
  useCookies: () => ({ user: { id: 1, roleType: "admin", store: "1" }, activeStore: "1" })
}));

jest.mock("@/services/product", () => ({
  getProductByOutlet: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: "p1",
          nameProduct: "Nasi Goreng",
          price: 10000,
          category: { id: "cat1", name: "Makanan" }
        },
        {
          id: "p2",
          nameProduct: "Es Teh",
          price: 5000,
          category: { id: "cat2", name: "Minuman" }
        }
      ]
    })
  )
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/tax-config", () => ({
  getAllTaxConfig: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/order", () => ({
  getCustomerTaxRate: jest.fn(() => Promise.resolve({ data: { rate: 0, serviceChargeRate: 0 } }))
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

let gridProps = null;
jest.mock("../page/cashier/components/ProductGrid", () => {
  function ProductGridMock({ products, categoryId, onCategoryChange, search, onSearchChange }) {
    gridProps = { products, categoryId, search, onSearchChange };
    return (
      <div>
        <button type="button" onClick={() => onCategoryChange("cat1")}>
          pick-cat1
        </button>
        <button type="button" onClick={() => onCategoryChange("")}>
          clear-cat
        </button>
        <button type="button" onClick={() => onSearchChange("goreng")}>
          search-goreng
        </button>
      </div>
    );
  }
  return ProductGridMock;
});
jest.mock("../page/cashier/components/OrderQueue", () => () => null);
jest.mock("../page/cashier/components/CheckoutModal", () => () => null);
jest.mock("../page/cashier/components/ReceiptModal", () => () => null);
jest.mock("../page/cashier/components/CollectPaymentModal", () => () => null);
jest.mock("../page/cashier/components/ParkedCartPanel", () => () => null);

const renderCashierPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CashierPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("CashierPage category filtering regression (F7-02)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    orderList.setState({ order: [] });
    gridProps = null;
  });

  test("selecting a category narrows the products handed to the grid to that category", async () => {
    renderCashierPage();

    await waitFor(() => expect(gridProps.products).toHaveLength(2));

    fireEvent.click(screen.getByText("pick-cat1"));
    await waitFor(() => {
      expect(gridProps.categoryId).toBe("cat1");
      expect(gridProps.products).toHaveLength(1);
      expect(gridProps.products[0].id).toBe("p1");
    });

    fireEvent.click(screen.getByText("clear-cat"));
    await waitFor(() => {
      expect(gridProps.categoryId).toBe("");
      expect(gridProps.products).toHaveLength(2);
    });
  });

  test("client-side search narrows the grid without waiting for the debounced refetch", async () => {
    renderCashierPage();

    await waitFor(() => expect(gridProps.products).toHaveLength(2));

    fireEvent.click(screen.getByText("search-goreng"));
    await waitFor(() => {
      expect(gridProps.search).toBe("goreng");
      expect(gridProps.products).toHaveLength(1);
      expect(gridProps.products[0].id).toBe("p1");
    });
  });
});
