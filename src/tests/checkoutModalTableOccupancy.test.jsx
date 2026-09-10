import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CheckoutModal from "../page/cashier/components/CheckoutModal";
import { getAllCustomer } from "../services/customer";
import { getAllDiscount } from "../services/discount";
import { createOrder } from "../services/order";
import { getTableAvailability, getTablesWithActiveOrders } from "../services/table";

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
  createOrder: jest.fn(() => Promise.resolve({ data: { id: 1 } }))
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
  getTableAvailability: jest.fn(),
  getTablesWithActiveOrders: jest.fn()
}));

// Stub the table Combobox as a native <select> (established repo pattern) so
// options and their disabled flags are directly assertable without driving
// cmdk/Radix Popover open-and-click mechanics.
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({
    options = [],
    value,
    onChange,
    placeholder,
    loading,
    disabled
  }) {
    return (
      <select
        data-testid={placeholder}
        value={value || ""}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}>
        <option value="" />
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
}));

const deferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const tableRow = (id, name, { status = "available", capacity = 4, orders = [] } = {}) => ({
  id,
  name,
  status,
  capacity,
  orders
});

const renderModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const onTableChange = jest.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        items={[{ id: "p1", nameProduct: "Kopi", price: 10000, count: 1, totalPrice: 10000 }]}
        subtotal={10000}
        taxRate={0}
        store="1"
        cashierName="Kasir"
        cashierId={1}
        onClose={jest.fn()}
        onTableChange={onTableChange}
        onComplete={jest.fn()}
      />
    </QueryClientProvider>
  );
  return { ...utils, queryClient, onTableChange };
};

const selectDineInAndGetTableSelect = async () => {
  fireEvent.click(screen.getByText("page.cashier.modal.dineIn"));
  return screen.findByTestId("page.cashier.selectTable");
};

const completeCashPayment = (amount = 10000) => {
  fireEvent.click(screen.getByText("Cash"));
  fireEvent.change(screen.getByPlaceholderText("Rp 0"), { target: { value: "10000" } });
  void amount;
};

describe("F4-02 CheckoutModal — table occupancy from order-aware availability", () => {
  beforeEach(() => {
    getAllCustomer.mockResolvedValue({ data: [] });
    getAllDiscount.mockResolvedValue({ data: [] });
    createOrder.mockClear();
    getTableAvailability.mockClear();
    getTablesWithActiveOrders.mockClear();
  });

  test("a table with only an active QR order is disabled in table selection", async () => {
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 5, name: "Meja 5", status: "available", capacity: 4 }] }
    });
    getTablesWithActiveOrders.mockResolvedValue({
      data: [tableRow(5, "Meja 5", { orders: [{ id: 99, status: "pending", source: "qr" }] })]
    });

    renderModal();
    const select = await selectDineInAndGetTableSelect();
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalled());

    const option = within(select)
      .getByText(/Meja 5/)
      .closest("option");
    expect(option).toBeDisabled();
  });

  test("a table with an active QR order is labelled occupied in the selection UI", async () => {
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 5, name: "Meja 5", status: "available", capacity: 4 }] }
    });
    getTablesWithActiveOrders.mockResolvedValue({
      data: [tableRow(5, "Meja 5", { orders: [{ id: 99, status: "pending", source: "qr" }] })]
    });

    renderModal();
    const select = await selectDineInAndGetTableSelect();
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalled());

    const option = within(select)
      .getByText(/Meja 5/)
      .closest("option");
    expect(option.textContent).toContain("page.table.status.occupied");
  });

  test("attempting checkout for a table whose QR order arrived before payment is blocked — no second order", async () => {
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 7, name: "Meja 7", status: "available", capacity: 4 }] }
    });
    // First fetch (modal open): table free. Second fetch (after a QR order
    // lands mid-modal): table occupied by a pending customer order.
    getTablesWithActiveOrders
      .mockResolvedValueOnce({ data: [tableRow(7, "Meja 7")] })
      .mockResolvedValueOnce({
        data: [tableRow(7, "Meja 7", { orders: [{ id: 200, status: "pending", source: "qr" }] })]
      });

    const { queryClient, onTableChange } = renderModal();
    const select = await selectDineInAndGetTableSelect();

    // Wait until both snapshots settle (table loaded as free) before picking
    // it — otherwise the change fires against an empty table list.
    await waitFor(() => expect(getTableAvailability).toHaveBeenCalled());
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalledTimes(1));

    fireEvent.change(select, { target: { value: "7" } });
    await waitFor(() =>
      expect(onTableChange).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }))
    );

    queryClient.invalidateQueries(["table-active-orders", "1"]);
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalledTimes(2));

    completeCashPayment();
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));

    await waitFor(() => expect(createOrder).not.toHaveBeenCalled());
  });

  test("table selection is held back while occupancy data is still loading", async () => {
    const pending = deferred();
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 5, name: "Meja 5", status: "available", capacity: 4 }] }
    });
    getTablesWithActiveOrders.mockReturnValue(pending.promise);

    renderModal();
    await selectDineInAndGetTableSelect();
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalled());

    const select = screen.getByTestId("page.cashier.selectTable");
    expect(select).toBeDisabled();

    pending.resolve({ data: [] });
  });

  test("an occupancy lookup failure fails closed — no table is offered as safely available", async () => {
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 5, name: "Meja 5", status: "available", capacity: 4 }] }
    });
    getTablesWithActiveOrders.mockRejectedValue(new Error("boom"));

    renderModal();
    const select = await selectDineInAndGetTableSelect();
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalled());

    expect(select).toBeDisabled();
    expect(screen.getByText("page.cashier.tableOccupancyError")).toBeInTheDocument();
  });

  test("occupancy lookup is scoped to the active store", async () => {
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 10, name: "Meja 10", status: "available", capacity: 4 }] }
    });
    getTablesWithActiveOrders.mockResolvedValue({
      data: [tableRow(10, "Meja 10", { orders: [{ id: 300, status: "pending", source: "qr" }] })]
    });

    renderModal();
    await selectDineInAndGetTableSelect();
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalledTimes(1));

    expect(getTablesWithActiveOrders).toHaveBeenCalledWith({ location: "1" });
  });

  test("a genuinely available table remains selectable and proceeds through checkout", async () => {
    getTableAvailability.mockResolvedValue({
      data: { tables: [{ id: 7, name: "Meja 7", status: "available", capacity: 4 }] }
    });
    getTablesWithActiveOrders.mockResolvedValue({ data: [tableRow(7, "Meja 7")] });

    const { onTableChange } = renderModal();
    const select = await selectDineInAndGetTableSelect();
    await waitFor(() => expect(getTablesWithActiveOrders).toHaveBeenCalled());

    const option = within(select)
      .getByText(/Meja 7/)
      .closest("option");
    expect(option).not.toBeDisabled();

    fireEvent.change(select, { target: { value: "7" } });
    await waitFor(() =>
      expect(onTableChange).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }))
    );

    completeCashPayment();
    fireEvent.click(screen.getByText("page.cashier.confirmPayment"));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    expect(createOrder.mock.calls[0][0].tableId).toBe(7);
  });
});
