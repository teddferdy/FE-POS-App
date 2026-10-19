import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ReceiptModal from "../page/cashier/components/ReceiptModal";
import { printReceipt } from "@/utils/thermalPrint";
import { renderReceiptElement } from "@/utils/receiptDocument";

// User report: the receipt shown on screen and the printed receipt looked
// different. Both now come from ONE receipt object rendered by ONE
// renderer; this pins that the cashier's on-screen receipt is exactly what
// the printer receives.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => (opts?.count != null ? `${k}:${opts.count}` : k) })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("@/utils/thermalPrint", () => ({ printReceipt: jest.fn(() => Promise.resolve()) }));

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
  getSplitBillByOrder: jest.fn(() => Promise.resolve({ data: null })),
  paySplitBill: jest.fn(),
  cancelSplitBill: jest.fn(),
  mergeSplitBills: jest.fn()
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 7 }, activeStore: 7 }]
}));

const order = {
  id: 701,
  orderNumber: "ORD-701",
  cashierName: "Sari",
  paymentMethod: "cash",
  createdAt: "2026-10-19T14:30:00Z",
  table: { id: 3, name: "VIP 3" },
  customerName: "Budi",
  customer: { name: "Budi", memberTier: "Gold", memberPoints: 120 },
  items: [{ nameProduct: "Bakso Urat", count: 2, price: 25000, totalPrice: 50000 }],
  subtotal: 50000,
  tax: 5500,
  taxRate: 11,
  total: 55500,
  cashAmount: 60000,
  changeAmount: 4500
};

test("the on-screen receipt is exactly the receipt sent to the printer", async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ReceiptModal data={order} onClose={jest.fn()} onNewTransaction={jest.fn()} />
    </QueryClientProvider>
  );

  const paper = screen.getByTestId("receipt-paper");
  expect(paper).toHaveTextContent("ORD-701");
  expect(paper).toHaveTextContent("2 x Rp25.000");
  expect(paper).toHaveTextContent("page.cashier.tax (11%)");

  fireEvent.click(screen.getByText("page.cashier.receipt.thermal"));
  await waitFor(() => expect(printReceipt).toHaveBeenCalled());
  const printed = printReceipt.mock.calls[0][0];
  expect(renderReceiptElement(printed).outerHTML).toBe(paper.innerHTML);
});
