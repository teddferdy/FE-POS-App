import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ProductGrid from "../page/cashier/components/ProductGrid";
import { orderList } from "../state/order-list";
import { getAllCategoryActive } from "../services/category";
import { toast } from "sonner";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("../services/category", () => ({
  getAllCategoryActive: jest.fn(() => Promise.resolve({ data: [] }))
}));

// Simulates a store whose active catalog exceeds the backend's 500-row page
// cap (F7-02): only the first page's worth of products was ever fetched into
// `allProducts` — Product C exists in the store but was never loaded because
// it fell outside that page.
const localPageProducts = [
  { id: 1, nameProduct: "Product A", sku: "SKU-001", price: 10000, stock: 5 },
  { id: 2, nameProduct: "Product B", sku: "SKU-002", price: 20000, stock: 5 }
];

// ProductGrid stays decoupled from the service layer — CashierPage (which
// owns product fetching) is the one that knows how to look a code up
// remotely, so ProductGrid is handed a plain callback prop, exactly as
// CashierPage wires `lookupProductRemote` in the real app.
const Harness = ({ onRemoteBarcodeLookup }) => {
  const [barcode, setBarcode] = useState("");
  return (
    <ProductGrid
      products={localPageProducts}
      allProducts={localPageProducts}
      isLoading={false}
      search=""
      onSearchChange={jest.fn()}
      barcode={barcode}
      onBarcodeChange={setBarcode}
      categoryId=""
      onCategoryChange={jest.fn()}
      store="1"
      onRemoteBarcodeLookup={onRemoteBarcodeLookup}
    />
  );
};

const renderGrid = (onRemoteBarcodeLookup) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness onRemoteBarcodeLookup={onRemoteBarcodeLookup} />
    </QueryClientProvider>
  );
};

const switchToBarcodeMode = () => {
  fireEvent.click(screen.getByLabelText("page.cashier.barcodePlaceholder"));
  return screen.getByPlaceholderText("page.cashier.barcodePlaceholder");
};

// Regression coverage for the Batch 8 P1 finding: the backend caps a single
// catalog page at 500 rows (F7-02), and CashierPage never surfaced
// `pagination.hasMore` — so a store with more than 500 active products has
// real, sellable items that never made it into the locally cached
// `allProducts` array the barcode scanner searches. Scanning such a
// product's real SKU falsely reported "not found" even though the product
// exists and is active.
describe("ProductGrid barcode scan — catalog page cap (Batch 8)", () => {
  beforeEach(() => {
    orderList.setState({ order: [] });
    getAllCategoryActive.mockClear();
    toast.error.mockClear();
  });

  test("a SKU that exists but fell outside the cached page is still found via a live lookup", async () => {
    const onRemoteBarcodeLookup = jest.fn(() =>
      Promise.resolve([{ id: 3, nameProduct: "Product C", sku: "SKU-003", price: 30000, stock: 5 }])
    );

    renderGrid(onRemoteBarcodeLookup);
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "SKU-003" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(orderList.getState().order.some((i) => i.sku === "SKU-003")).toBe(true)
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(onRemoteBarcodeLookup).toHaveBeenCalledWith("SKU-003");
  });

  test("a SKU that genuinely does not exist anywhere still reports not found", async () => {
    const onRemoteBarcodeLookup = jest.fn(() => Promise.resolve([]));

    renderGrid(onRemoteBarcodeLookup);
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "DOES-NOT-EXIST" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("page.cashier.barcodeNotFound"));
    expect(orderList.getState().order).toHaveLength(0);
  });

  test("no fallback available (e.g. no store yet) still reports not found instead of throwing", async () => {
    renderGrid(undefined);
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "SKU-003" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("page.cashier.barcodeNotFound"));
    expect(orderList.getState().order).toHaveLength(0);
  });

  test("a SKU already present locally resolves instantly without invoking the remote fallback", async () => {
    const onRemoteBarcodeLookup = jest.fn(() => Promise.resolve([]));

    renderGrid(onRemoteBarcodeLookup);
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "SKU-001" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(orderList.getState().order.some((i) => i.sku === "SKU-001")).toBe(true)
    );
    expect(onRemoteBarcodeLookup).not.toHaveBeenCalled();
  });
});
