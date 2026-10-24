import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddIngredient from "../page/ingredient/AddIngredient";
import EditIngredient from "../page/ingredient/EditIngredient";
import { addIngredient, getIngredientById, getProductNamesByFilters } from "../services/ingredient";
import { getAllSupplier } from "../services/supplier";

// Client notes 2026-10-24: adding an ingredient must not need a supplier
// first, and the form offers an explicit choice between "Tanpa supplier"
// (market / in-house: no supplier field, the name is typed in) and "Dari
// supplier" (supplier required, the name can come from its catalog).

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("id=7"), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
let mockUser = { id: 1, roleType: "admin", store: 1 };
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockUser }]
}));
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children }) => <button type="button">{children}</button>,
  TabsContent: ({ children }) => <div>{children}</div>
}));
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ options, onChange, placeholder, disabled }) {
    return (
      <div data-testid={placeholder} data-disabled={!!disabled}>
        {options.map((o) => (
          <button key={String(o.value)} type="button" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
}));
// Skip the confirm dialog: a valid submit saves straight away.
jest.mock("@/hooks/useConfirmSubmit", () => ({
  useConfirmSubmit: (form, onConfirm) => ({
    handleSubmit: form.handleSubmit((values) => onConfirm(values)),
    confirmModal: () => ({ open: false })
  })
}));
jest.mock("@/services/ingredient", () => ({
  addIngredient: jest.fn(),
  editIngredient: jest.fn(),
  getIngredientById: jest.fn(),
  getProductNamesByFilters: jest.fn()
}));
jest.mock("@/services/supplier", () => ({
  getAllSupplier: jest.fn()
}));
jest.mock("@/services/ingredientCategory", () => ({
  getAllIngredientCategory: jest.fn(() =>
    Promise.resolve({ data: [{ id: 3, name: "Bahan Bakso", status: "active" }] })
  )
}));
jest.mock("@/queries/useLocations", () => ({
  useLocations: () => ({ data: undefined, isLoading: false })
}));

const renderPage = (Page = AddIngredient) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  render(
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
};

const sourceRadio = (source) =>
  document.querySelector(`input[name="ingredientSource"][value="${source}"]`);
const chooseSource = (source) => fireEvent.click(sourceRadio(source));

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 1, roleType: "admin", store: 1 };
  getAllSupplier.mockResolvedValue({
    data: [{ id: 5, name: "PT Daging Segar", status: "active" }]
  });
  getProductNamesByFilters.mockResolvedValue({ data: [] });
  addIngredient.mockResolvedValue({ success: true });
});

test("the default source has no supplier field; a typed name is saved", async () => {
  renderPage();
  // an admin's store is fixed, so there is no store hint
  expect(screen.queryByText("page.ingredient.form.storeFirstHint")).not.toBeInTheDocument();
  expect(sourceRadio("none")).toBeChecked();
  expect(screen.queryByTestId("page.ingredient.form.supplierPlaceholder")).not.toBeInTheDocument();

  const categoryBox = await screen.findByTestId("page.ingredient.form.categoryPlaceholder");
  expect(categoryBox).toHaveAttribute("data-disabled", "false");
  fireEvent.click(await within(categoryBox).findByText("Bahan Bakso"));

  const name = screen.getByPlaceholderText("page.ingredient.form.nameFreePlaceholder");
  expect(name).not.toBeDisabled();
  fireEvent.change(name, { target: { value: "Bakso Halus" } });

  fireEvent.click(screen.getByText("page.ingredient.form.saveButton"));
  await waitFor(() => expect(addIngredient).toHaveBeenCalledTimes(1));
  expect(addIngredient.mock.calls[0][0]).toMatchObject({
    name: "Bakso Halus",
    supplier: null,
    category: 3,
    store: 1
  });
});

test("a supplier with a catalog still offers its products as the name", async () => {
  getProductNamesByFilters.mockImplementation(({ supplier }) =>
    Promise.resolve({
      data: supplier ? [{ name: "Daging Sapi", price: 120000, unit: "kg" }] : []
    })
  );
  renderPage();
  chooseSource("supplier");

  const supplierBox = await screen.findByTestId("page.ingredient.form.supplierPlaceholder");
  fireEvent.click(await within(supplierBox).findByText("PT Daging Segar"));
  const categoryBox = screen.getByTestId("page.ingredient.form.categoryPlaceholder");
  fireEvent.click(await within(categoryBox).findByText("Bahan Bakso"));

  const nameBox = await screen.findByTestId("page.ingredient.form.namePlaceholder");
  expect(await within(nameBox).findByText("Daging Sapi")).toBeInTheDocument();
  expect(
    screen.queryByPlaceholderText("page.ingredient.form.nameFreePlaceholder")
  ).not.toBeInTheDocument();
});

test('"Dari supplier" without a supplier is not saved', async () => {
  renderPage();
  chooseSource("supplier");
  const categoryBox = await screen.findByTestId("page.ingredient.form.categoryPlaceholder");
  fireEvent.click(await within(categoryBox).findByText("Bahan Bakso"));
  fireEvent.change(screen.getByPlaceholderText("page.ingredient.form.nameFreePlaceholder"), {
    target: { value: "Bakso Halus" }
  });

  fireEvent.click(screen.getByText("page.ingredient.form.saveButton"));
  await new Promise((r) => setTimeout(r, 50));
  expect(addIngredient).not.toHaveBeenCalled();

  // back to "Tanpa supplier": the same entry saves
  chooseSource("none");
  fireEvent.click(screen.getByText("page.ingredient.form.saveButton"));
  await waitFor(() => expect(addIngredient).toHaveBeenCalledTimes(1));
  expect(addIngredient.mock.calls[0][0]).toMatchObject({ name: "Bakso Halus", supplier: null });
});

test("editing opens in the source the ingredient already has", async () => {
  getIngredientById.mockResolvedValue({
    data: {
      id: 7,
      name: "Daging Sapi",
      supplier: 5,
      category: 3,
      unit: "kg",
      baseUnit: "gram",
      conversionFactor: "1000",
      stock: "0",
      minStock: 0,
      costPrice: 120000,
      status: "active",
      store: 1
    }
  });
  renderPage(EditIngredient);
  await waitFor(() => expect(sourceRadio("supplier")).toBeChecked());
  expect(screen.getByTestId("page.ingredient.form.supplierPlaceholder")).toBeInTheDocument();
});

test("a super admin can switch the source before picking a store", async () => {
  // bakso_admin is a (scoped) super admin: the store is picked on the form,
  // and the source choice must not wait for it.
  mockUser = { id: 16, roleType: "super_admin", store: null };
  renderPage();
  expect(screen.getByText("page.ingredient.form.storeFirstHint")).toBeInTheDocument();

  expect(sourceRadio("none")).not.toBeDisabled();
  expect(sourceRadio("supplier")).not.toBeDisabled();
  chooseSource("supplier");
  expect(sourceRadio("supplier")).toBeChecked();

  // only the supplier list waits for the store
  const supplierBox = screen.getByTestId("page.ingredient.form.supplierDisabledPlaceholder");
  expect(supplierBox).toHaveAttribute("data-disabled", "true");

  chooseSource("none");
  expect(sourceRadio("none")).toBeChecked();
});
