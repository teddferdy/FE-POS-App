import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddBom from "../page/bom/AddBom";
import { addBom, editBom, getBomById } from "../services/bom";
import { getAllIngredients } from "../services/ingredient";
import { getAllSupplier } from "../services/supplier";

// Recipe (BOM) authoring for per-recipe stock deduction (e.g. a bakso shop):
// ingredients made in-house have no supplier, the line unit is always the
// ingredient's base unit, the BOM is saved to the store chosen here, and the
// list's Edit action really edits the recipe.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

let mockSearch = "productId=1";
let mockUser = { id: 1, roleType: "admin", store: "1" };
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockSearch), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockUser }]
}));
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ options, value, onChange, placeholder, disabled }) {
    return (
      <div data-testid={placeholder} data-field-value={value ?? ""} data-disabled={!!disabled}>
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
  addBom: jest.fn(),
  editBom: jest.fn(),
  getBomById: jest.fn()
}));
jest.mock("@/services/product", () => ({
  getAllProduct: jest.fn(() =>
    Promise.resolve({ data: [{ id: 1, nameProduct: "Mie Bakso Urat", sku: "BKS-1" }] })
  )
}));
jest.mock("@/services/ingredient", () => ({
  getAllIngredients: jest.fn()
}));
jest.mock("@/services/supplier", () => ({
  getAllSupplier: jest.fn()
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [{ id: 7, name: "Warung Pusat" }] }))
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

const INGREDIENTS = [
  { id: 21, name: "Bakso Halus", unit: "pack", baseUnit: "pcs", status: "active" },
  { id: 22, name: "Bakso Urat", unit: "pack", baseUnit: "pcs", status: "active" }
];

const pickIngredient = async (lineIndex, name) => {
  const boxes = await screen.findAllByTestId("page.bom.add.form.selectIngredient");
  const box = boxes[lineIndex];
  await waitFor(() => expect(within(box).getByText(name)).toBeInTheDocument());
  fireEvent.click(within(box).getByText(name));
};

const setQty = (lineIndex, value) => {
  const inputs = screen.getAllByPlaceholderText("page.bom.add.placeholder.qty");
  fireEvent.change(inputs[lineIndex], { target: { value } });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearch = "productId=1";
  mockUser = { id: 1, roleType: "admin", store: "1" };
  getAllIngredients.mockResolvedValue({ data: INGREDIENTS });
  getAllSupplier.mockResolvedValue({ data: [] });
  addBom.mockResolvedValue({ success: true });
  editBom.mockResolvedValue({ success: true });
});

describe("AddBom — in-house ingredients without a supplier", () => {
  test("ingredients are selectable directly and saved with their base unit", async () => {
    renderPage();
    await pickIngredient(0, "Bakso Urat");
    setQty(0, "2");
    fireEvent.click(screen.getByText("page.bom.add.form.addRow"));
    await pickIngredient(1, "Bakso Halus");
    setQty(1, "2");

    // the line unit shows the base (stock) unit, never the purchase unit
    expect(screen.getAllByTitle("page.bom.add.form.baseUnitHint")[0]).toHaveTextContent("pcs");

    fireEvent.click(screen.getByText("page.bom.add.form.save"));
    await waitFor(() => expect(addBom).toHaveBeenCalledTimes(1));
    const body = addBom.mock.calls[0][0];
    expect(body).toMatchObject({ productId: 1, store: 1, status: "active" });
    expect(body.lines).toEqual([
      { ingredientId: 22, qty: 2, unit: "pcs", notes: "" },
      { ingredientId: 21, qty: 2, unit: "pcs", notes: "" }
    ]);
  });
});

describe("AddBom — store scope", () => {
  test("a super admin's BOM is saved to the store picked on the form", async () => {
    mockUser = { id: 9, roleType: "super_admin", store: null };
    renderPage();
    const storeBox = await screen.findByTestId("page.bom.add.form.selectStore");
    fireEvent.click(await within(storeBox).findByText("Warung Pusat"));
    await pickIngredient(0, "Bakso Halus");
    setQty(0, "5");
    fireEvent.click(screen.getByText("page.bom.add.form.save"));
    await waitFor(() => expect(addBom).toHaveBeenCalledTimes(1));
    expect(addBom.mock.calls[0][0]).toMatchObject({ store: 7, productId: 1 });
  });
});

describe("AddBom — edit mode (?id=)", () => {
  beforeEach(() => {
    mockSearch = "id=55";
    getBomById.mockResolvedValue({
      data: {
        id: 55,
        store: 1,
        productId: 1,
        name: "Resep Bakso Urat",
        notes: "per porsi",
        status: "active",
        lines: [
          { ingredientId: 22, qty: 2, unit: "pcs", notes: "" },
          { ingredientId: 21, qty: 2, unit: "pcs", notes: "" }
        ]
      }
    });
  });

  test("loads the recipe and saves changes with editBom, never addBom", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByPlaceholderText("page.bom.add.placeholder.qty")).toHaveLength(2)
    );
    expect(screen.getByText("page.bom.edit.title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Resep Bakso Urat")).toBeInTheDocument();
    expect(screen.getByTestId("page.bom.add.form.selectProduct")).toHaveAttribute(
      "data-disabled",
      "true"
    );

    setQty(1, "3");
    fireEvent.click(screen.getByText("page.bom.add.form.save"));

    await waitFor(() => expect(editBom).toHaveBeenCalledTimes(1));
    expect(addBom).not.toHaveBeenCalled();
    const [id, body] = editBom.mock.calls[0];
    expect(id).toBe("55");
    expect(body).toMatchObject({
      name: "Resep Bakso Urat",
      notes: "per porsi",
      status: "active",
      store: 1
    });
    expect(body.lines).toEqual([
      { ingredientId: 22, qty: 2, unit: "pcs", notes: "" },
      { ingredientId: 21, qty: 3, unit: "pcs", notes: "" }
    ]);
  });

  test("an unknown recipe shows a not-found state instead of an empty form", async () => {
    getBomById.mockRejectedValue(new Error("BOM not found"));
    renderPage();
    expect(await screen.findByText("page.bom.edit.notFound")).toBeInTheDocument();
    expect(screen.queryByText("page.bom.add.form.save")).not.toBeInTheDocument();
  });
});
