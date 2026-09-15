import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddBom from "../page/bom/AddBom";
import { getAllIngredients } from "../services/ingredient";
import { getAllSupplier } from "../services/supplier";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams("productId=1"), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: "1" } }]
}));

// Same stub pattern already used by addProductStoreSwitch.test.jsx — renders
// every option as a plain button and exposes the current field value via a
// data attribute, avoiding the Radix/cmdk popover machinery entirely.
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ options, value, onChange, placeholder }) {
    return (
      <div data-testid={placeholder} data-field-value={value ?? ""}>
        {options.map((o) => (
          <button key={String(o.value)} type="button" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
}));

jest.mock("@/services/bom", () => ({
  addBom: jest.fn()
}));
jest.mock("@/services/product", () => ({
  getAllProduct: jest.fn(() =>
    Promise.resolve({ data: [{ id: 1, nameProduct: "Nasi Goreng", sku: "SKU1" }] })
  )
}));
jest.mock("@/services/ingredient", () => ({
  getAllIngredients: jest.fn()
}));
jest.mock("@/services/supplier", () => ({
  getAllSupplier: jest.fn()
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AddBom />
    </QueryClientProvider>
  );
};

// Phase 21 Batch 15 — FE↔BE compatibility audit.
//
// BE's bom.js controller enforces a hard "BASE-UNIT-ONLY contract":
// bom_line.unit must equal the selected ingredient's baseUnit, or the
// request is rejected with a 400 ("Unit mismatch"). AddBom.jsx's ingredient
// picker auto-fills the line's unit from the ingredient's *display/purchase*
// unit field (`match?.unit`) instead of its *base stock* unit field
// (`match?.baseUnit`) — so selecting any ingredient whose purchase unit
// differs from its base stock unit (the entire reason the two fields exist
// separately) auto-fills a unit the backend will reject.

describe("AddBom — ingredient selection must auto-fill the authoritative baseUnit, not the purchase/display unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllIngredients.mockResolvedValue({
      data: [
        {
          id: 10,
          name: "Tepung",
          unit: "box", // purchase/display unit — NOT what BE requires here
          baseUnit: "liter", // authoritative stock unit — what bom_line.unit must equal
          status: "active"
        }
      ]
    });
    getAllSupplier.mockResolvedValue({
      data: [{ id: 5, name: "Supplier A", products: [{ name: "Tepung" }] }]
    });
  });

  test("selecting an ingredient sets the BOM line unit to the ingredient's baseUnit", async () => {
    renderPage();

    const supplierBox = await screen.findByTestId("page.bom.add.form.selectSupplier");
    const supplierButton = await within(supplierBox).findByText("Supplier A");
    fireEvent.click(supplierButton);

    const ingredientBox = await screen.findByTestId("page.bom.add.form.selectIngredient");
    await waitFor(() => expect(within(ingredientBox).getByText("Tepung")).toBeInTheDocument());
    fireEvent.click(within(ingredientBox).getByText("Tepung"));

    const unitBox = await screen.findByTestId("unit.pcs");
    await waitFor(() => expect(unitBox).toHaveAttribute("data-field-value", "liter"));
  });
});
