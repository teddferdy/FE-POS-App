import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CashierTablePanel from "../page/cashier/components/CashierTablePanel";
import { getCashierTables, releaseCashierTable } from "@/services/table";
import { toast } from "sonner";

// Client request / BA C-16 amended: the cashier can put a table back to
// "available"; the server decides which tables the caller may reset.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, o) => (o && o.count != null ? `${k}:${o.count}` : k) })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/services/table", () => ({
  getCashierTables: jest.fn(),
  releaseCashierTable: jest.fn()
}));

const row = (id, name, status, extra = {}) => ({
  id,
  name,
  status,
  capacity: 4,
  unpaidOrders: [],
  canRelease: true,
  blockedReason: null,
  ...extra
});
const TABLES = [
  row(1, "Meja 1", "occupied"),
  row(2, "Meja 2", "reserved"),
  row(3, "Meja 3", "occupied", {
    canRelease: false,
    blockedReason: "TABLE_HAS_UNPAID_ORDER",
    unpaidOrders: [{ id: 9, orderNumber: "QR-9", totalPrice: 20000 }]
  }),
  row(4, "Meja 4", "available", { canRelease: false, blockedReason: "ALREADY_AVAILABLE" })
];

const wrap = (ui) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const spy = jest.spyOn(qc, "invalidateQueries");
  return { ...render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>), spy };
};
const card = (id) => screen.findByTestId(`cashier-table-${id}`);

beforeEach(() => {
  getCashierTables.mockReset().mockResolvedValue({ data: TABLES });
  releaseCashierTable.mockReset().mockResolvedValue({ success: true });
  toast.success.mockClear();
  toast.error.mockClear();
});

test("lists tables that are not available; blocked ones are disabled with the reason", async () => {
  wrap(<CashierTablePanel store="7" onClose={jest.fn()} />);
  const blocked = await card(3);
  expect(within(blocked).getByText("page.cashier.tables.release")).toBeDisabled();
  expect(
    within(blocked).getByText("page.cashier.tables.blocked.TABLE_HAS_UNPAID_ORDER")
  ).toBeInTheDocument();
  expect(blocked).toHaveTextContent("QR-9 (Rp20.000)");
  expect(within(await card(1)).getByText("page.cashier.tables.release")).not.toBeDisabled();
  expect(screen.queryByTestId("cashier-table-4")).not.toBeInTheDocument();
  expect(getCashierTables).toHaveBeenCalledWith("7");
});

test("one table: a reason is required, then the server is asked to release it", async () => {
  const { spy } = wrap(<CashierTablePanel store="7" onClose={jest.fn()} />);
  fireEvent.click(within(await card(1)).getByText("page.cashier.tables.release"));

  fireEvent.click(screen.getByText("page.cashier.tables.confirm"));
  expect(screen.getByRole("alert")).toHaveTextContent("page.cashier.tables.reasonRequired");
  expect(releaseCashierTable).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText("page.cashier.tables.reasonGuestsLeft"));
  fireEvent.click(screen.getByText("page.cashier.tables.confirm"));
  await waitFor(() =>
    expect(releaseCashierTable).toHaveBeenCalledWith({
      id: 1,
      reason: "page.cashier.tables.reasonGuestsLeft",
      storeId: "7"
    })
  );
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith("page.cashier.tables.toastReleased:1")
  );
  expect(spy).toHaveBeenCalledWith(["table-active-orders"]);
  expect(spy).toHaveBeenCalledWith(["cashier-tables"]);
});

test("Reset semua releases every resettable table (only when more than one)", async () => {
  wrap(<CashierTablePanel store="7" onClose={jest.fn()} />);
  fireEvent.click(await screen.findByText("page.cashier.tables.resetAll:2"));
  fireEvent.change(screen.getByLabelText(/page.cashier.tables.reasonLabel/), {
    target: { value: "Tutup shift" }
  });
  fireEvent.click(screen.getByText("page.cashier.tables.confirm"));
  await waitFor(() => expect(releaseCashierTable).toHaveBeenCalledTimes(2));
  expect(releaseCashierTable.mock.calls.map((c) => c[0].id)).toEqual([1, 2]);
});

test("no Reset semua when only one table can be reset", async () => {
  getCashierTables.mockResolvedValue({ data: [TABLES[0], TABLES[2]] });
  wrap(<CashierTablePanel store="7" onClose={jest.fn()} />);
  await card(1);
  expect(screen.queryByText(/page.cashier.tables.resetAll/)).not.toBeInTheDocument();
});

test("a refusal from the server is reported, the rest still go through", async () => {
  releaseCashierTable
    .mockResolvedValueOnce({ success: true })
    .mockRejectedValueOnce({ response: { data: { code: "TABLE_HAS_UNPAID_ORDER" } } });
  wrap(<CashierTablePanel store="7" onClose={jest.fn()} />);
  fireEvent.click(await screen.findByText("page.cashier.tables.resetAll:2"));
  fireEvent.click(screen.getByText("page.cashier.tables.reasonWrongTable"));
  fireEvent.click(screen.getByText("page.cashier.tables.confirm"));
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(toast.success).toHaveBeenCalledWith("page.cashier.tables.toastReleased:1");
  expect(toast.error.mock.calls[0][1].description).toContain("Meja 2");
});

test("all tables available → a clear empty state", async () => {
  getCashierTables.mockResolvedValue({ data: [TABLES[3]] });
  wrap(<CashierTablePanel store="7" onClose={jest.fn()} />);
  expect(await screen.findByText("page.cashier.tables.allAvailable")).toBeInTheDocument();
});
