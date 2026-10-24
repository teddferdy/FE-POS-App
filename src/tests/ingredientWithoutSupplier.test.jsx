import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddIngredient from "../page/ingredient/AddIngredient";
import { addIngredient, getProductNamesByFilters } from "../services/ingredient";
import { getAllSupplier } from "../services/supplier";

// Client note 2026-10-24: adding an ingredient must not need a supplier
// first. Many ingredients are bought at the market or made in-house; the
// category is chosen directly and the name is typed in. A supplier with a
// catalog still lets the name be picked from it.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn()
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 1 } }]
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

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AddIngredient />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  getAllSupplier.mockResolvedValue({
    data: [{ id: 5, name: "PT Daging Segar", status: "active" }]
  });
  getProductNamesByFilters.mockResolvedValue({ data: [] });
  addIngredient.mockResolvedValue({ success: true });
});

test("an ingredient is saved with a typed name and no supplier", async () => {
  renderPage();

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
