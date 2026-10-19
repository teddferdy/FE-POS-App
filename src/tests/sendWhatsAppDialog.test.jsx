import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import SendWhatsAppDialog, {
  toWhatsAppNumber
} from "../page/cashier/components/SendWhatsAppDialog";
import ReceiptModal from "../page/cashier/components/ReceiptModal";
import { getInvoiceWhatsAppText, sendInvoiceWhatsApp } from "@/services/invoice";
import { toast } from "sonner";

// Client request: send the invoice to the member/customer on WhatsApp.
// Primary path = wa.me on the device's own WhatsApp (no gateway needed);
// automatic gateway send only when the store has one configured.

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/services/invoice", () => ({
  getInvoiceWhatsAppText: jest.fn(),
  sendInvoiceWhatsApp: jest.fn(),
  getInvoiceSetting: jest.fn(() => Promise.resolve({ data: {} }))
}));
jest.mock("@/utils/thermalPrint", () => ({ printReceipt: jest.fn(), printViaBrowser: jest.fn() }));
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
  useCookies: () => [{ user: { id: 1, roleType: "kasir", store: 7 }, activeStore: 7 }]
}));

const TEXT = "*WARUNG A*\n*TOTAL: Rp20.000*\n_Terima kasih_";
const wrap = (ui) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};
const apiError = (status, body) =>
  Object.assign(new Error("x"), { response: { status, data: body } });
const findLink = () => screen.findByRole("link", { name: /page.cashier.receipt.waOpenManual/ });
const textReply = (gatewayReady) =>
  Promise.resolve({ data: { orderId: 42, text: TEXT, gatewayReady } });

beforeEach(() => {
  getInvoiceWhatsAppText.mockReset().mockImplementation(() => textReply(false));
  sendInvoiceWhatsApp.mockReset();
  toast.success.mockClear();
  toast.error.mockClear();
});

test("toWhatsAppNumber maps local Indonesian forms to wa.me digits", () => {
  expect(toWhatsAppNumber("0812-3456-7890")).toBe("6281234567890");
  expect(toWhatsAppNumber("+62 812 3456 7890")).toBe("6281234567890");
  expect(toWhatsAppNumber("81234567890")).toBe("6281234567890");
  expect(toWhatsAppNumber("12")).toBeNull();
  expect(toWhatsAppNumber("")).toBeNull();
});

describe("SendWhatsAppDialog", () => {
  test("Buka di WhatsApp is a one-tap wa.me link with the server-built receipt text", async () => {
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="0812 3456 7890" onClose={jest.fn()} />);
    const link = await findLink();
    expect(getInvoiceWhatsAppText).toHaveBeenCalledWith(42);
    expect(link).toHaveAttribute(
      "href",
      `https://wa.me/6281234567890?text=${encodeURIComponent(TEXT)}`
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    // no gateway configured → no automatic send offered
    expect(screen.queryByText("page.cashier.receipt.waSendAuto")).not.toBeInTheDocument();
    expect(sendInvoiceWhatsApp).not.toHaveBeenCalled();
  });

  test("no number = WhatsApp's own contact picker; the link follows the typed number", async () => {
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="" onClose={jest.fn()} />);
    expect(await findLink()).toHaveAttribute(
      "href",
      `https://wa.me/?text=${encodeURIComponent(TEXT)}`
    );
    fireEvent.change(screen.getByLabelText("page.cashier.receipt.waPhoneLabel"), {
      target: { value: "+62 811 1111 2222" }
    });
    expect(screen.getByText("page.cashier.receipt.waOpenManual").closest("a")).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/6281111112222\?text=/)
    );
  });

  test("an invalid number blocks the link and says why", async () => {
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="12" onClose={jest.fn()} />);
    const link = await findLink();
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(false);
    expect(screen.getByRole("alert")).toHaveTextContent("page.cashier.receipt.waInvalidPhone");
  });

  test("Kirim otomatis needs a number (the gateway cannot pick a contact)", async () => {
    getInvoiceWhatsAppText.mockImplementation(() => textReply(true));
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="" onClose={jest.fn()} />);
    fireEvent.click(await screen.findByText("page.cashier.receipt.waSendAuto"));
    expect(screen.getByRole("alert")).toHaveTextContent("page.cashier.receipt.waInvalidPhone");
    expect(sendInvoiceWhatsApp).not.toHaveBeenCalled();
  });

  test("with a configured gateway, Kirim otomatis sends and closes", async () => {
    getInvoiceWhatsAppText.mockImplementation(() => textReply(true));
    sendInvoiceWhatsApp.mockResolvedValue({ success: true });
    const onClose = jest.fn();
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="081234567890" onClose={onClose} />);
    fireEvent.click(await screen.findByText("page.cashier.receipt.waSendAuto"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(sendInvoiceWhatsApp).toHaveBeenCalledWith({ orderId: 42, phone: "081234567890" });
    expect(toast.success).toHaveBeenCalledWith("page.cashier.receipt.toast.waSuccess");
  });

  test("a gateway failure keeps the dialog open and points to the direct link", async () => {
    getInvoiceWhatsAppText.mockImplementation(() => textReply(true));
    sendInvoiceWhatsApp.mockRejectedValue(apiError(502, { code: "WA_SEND_FAILED" }));
    const onClose = jest.fn();
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="081234567890" onClose={onClose} />);
    fireEvent.click(await screen.findByText("page.cashier.receipt.waSendAuto"));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error.mock.calls[0][1]).toEqual({
      description: "page.cashier.receipt.waUseDirect"
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("page.cashier.receipt.waOpenManual").closest("a")).toBeTruthy();
  });

  test("a failed text load shows an error with retry, and no link", async () => {
    getInvoiceWhatsAppText.mockRejectedValueOnce(new Error("down"));
    wrap(<SendWhatsAppDialog orderId={42} defaultPhone="081234567890" onClose={jest.fn()} />);
    expect(await screen.findByText("page.cashier.receipt.waTextError")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByText("page.cashier.receipt.waRetry"));
    expect(await findLink()).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/6281234567890")
    );
  });
});

test("the transaction pop-up opens the WhatsApp dialog with the member's number", async () => {
  wrap(
    <ReceiptModal
      data={{
        id: 77,
        orderNumber: "ORD-77",
        items: [],
        total: 20000,
        customerName: "Budi",
        customer: { name: "Budi", phoneNumber: "+6281500000201" }
      }}
      onClose={jest.fn()}
      onNewTransaction={jest.fn()}
    />
  );
  fireEvent.click(screen.getByText("page.cashier.receipt.sendWA"));
  expect(await screen.findByLabelText("page.cashier.receipt.waPhoneLabel")).toHaveValue(
    "+6281500000201"
  );
  expect(await findLink()).toHaveAttribute("href", expect.stringContaining("wa.me/6281500000201"));
});
