import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StockHistory from "../page/stock-opname/StockHistory";
import { getAllStockHistory } from "../services/stock";

// Client note 2026-10-24: a recipe sale writes one stock_history row per
// ingredient that also carries the menu product. History Stock named those
// rows after the product, so the sale looked like the menu stock going down.
// An ingredient row is named by its ingredient; the menu is the context.
// Ingredients and finished products sit on separate tabs, ingredients first.
// Every row names its store, in the first column, which stays pinned left.

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
jest.mock("@/services/ingredient", () => ({
  getAllIngredients: jest.fn(() => Promise.resolve({ data: [{ id: 9, name: "Bakso Halus" }] }))
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

const RECIPE_ROW = {
  id: 2,
  createdAt: "2026-10-24T08:00:00Z",
  product: 5,
  ingredient: 9,
  ingredientName: "Bakso Halus",
  productData: { id: 5, nameProduct: "Mie Bakso Halus" },
  referenceType: "sale",
  quantityBefore: "100.0000",
  quantityChange: "-10.0000",
  quantityAfter: "90.0000",
  unit: "butir",
  store: 1,
  storeData: { id: 1, name: "Bakso ABC" }
};
const PRODUCT_ROW = {
  id: 1,
  createdAt: "2026-10-24T07:00:00Z",
  product: 6,
  ingredient: null,
  ingredientName: null,
  productData: { id: 6, nameProduct: "Es Teh Botol" },
  referenceType: "sale",
  quantityBefore: "20.0000",
  quantityChange: "-1.0000",
  quantityAfter: "19.0000",
  unit: "pcs",
  store: 1,
  storeData: { id: 1, name: "Bakso ABC" }
};

beforeEach(() => {
  jest.clearAllMocks();
  getAllStockHistory.mockImplementation(({ itemType }) =>
    Promise.resolve({
      data: itemType === "product" ? [PRODUCT_ROW] : [RECIPE_ROW],
      pagination: { total: 1, totalPages: 1 }
    })
  );
});

test("opens on the ingredient tab; a recipe sale row shows the ingredient with its menu", async () => {
  renderPage();

  expect((await screen.findAllByText("Bakso Halus")).length).toBeGreaterThan(0);
  expect(getAllStockHistory).toHaveBeenCalledWith(
    expect.objectContaining({ itemType: "ingredient", product: undefined })
  );
  expect(
    screen.getAllByText(/page\.stockHistory\.item\.forMenu:Mie Bakso Halus/).length
  ).toBeGreaterThan(0);
  // the menu name is never the row's own name for an ingredient row
  expect(screen.queryByText("Mie Bakso Halus")).not.toBeInTheDocument();
  expect(screen.getAllByText("butir").length).toBeGreaterThan(0);
  expect(screen.getAllByText("page.stockHistory.table.ingredient").length).toBeGreaterThan(0);
});

test("the product tab lists finished-product rows only", async () => {
  renderPage();
  await screen.findAllByText("Bakso Halus");

  fireEvent.mouseDown(screen.getByRole("tab", { name: "page.stockHistory.tab.product" }));

  await waitFor(() =>
    expect(getAllStockHistory).toHaveBeenLastCalledWith(
      expect.objectContaining({ itemType: "product", ingredient: undefined })
    )
  );
  expect((await screen.findAllByText("Es Teh Botol")).length).toBeGreaterThan(0);
  expect(screen.queryByText("Bakso Halus")).not.toBeInTheDocument();
  expect(screen.getAllByText("page.stockHistory.table.product").length).toBeGreaterThan(0);
});

test("the store is the first column and stays pinned left", async () => {
  renderPage();
  await screen.findAllByText("Bakso Halus");

  const header = screen
    .getAllByText("page.stockHistory.table.store")
    .map((el) => el.closest("th"))
    .find(Boolean);
  expect(header).toHaveClass("sticky", "left-0");
  expect(header.parentElement.firstElementChild).toBe(header);

  const cell = screen
    .getAllByText("Bakso ABC")
    .map((el) => el.closest("td"))
    .find(Boolean);
  expect(cell).toHaveClass("sticky", "left-0");
  expect(cell.parentElement.firstElementChild).toBe(cell);
});
