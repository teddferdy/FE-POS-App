import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ReceiptModal from "../page/cashier/components/ReceiptModal";
import { paymentMethodLabel } from "@/utils/payment";
import { buildAddressLines } from "@/utils/receiptDocument";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/utils/thermalPrint", () => ({ printReceipt: jest.fn(), printViaBrowser: jest.fn() }));
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
  getAllTypePayment: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("../services/split-bill", () => ({
  createSplitBill: jest.fn(),
  getSplitBillByOrder: jest.fn(() => Promise.resolve({ data: null })),
  paySplitBill: jest.fn(),
  cancelSplitBill: jest.fn(),
  mergeSplitBills: jest.fn()
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "admin", store: 7 }, activeStore: 7 }]
}));

const renderModal = (data, onNewTransaction = jest.fn()) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ReceiptModal data={data} onClose={jest.fn()} onNewTransaction={onNewTransaction} />
    </QueryClientProvider>
  );
  return onNewTransaction;
};

const ORDER = {
  id: 9,
  orderNumber: "ORD87511055EYQW",
  total: 4440,
  subtotal: 4000,
  tax: 440,
  paymentMethod: "E_WALLET",
  items: [{ nameProduct: "Es Teh Manis", count: 1, price: 4000, totalPrice: 4000 }]
};

describe("paymentMethodLabel", () => {
  test.each([
    ["E_WALLET", "E-Wallet"],
    ["e-wallet", "E-Wallet"],
    ["qris", "QRIS"],
    ["cash", "Tunai"],
    ["debit", "Kartu"],
    ["transfer", "Transfer Bank"],
    ["gopay", "Gopay"],
    ["-", ""],
    [null, ""]
  ])("%p → %p", (method, label) => {
    expect(paymentMethodLabel(method)).toBe(label);
  });
});

describe("buildAddressLines", () => {
  test("a full street address does not repeat its region names or postal code", () => {
    const lines = buildAddressLines({
      address:
        "Jl. Jenderal Sudirman No.45 - 46, RT.3/RW.4, Karet Semanggi, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12930",
      village: "Karet Semanggi",
      district: "Setiabudi",
      city: "Kota Administrasi Jakarta Selatan",
      province: "Daerah Khusus Ibukota Jakarta",
      postalCode: "12930",
      phone: "082223456789"
    });
    expect(lines).toEqual([
      "Jl. Jenderal Sudirman No.45 - 46, RT.3/RW.4, Karet Semanggi, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12930",
      "Telp 082223456789"
    ]);
  });

  test("a short street address still gets its region line and postal code", () => {
    expect(
      buildAddressLines({
        address: "Jl. Merdeka 1",
        district: "Coblong",
        city: "Kota Bandung",
        postalCode: "40132"
      })
    ).toEqual(["Jl. Merdeka 1", "Coblong, Kota Bandung", "Kode Pos 40132"]);
  });
});

describe("ReceiptModal layout", () => {
  test("summary shows the paid total and a readable payment method", async () => {
    renderModal(ORDER);
    const summary = await screen.findByRole("region", { name: "page.cashier.receipt.summary" });
    expect(within(summary).getByText("Rp4.440")).toBeInTheDocument();
    expect(within(summary).getByText("E-Wallet")).toBeInTheDocument();
    expect(within(summary).getByRole("status")).toHaveTextContent(
      "page.cashier.receipt.paymentSuccess"
    );
    // the printed receipt carries the same label, never the raw code
    expect(screen.getByTestId("receipt-paper")).not.toHaveTextContent("E_WALLET");
  });

  test("lands on Transaksi Baru so Enter starts the next sale", async () => {
    const onNewTransaction = renderModal(ORDER);
    const primary = await screen.findByRole("button", {
      name: /page.cashier.receipt.newTransaction/
    });
    expect(primary).toHaveFocus();
    fireEvent.click(primary);
    expect(onNewTransaction).toHaveBeenCalledTimes(1);
  });

  test("paper size is an accessible two-option control and close has a label", async () => {
    renderModal(ORDER);
    const group = await screen.findByRole("radiogroup", { name: "page.cashier.receipt.paperSize" });
    const [mm58, mm80] = within(group).getAllByRole("radio");
    expect(mm58).toHaveAttribute("aria-checked", "true");
    fireEvent.click(mm80);
    expect(mm80).toHaveAttribute("aria-checked", "true");
    expect(mm58).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "common.close" })).toBeInTheDocument();
  });

  test("every receipt action is reachable", async () => {
    renderModal(ORDER);
    for (const name of [
      /page.cashier.receipt.thermal/,
      /PDF/,
      /page.cashier.receipt.sendWA/,
      /page.cashier.receipt.split/
    ]) {
      expect(await screen.findByRole("button", { name })).toBeInTheDocument();
    }
  });

  test("cash payments show the change in the summary", async () => {
    renderModal({ ...ORDER, paymentMethod: "cash", cashAmount: 10000, changeAmount: 5560 });
    const summary = await screen.findByRole("region", { name: "page.cashier.receipt.summary" });
    expect(within(summary).getByText("Tunai")).toBeInTheDocument();
    expect(within(summary).getByText("Rp5.560")).toBeInTheDocument();
  });
});
