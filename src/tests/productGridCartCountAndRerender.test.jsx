import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ProductGrid from "../page/cashier/components/ProductGrid";
import { orderList } from "../state/order-list";
import { getAllCategoryActive } from "../services/category";
import { optimizeImage } from "../utils/image";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("../services/category", () => ({
  getAllCategoryActive: jest.fn(() => Promise.resolve({ data: [] }))
}));

jest.mock("../utils/image", () => ({
  optimizeImage: jest.fn((url) => url)
}));

const products = [
  { id: 1, nameProduct: "Product A", sku: "A1", price: 10000, image: "https://cdn.test/a.png" },
  { id: 2, nameProduct: "Product B", sku: "B1", price: 20000, image: "https://cdn.test/b.png" }
];

const renderGrid = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductGrid
        products={products}
        allProducts={products}
        isLoading={false}
        search=""
        onSearchChange={jest.fn()}
        barcode=""
        onBarcodeChange={jest.fn()}
        categoryId=""
        onCategoryChange={jest.fn()}
        store="1"
      />
    </QueryClientProvider>
  );
};

describe("ProductGrid cart-count badge (F7-02)", () => {
  beforeEach(() => {
    orderList.setState({ order: [] });
    getAllCategoryActive.mockClear();
    optimizeImage.mockClear();
  });

  test("a product already in the cart shows its quantity as a badge", () => {
    orderList.setState({
      order: [
        {
          id: 1,
          cartKey: "1_",
          nameProduct: "Product A",
          price: 10000,
          count: 3,
          totalPrice: 30000
        }
      ]
    });
    renderGrid();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("a product not in the cart shows no badge", () => {
    orderList.setState({
      order: [
        {
          id: 1,
          cartKey: "1_",
          nameProduct: "Product A",
          price: 10000,
          count: 1,
          totalPrice: 10000
        }
      ]
    });
    renderGrid();
    // Product B has no cart entry — only one badge (for product A) should exist.
    expect(screen.queryAllByText("1")).toHaveLength(1);
  });

  test("the badge updates live as the cart store changes", () => {
    renderGrid();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    act(() => {
      orderList.getState().addOrder(products[0]);
      orderList.getState().addOrder(products[0]);
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("ProductGrid rendering scope on cart mutation (F7-02)", () => {
  beforeEach(() => {
    orderList.setState({ order: [] });
    getAllCategoryActive.mockClear();
    optimizeImage.mockClear();
  });

  test("adding one product to the cart does not re-render every product tile in the catalog", () => {
    renderGrid();
    const callsAfterMount = optimizeImage.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    act(() => {
      orderList.getState().addOrder(products[0]);
    });

    // Only product A's own tile should have re-rendered (and thus called
    // optimizeImage again) — product B's tile is unaffected by this
    // mutation and must not redo its image-render work.
    const callsAfterMutation = optimizeImage.mock.calls.length;
    expect(callsAfterMutation - callsAfterMount).toBe(1);
  });
});
