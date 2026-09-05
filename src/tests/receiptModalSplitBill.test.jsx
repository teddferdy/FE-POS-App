import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ReceiptModal from "../page/cashier/components/ReceiptModal";
import {
  getSplitBillByOrder,
  paySplitBill,
  cancelSplitBill,
  mergeSplitBills
} from "../services/split-bill";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => (opts?.count != null ? `${k}:${opts.count}` : k) })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("@/utils/thermalPrint", () => ({ printReceipt: jest.fn() }));

jest.mock("@/services/invoice", () => ({
  getInvoiceSetting: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("@/services/location", () => ({
  getLocationById: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() => Promise.resolve([])),
  getCities: jest.fn(() => Promise.resolve([])),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));
jest.mock("@/services/type-payment", () => ({
  getAllTypePayment: jest.fn(() =>
    Promise.resolve({ data: [{ type: "cash", name: "Cash", status: "active" }] })
  )
}));

jest.mock("../services/split-bill", () => ({
  createSplitBill: jest.fn(() => Promise.resolve({ data: [] })),
  getSplitBillByOrder: jest.fn(),
  paySplitBill: jest.fn(),
  cancelSplitBill: jest.fn(),
  mergeSplitBills: jest.fn()
}));

// Radix Select needs pointer-capture APIs jsdom doesn't implement.
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }) => (
    <select
      aria-label="split-pay-method"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}>
      <option value="" />
      {children}
    </select>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ value, children }) => <option value={value}>{children}</option>
}));

let mockCookieUser = { id: 1, roleType: "admin", store: 7 };
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockCookieUser, activeStore: 7 }]
}));

const orderData = { id: 501, orderNumber: "ORD-501", total: 100000, items: [] };

const renderModal = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReceiptModal data={orderData} onClose={jest.fn()} onNewTransaction={jest.fn()} />
    </QueryClientProvider>
  );
};

describe("ReceiptModal split-bill management", () => {
  beforeEach(() => {
    mockCookieUser = { id: 1, roleType: "admin", store: 7 };
    getSplitBillByOrder.mockReset();
    paySplitBill.mockReset();
    cancelSplitBill.mockReset();
    mergeSplitBills.mockReset();
  });

  test("shows existing pending/paid splits with pay/cancel actions for admin", async () => {
    getSplitBillByOrder.mockResolvedValue({
      data: {
        splits: [
          { id: 1, splitNumber: "SPL001", amount: 50000, status: "pending" },
          { id: 2, splitNumber: "SPL002", amount: 50000, status: "paid" }
        ],
        summary: { totalSplits: 2, totalPaid: 50000, totalPending: 50000 }
      }
    });

    renderModal();
    fireEvent.click(screen.getByText("page.cashier.receipt.split"));

    await waitFor(() => expect(screen.getByText("SPL001")).toBeInTheDocument());
    expect(screen.getByText("SPL002")).toBeInTheDocument();
    expect(screen.getByText("page.cashier.receipt.splitPay")).toBeInTheDocument();
  });

  test("pays a pending split with the chosen method", async () => {
    getSplitBillByOrder.mockResolvedValue({
      data: {
        splits: [{ id: 1, splitNumber: "SPL001", amount: 50000, status: "pending" }],
        summary: { totalSplits: 1, totalPaid: 0, totalPending: 50000 }
      }
    });
    paySplitBill.mockResolvedValue({ data: { orderComplete: false } });

    renderModal();
    fireEvent.click(screen.getByText("page.cashier.receipt.split"));
    await waitFor(() => expect(screen.getByText("SPL001")).toBeInTheDocument());

    fireEvent.click(screen.getByText("page.cashier.receipt.splitPay"));
    fireEvent.change(screen.getByLabelText("split-pay-method"), { target: { value: "cash" } });

    const confirmButtons = screen.getAllByRole("button");
    const confirmBtn = confirmButtons.find((b) => b.querySelector("svg.lucide-circle-check-big"));
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(paySplitBill).toHaveBeenCalledWith(1, { paymentMethod: "cash" }));
  });

  test("cancels a pending split", async () => {
    getSplitBillByOrder.mockResolvedValue({
      data: {
        splits: [{ id: 3, splitNumber: "SPL003", amount: 20000, status: "pending" }],
        summary: { totalSplits: 1, totalPaid: 0, totalPending: 20000 }
      }
    });
    cancelSplitBill.mockResolvedValue({});

    renderModal();
    fireEvent.click(screen.getByText("page.cashier.receipt.split"));
    await waitFor(() => expect(screen.getByText("SPL003")).toBeInTheDocument());

    const trashButtons = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("svg.lucide-trash2"));
    fireEvent.click(trashButtons[0]);

    await waitFor(() => expect(cancelSplitBill).toHaveBeenCalledWith(3));
  });

  test("merges two selected pending splits", async () => {
    getSplitBillByOrder.mockResolvedValue({
      data: {
        splits: [
          { id: 4, splitNumber: "SPL004", amount: 10000, status: "pending" },
          { id: 5, splitNumber: "SPL005", amount: 10000, status: "pending" }
        ],
        summary: { totalSplits: 2, totalPaid: 0, totalPending: 20000 }
      }
    });
    mergeSplitBills.mockResolvedValue({});

    renderModal();
    fireEvent.click(screen.getByText("page.cashier.receipt.split"));
    await waitFor(() => expect(screen.getByText("SPL004")).toBeInTheDocument());

    const checkboxes = screen.getAllByLabelText("page.cashier.receipt.splitSelectForMerge");
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    fireEvent.click(screen.getByText(/page.cashier.receipt.splitMergeSelected/));

    await waitFor(() =>
      expect(mergeSplitBills).toHaveBeenCalledWith({ order: 501, splitIds: [4, 5] })
    );
  });

  test("kasir sees the split list but no pay/cancel/merge actions", async () => {
    mockCookieUser = { id: 2, roleType: "kasir", store: 7 };
    getSplitBillByOrder.mockResolvedValue({
      data: {
        splits: [{ id: 6, splitNumber: "SPL006", amount: 30000, status: "pending" }],
        summary: { totalSplits: 1, totalPaid: 0, totalPending: 30000 }
      }
    });

    renderModal();
    fireEvent.click(screen.getByText("page.cashier.receipt.split"));

    await waitFor(() => expect(screen.getByText("SPL006")).toBeInTheDocument());
    expect(screen.queryByText("page.cashier.receipt.splitPay")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("page.cashier.receipt.splitSelectForMerge")
    ).not.toBeInTheDocument();
  });

  test("shows the create-split form when no splits exist yet", async () => {
    getSplitBillByOrder.mockResolvedValue({
      data: { splits: [], summary: { totalSplits: 0, totalPaid: 0, totalPending: 0 } }
    });

    renderModal();
    fireEvent.click(screen.getByText("page.cashier.receipt.split"));

    await waitFor(() =>
      expect(screen.getByText("page.cashier.receipt.splitPeople")).toBeInTheDocument()
    );
  });
});
