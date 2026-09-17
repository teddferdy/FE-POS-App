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

// Phase 31 Batch 2 (PERF-1): checkout lookups must use the existing
// server-side search/pagination contract with a bounded page instead of
// pulling up to 999 rows on every open.
describe("CheckoutModal lookup queries — bounded server-side search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllCustomer.mockResolvedValue({ data: [] });
    getAllDiscount.mockResolvedValue({ data: [] });
  });

  test("customer lookup requests a bounded page, not the full member list", async () => {
    renderModal();
    await waitFor(() => expect(getAllCustomer).toHaveBeenCalled());
    const arg = getAllCustomer.mock.calls[0][0];
    expect(arg.limit).toBeLessThanOrEqual(50);
  });

  test("typing a customer name narrows via the server nameMember filter", async () => {
    renderModal();
    await waitFor(() => expect(getAllCustomer).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText("page.cashier.searchCustomer"), {
      target: { value: "Budi" }
    });
    await waitFor(() =>
      expect(getAllCustomer).toHaveBeenCalledWith(expect.objectContaining({ nameMember: "Budi" }))
    );
  });

  test("discount lookup requests a bounded page, not the full discount list", async () => {
    renderModal();
    await waitFor(() => expect(getAllDiscount).toHaveBeenCalled());
    const arg = getAllDiscount.mock.calls[0][0];
    expect(arg.limit).toBeLessThanOrEqual(50);
  });

  test("typing a discount name narrows via the server search filter", async () => {
    renderModal();
    await waitFor(() => expect(getAllDiscount).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText("page.cashier.searchDiscount"), {
      target: { value: "promo" }
    });
    await waitFor(() =>
      expect(getAllDiscount).toHaveBeenCalledWith(expect.objectContaining({ search: "promo" }))
    );
  });
});
