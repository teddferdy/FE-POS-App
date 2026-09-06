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

const products = [
  { id: 1, nameProduct: "Product A", sku: "SKU-001", price: 10000, stock: 5 },
  { id: 2, nameProduct: "Product B", sku: "SKU-002", price: 20000, stock: 5 }
];

// ProductGrid is a controlled component (search/barcode live in the parent
// in the real app, CashierPage) — this harness mirrors that just enough to
// drive the barcode input through onChange/keyDown like a real scanner would.
const Harness = () => {
  const [barcode, setBarcode] = useState("");
  return (
    <ProductGrid
      products={products}
      allProducts={products}
      isLoading={false}
      search=""
      onSearchChange={jest.fn()}
      barcode={barcode}
      onBarcodeChange={setBarcode}
      categoryId=""
      onCategoryChange={jest.fn()}
      store="1"
    />
  );
};

const renderGrid = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
};

const switchToBarcodeMode = () => {
  fireEvent.click(screen.getByLabelText("page.cashier.barcodePlaceholder"));
  return screen.getByPlaceholderText("page.cashier.barcodePlaceholder");
};

describe("ProductGrid barcode scan", () => {
  beforeEach(() => {
    orderList.setState({ order: [] });
    getAllCategoryActive.mockClear();
    toast.error.mockClear();
  });

  test("scanning an exact SKU match adds it to the cart and clears the input", async () => {
    renderGrid();
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "SKU-002" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(orderList.getState().order.some((i) => i.sku === "SKU-002")).toBe(true)
    );
    expect(input.value).toBe("");
    expect(toast.error).not.toHaveBeenCalled();
  });

  test("scanning a code with no product match shows an error and adds nothing", async () => {
    renderGrid();
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "DOES-NOT-EXIST" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("page.cashier.barcodeNotFound"));
    expect(orderList.getState().order).toHaveLength(0);
  });

  test("keys other than Enter do not trigger a lookup", () => {
    renderGrid();
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "SKU-001" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(orderList.getState().order).toHaveLength(0);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test("a key-repeat Enter event (held key/stuck trigger) is ignored, not treated as a new scan", () => {
    renderGrid();
    const input = switchToBarcodeMode();

    fireEvent.change(input, { target: { value: "SKU-001" } });
    fireEvent.keyDown(input, { key: "Enter", repeat: true });

    expect(orderList.getState().order).toHaveLength(0);
    expect(toast.error).not.toHaveBeenCalled();
    // The field is untouched too — a real (non-repeat) Enter afterwards
    // still works normally.
    expect(input.value).toBe("SKU-001");
  });
});
