import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import EditIngredient from "../page/ingredient/EditIngredient";
import { toQuantity, formatQuantity } from "../utils/quantity";

// BA finding #5 (Waroeng Bakso dummy, 2026-10-17): an ingredient saved with
// stock 400 showed as 400.000. ingredient.stock is DECIMAL(10,4), so the API
// returns "400.0000"; printed raw it reads as four hundred thousand, and the
// edit form's digit-only filter turned it into 4000000.

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
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: "1" } }]
}));
// Render every tab panel so the stock field is reachable without driving
// Radix's pointer events.
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }) => <div>{children}</div>,
  TabsList: ({ children }) => <div>{children}</div>,
  TabsTrigger: ({ children }) => <button type="button">{children}</button>,
  TabsContent: ({ children }) => <div>{children}</div>
}));
jest.mock("@/services/ingredient", () => ({
  getIngredientById: jest.fn(() =>
    Promise.resolve({
      data: {
        id: 7,
        name: "Bakso Halus",
        unit: "kg",
        baseUnit: "butir",
        conversionFactor: "25.0000",
        stock: "400.0000",
        minStock: 50,
        costPrice: 25000,
        status: "active",
        store: 1
      }
    })
  ),
  editIngredient: jest.fn(),
  getProductNamesByFilters: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/supplier", () => ({
  getAllSupplier: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/ingredientCategory", () => ({
  getAllIngredientCategory: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));

describe("quantity helpers", () => {
  test("a DECIMAL string reads as its number", () => {
    expect(toQuantity("400.0000")).toBe(400);
    expect(toQuantity("2.5000")).toBe(2.5);
    expect(toQuantity(null)).toBe(0);
    expect(toQuantity("abc")).toBe(0);
  });

  test("prints in id-ID notation without spurious decimals", () => {
    expect(formatQuantity("400.0000")).toBe("400");
    expect(formatQuantity("2.5000")).toBe("2,5");
    expect(formatQuantity("12000.0000")).toBe("12.000");
  });
});

describe("Edit ingredient stock (BA finding #5)", () => {
  test("the stock field shows 400, not 400.0000", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <EditIngredient />
      </QueryClientProvider>
    );
    const label = await screen.findByText("page.ingredient.form.stockLabel");
    const input = label.closest("div").querySelector("input");
    // read-only since stock changes go through the audited "Atur Stok" action;
    // shown in the base unit the recipes deduct
    await waitFor(() => expect(input).toHaveValue("400 butir"));
    expect(input).toHaveAttribute("readonly");
  });
});
