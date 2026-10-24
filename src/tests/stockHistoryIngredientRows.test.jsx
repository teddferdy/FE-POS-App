import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StockHistory from "../page/stock-opname/StockHistory";
import { getAllStockHistory } from "../services/stock";

// Client note 2026-10-24: a recipe sale writes one stock_history row per
// ingredient that also carries the menu product. History Stock named those
// rows after the product, so the sale looked like the menu stock going down.
// An ingredient row is named by its ingredient; the menu is the context.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => (opts?.name ? `${k}:${opts.name}` : k)
  })
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 1 } }]
}));
jest.mock("@/hooks/useGlobalStoreFilter", () => ({
  useGlobalStoreFilter: () => ["all", jest.fn()]
}));
jest.mock("@/queries/useLocations", () => ({
  useLocations: () => ({ data: undefined, isLoading: false })
}));
jest.mock("@/services/stock", () => ({
  getAllStockHistory: jest.fn()
}));
jest.mock("@/services/product", () => ({
  getAllProductTable: jest.fn(() => Promise.resolve({ data: [] }))
}));

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <StockHistory />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

test("a recipe sale row shows the ingredient, with the menu as context", async () => {
  getAllStockHistory.mockResolvedValue({
    data: [
      {
        id: 2,
        createdAt: "2026-10-24T08:00:00Z",
        product: 5,
        ingredient: 9,
        ingredientName: "Bakso Halus",
        productData: { id: 5, nameProduct: "Mie Bakso Halus" },
        referenceType: "sale",
        quantityBefore: "100.0000",
        quantityChange: "-10.0000",
        quantityAfter: "90.0000"
      },
      {
        id: 1,
        createdAt: "2026-10-24T07:00:00Z",
        product: 6,
        ingredient: null,
        ingredientName: null,
        productData: { id: 6, nameProduct: "Es Teh Botol" },
        referenceType: "sale",
        quantityBefore: "20.0000",
        quantityChange: "-1.0000",
        quantityAfter: "19.0000"
      }
    ],
    pagination: { total: 2, totalPages: 1 }
  });
  renderPage();

  expect((await screen.findAllByText("Bakso Halus")).length).toBeGreaterThan(0);
  expect(
    screen.getAllByText(/page\.stockHistory\.item\.forMenu:Mie Bakso Halus/).length
  ).toBeGreaterThan(0);
  // the menu name is never the row's own name for an ingredient row
  expect(screen.queryByText("Mie Bakso Halus")).not.toBeInTheDocument();

  expect(screen.getAllByText("Es Teh Botol").length).toBeGreaterThan(0);
  expect(screen.getAllByText("page.stockHistory.item.product").length).toBeGreaterThan(0);
});
