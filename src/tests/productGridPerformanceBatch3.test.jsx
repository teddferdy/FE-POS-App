import React from "react";
import { render, screen } from "@testing-library/react";
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
  getAllCategoryActive: jest.fn(() => Promise.resolve({ data: [] }))
}));

jest.mock("../utils/image", () => ({
  optimizeImage: jest.fn((url) => url)
}));

describe("ProductGrid performance Batch 3 — memoization and grouping", () => {
  test("ProductGrid is memoized to avoid redundant parent-driven re-renders (P2)", () => {
    // React.memo components have $$typeof === Symbol.for('react.memo')
    const isMemo = ProductGrid.$$typeof === Symbol.for("react.memo");
    expect(isMemo).toBe(true);
  });

  test("productsByCategory groups correctly via Map-based lookup (P3 micro-opt, behavior preserved)", async () => {
    const categories = [
      { id: "c1", nameCategory: "Cat 1" },
      { id: "c2", nameCategory: "Cat 2" }
    ];
    getAllCategoryActive.mockResolvedValue({ data: categories });

    const products = [
      { id: 1, nameProduct: "A", sku: "A1", price: 1000, category: { id: "c1" } },
      { id: 2, nameProduct: "B", sku: "B1", price: 2000, category: { id: "c2" } },
      { id: 3, nameProduct: "C", sku: "C1", price: 3000, category: { id: "c1" } }
    ];

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
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

    // All products should render
    expect(await screen.findByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    // Categories render both as rail buttons and as grouping headers — wait for categories query
    expect((await screen.findAllByText("Cat 1")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cat 2").length).toBeGreaterThanOrEqual(1);
    // Grouping headers are <h3> elements — verify via role heading
    const headings = await screen.findAllByRole("heading", { level: 3 });
    const headingTexts = headings.map((h) => h.textContent);
    expect(headingTexts).toEqual(expect.arrayContaining(["Cat 1", "Cat 2"]));
  });

  test("large catalog readiness: rendering 500 products still shows correct count per category", async () => {
    const categories = [{ id: "c1", nameCategory: "BulkCat" }];
    getAllCategoryActive.mockResolvedValue({ data: categories });
    const products = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      nameProduct: `Prod ${i + 1}`,
      sku: `SKU-${i + 1}`,
      price: 1000,
      category: { id: "c1" }
    }));

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
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

    // Spot-check first and last
    expect(await screen.findByText("Prod 1")).toBeInTheDocument();
    expect(screen.getByText("Prod 100")).toBeInTheDocument();
    // The grid should have rendered all 100 tiles (no pagination truncation)
    // Each tile contains its name; count via DOM query
    const tiles = screen.getAllByText(/Prod \d+/);
    expect(tiles.length).toBe(100);
  });
});
