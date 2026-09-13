import React, { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ProductGrid from "../page/cashier/components/ProductGrid";
import { getAllCategoryActive } from "../services/category";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("../services/category", () => ({
  getAllCategoryActive: jest.fn()
}));

const categories = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  nameCategory: `Kategori ${i + 1}`
}));

const products = [{ id: 1, nameProduct: "Product A", sku: "SKU-001", price: 10000, stock: 5 }];

const Harness = () => {
  const [categoryId, setCategoryId] = useState("");
  return (
    <ProductGrid
      products={products}
      allProducts={products}
      refocusSignal={0}
      isLoading={false}
      search=""
      onSearchChange={jest.fn()}
      barcode=""
      onBarcodeChange={jest.fn()}
      categoryId={categoryId}
      onCategoryChange={setCategoryId}
      store="1"
    />
  );
};

const renderGrid = () => {
  getAllCategoryActive.mockResolvedValue({ data: categories });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
};

const setRailOverflow = (scrollWidth = 2400, clientWidth = 600, scrollLeft = 0) => {
  const rail = screen.getByTestId("product-category-rail");
  Object.defineProperty(rail, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(rail, "clientWidth", { configurable: true, value: clientWidth });
  Object.defineProperty(rail, "scrollLeft", { configurable: true, value: scrollLeft });
  fireEvent.scroll(rail);
};

describe("ProductGrid — category rail scroll affordance", () => {
  test("category strip renders inside the rail with both chevrons", async () => {
    renderGrid();

    await screen.findByText("page.cashier.allCategories");
    expect(screen.getByTestId("product-category-rail")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "page.cashier.scrollLeft" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "page.cashier.scrollRight" })).toBeDisabled();
  });

  test("overflow enables the right chevron and shows the right fade", async () => {
    renderGrid();

    await screen.findByText("page.cashier.allCategories");
    setRailOverflow();

    expect(screen.getByRole("button", { name: "page.cashier.scrollRight" })).toBeEnabled();
    expect(screen.getByTestId("product-category-fade-right")).toBeInTheDocument();
  });

  test("category selection still filters via onCategoryChange", async () => {
    getAllCategoryActive.mockResolvedValue({ data: categories });
    const onCategoryChange = jest.fn();
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <ProductGrid
          products={products}
          allProducts={products}
          refocusSignal={0}
          isLoading={false}
          search=""
          onSearchChange={jest.fn()}
          barcode=""
          onBarcodeChange={jest.fn()}
          categoryId=""
          onCategoryChange={onCategoryChange}
          store="1"
        />
      </QueryClientProvider>
    );

    const rail = await screen.findByTestId("product-category-rail");
    const all = within(rail).getByText("page.cashier.allCategories");
    fireEvent.click(all);
    expect(onCategoryChange).toHaveBeenCalledWith("");

    fireEvent.click(within(rail).getByText("Kategori 3"));
    expect(onCategoryChange).toHaveBeenCalledWith(3);
  });
});
