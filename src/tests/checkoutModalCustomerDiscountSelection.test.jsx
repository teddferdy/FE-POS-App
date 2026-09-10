import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { getAllCustomer } from "../services/customer";
import { getAllDiscount } from "../services/discount";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "cashier" } }]
}));

jest.mock("../services/order", () => ({
  createOrder: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("../services/customer", () => ({
  getAllCustomer: jest.fn(),
  addCustomer: jest.fn()
}));
jest.mock("../services/discount", () => ({
  getAllDiscount: jest.fn(),
  lookupDiscountByCode: jest.fn()
}));
jest.mock("../services/member-tier", () => ({
  getAllMemberTier: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("../services/type-payment", () => ({
  getAllTypePayment: jest.fn(() =>
    Promise.resolve({ data: [{ type: "cash", name: "Cash", status: "active" }] })
  )
}));
jest.mock("../services/member", () => ({
  getMemberById: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("../services/table", () => ({
  getTableAvailability: jest.fn(() => Promise.resolve({ data: { tables: [] } })),
  getTablesWithActiveOrders: jest.fn(() => Promise.resolve({ data: [] }))
}));

const customers = [
  { id: 1, name: "Budi Santoso", phone: "0811" },
  { id: 2, name: "Siti Aminah", phone: "0822" }
];
const discounts = [{ id: 10, nameDiscount: "Diskon 10%", type: "percent", value: 10 }];

const renderModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={[{ id: "p1", nameProduct: "Kopi", price: 10000, count: 1, totalPrice: 10000 }]}
        subtotal={10000}
        taxRate={0}
        store="1"
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={jest.fn()}
        onComplete={jest.fn()}
      />
    </QueryClientProvider>
  );
};

describe("CheckoutModal customer selection stays in sync with the search text", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: customers });
    getAllDiscount.mockResolvedValue({ data: discounts });
  });

  test("picking a customer from the dropdown shows a clear button for it", async () => {
    renderModal();
    fireEvent.focus(screen.getByPlaceholderText("page.cashier.searchCustomer"));
    await waitFor(() => expect(screen.getByText("Budi Santoso")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Budi Santoso"));

    expect(screen.getByPlaceholderText("page.cashier.searchCustomer").value).toBe("Budi Santoso");
    expect(screen.getByLabelText("common.clear")).toBeInTheDocument();
  });

  test("editing the search text after a pick drops the stale selection instead of silently keeping it", async () => {
    renderModal();
    const input = screen.getByPlaceholderText("page.cashier.searchCustomer");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("Budi Santoso")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Budi Santoso"));
    expect(screen.getByLabelText("common.clear")).toBeInTheDocument();

    // Cashier starts typing a different name without picking a new result —
    // the previously selected customer must not remain silently attached.
    fireEvent.change(input, { target: { value: "Siti" } });

    expect(screen.queryByLabelText("common.clear")).not.toBeInTheDocument();
  });

  test("the clear button removes the selection and the text", async () => {
    renderModal();
    const input = screen.getByPlaceholderText("page.cashier.searchCustomer");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("Budi Santoso")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Budi Santoso"));

    fireEvent.click(screen.getByLabelText("common.clear"));
    expect(input.value).toBe("");
    expect(screen.queryByLabelText("common.clear")).not.toBeInTheDocument();
  });
});

describe("CheckoutModal discount selection stays in sync with the search text", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: customers });
    getAllDiscount.mockResolvedValue({ data: discounts });
  });

  test("editing the discount search after a pick drops the stale discount", async () => {
    renderModal();
    const input = screen.getByPlaceholderText("page.cashier.searchDiscount");
    fireEvent.focus(input);
    await waitFor(() => expect(screen.getByText("Diskon 10%")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Diskon 10%"));
    expect(input.value).toBe("Diskon 10%");

    fireEvent.change(input, { target: { value: "Diskon la" } });

    // The applied-discount line in the order summary must disappear along
    // with the stale selection, not keep showing the old discount amount.
    await waitFor(() => expect(screen.queryByText(/Diskon 10%/)).not.toBeInTheDocument());
  });
});
