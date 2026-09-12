import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import EditProduct from "../page/product/EditProduct";
import { getProductById, editProduct } from "../services/product";
import { getProductPriceByStore, updateProductPriceByStore } from "../services/price-store";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("id=1"), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "super_admin", store: "1" } }]
}));

const seededProduct = {
  id: 1,
  nameProduct: "Kopi",
  category: 5,
  price: 20000,
  costPrice: 10000,
  stock: 10,
  minStock: 0,
  unit: "pcs",
  baseUnit: "pcs",
  conversionFactor: 1,
  status: "active",
  isAvailable: true,
  isOption: false,
  hasModifiers: false,
  store: ["1"],
  images: [],
  image: null,
  composition: [],
  options: [],
  modifiers: [],
  priceTiers: []
};

jest.mock("@/services/product", () => ({
  getProductById: jest.fn(),
  editProduct: jest.fn(),
  getIngredients: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/category", () => ({
  getAllCategoryActive: jest.fn(() => Promise.resolve({ data: [{ id: 5, name: "Drinks" }] }))
}));
jest.mock("@/services/tax-config", () => ({
  getAllTaxConfig: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() =>
    Promise.resolve({
      data: [
        { id: 1, name: "Toko A" },
        { id: 2, name: "Toko B" }
      ]
    })
  )
}));
jest.mock("@/services/price-store", () => ({
  getProductPriceByStore: jest.fn(),
  updateProductPriceByStore: jest.fn()
}));
jest.mock("@/services/stock", () => ({
  checkStockOpnameExists: jest.fn(() => Promise.resolve({ data: { exists: true } }))
}));
jest.mock(
  "@/components/organism/UserGuide",
  () =>
    function UserGuideStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/organism/abort-controller",
  () =>
    function AbortControllerStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/organism/StoreSelectCard",
  () =>
    function StoreSelectCardStub() {
      return <div />;
    }
);
jest.mock(
  "../page/product/ProductPreview",
  () =>
    function ProductPreviewStub() {
      return null;
    }
);
jest.mock(
  "@/components/organism/ProductImageGallery",
  () =>
    function ProductImageGalleryStub() {
      return <div />;
    }
);

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  render(
    <QueryClientProvider client={queryClient}>
      <EditProduct />
    </QueryClientProvider>
  );
  return queryClient;
};

// Regression coverage for Phase 9 P1 finding F9-25. The main "Save" button
// sent only the general product payload — the per-store price section edits
// live in local state and went to the backend only via each row's own Save
// button — so a user editing a store price and then saving the product saw
// that store price silently discarded. Reverting the guard in handleSave
// makes this test fail (editProduct is called and no warning appears).
describe("EditProduct — store prices are not silently lost on main save (F9-25)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getProductById.mockResolvedValue({ data: seededProduct });
    getProductPriceByStore.mockResolvedValue({
      data: {
        storePrices: [
          { storeId: "1", storeName: "Toko A", price: "25000" },
          { storeId: "2", storeName: "Toko B", price: "26000" }
        ]
      }
    });
    updateProductPriceByStore.mockResolvedValue({ data: { success: true } });
    editProduct.mockResolvedValue({ data: { id: 1 } });
  });

  test("main save without editing store prices proceeds without a dirty warning", async () => {
    renderPage();
    await screen.findByDisplayValue("Kopi");

    fireEvent.click(screen.getByText("page.product.form.next"));
    fireEvent.click(await screen.findByText("page.product.form.next"));
    fireEvent.click(await screen.findByText("page.product.form.saveEdit"));
    fireEvent.click(await screen.findByText("common.yesSave"));

    await waitFor(() => expect(editProduct).toHaveBeenCalled());
  });

  test("main save with an unsaved store-price edit is blocked and warns instead of discarding", async () => {
    renderPage();
    await screen.findByDisplayValue("Kopi");

    fireEvent.click(screen.getByText("page.product.form.next"));
    const saveStoreButtons = await screen.findAllByText("page.product.form.saveStorePrice");
    const row = saveStoreButtons[0].closest("div.flex");
    const storePriceInput = within(row).getByRole("spinbutton");
    fireEvent.change(storePriceInput, { target: { value: "30000" } });

    fireEvent.click(screen.getByText("page.product.form.next"));
    fireEvent.click(await screen.findByText("page.product.form.saveEdit"));
    fireEvent.click(await screen.findByText("common.yesSave"));

    await waitFor(() =>
      expect(screen.getByText(/page\.product\.form\.unsavedStorePrices/)).toBeInTheDocument()
    );
    expect(editProduct).not.toHaveBeenCalled();
  });
});
