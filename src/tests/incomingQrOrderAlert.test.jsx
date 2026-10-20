import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import IncomingQrOrderAlert from "../page/cashier/components/IncomingQrOrderAlert";
import { getOrdersByStore, updateOrderStatus } from "@/services/order";
import { toast } from "sonner";

// Client request: a new QR (table) order pops up on the cashier screen.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, o) => (o && o.index ? `${k}:${o.index}/${o.total}` : k)
  })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn(),
  updateOrderStatus: jest.fn()
}));

const qr = (id, extra = {}) => ({
  id,
  orderNumber: `QR-${id}`,
  source: "qr",
  status: "pending",
  createdAt: `2026-10-20T10:0${id}:00Z`,
  table: { name: `Meja ${id}` },
  customerName: "Budi",
  paymentMethod: "QRIS",
  totalPrice: 25000,
  items: [{ id: id * 10, productName: "Bakso Urat", quantity: 1, totalPrice: 25000 }],
  ...extra
});

const renderAlert = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={qc}>
      <IncomingQrOrderAlert store="7" actor={{ id: 3, name: "Sari" }} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  sessionStorage.clear();
  getOrdersByStore.mockReset();
  updateOrderStatus.mockReset().mockResolvedValue({ success: true });
  toast.success.mockClear();
  toast.error.mockClear();
});

test("a pending QR order pops up with its table, items and total; counter orders do not", async () => {
  getOrdersByStore.mockResolvedValue({
    data: [qr(1), { ...qr(2), source: "pos", orderNumber: "POS-2" }]
  });
  renderAlert();
  const dialog = await screen.findByTestId("qr-order-alert");
  expect(dialog).toHaveTextContent("Meja 1");
  expect(dialog).toHaveTextContent("QR-1");
  expect(dialog).toHaveTextContent("1× Bakso Urat");
  expect(dialog).toHaveTextContent("Rp25.000");
  expect(dialog).not.toHaveTextContent("POS-2");
  expect(getOrdersByStore).toHaveBeenCalledWith({ location: "7", status: "pending", limit: 50 });
});

test("nothing is shown when there is no new QR order", async () => {
  getOrdersByStore.mockResolvedValue({ data: [] });
  renderAlert();
  await waitFor(() => expect(getOrdersByStore).toHaveBeenCalled());
  expect(screen.queryByTestId("qr-order-alert")).not.toBeInTheDocument();
});

test("Terima sends the order to the kitchen and moves on to the next one", async () => {
  getOrdersByStore.mockResolvedValue({ data: [qr(2), qr(1)] });
  renderAlert();
  expect(await screen.findByText("page.cashier.qrAlert.position:1/2")).toBeInTheDocument();
  expect(screen.getByTestId("qr-order-alert")).toHaveTextContent("QR-1"); // oldest first

  fireEvent.click(screen.getByText("page.cashier.qrAlert.accept"));
  await waitFor(() =>
    expect(updateOrderStatus).toHaveBeenCalledWith({
      id: 1,
      store: "7",
      status: "preparing",
      changedBy: 3,
      changedByName: "Sari"
    })
  );
  await waitFor(() => expect(screen.getByTestId("qr-order-alert")).toHaveTextContent("QR-2"));
  expect(toast.success).toHaveBeenCalledWith("page.customerOrder.accepted");
});

test("Tolak needs a confirmation, then rejects the order", async () => {
  getOrdersByStore.mockResolvedValue({ data: [qr(1)] });
  renderAlert();
  fireEvent.click(await screen.findByText("page.cashier.qrAlert.reject"));
  expect(updateOrderStatus).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("page.cashier.qrAlert.rejectYes"));
  await waitFor(() =>
    expect(updateOrderStatus).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, status: "cancelled", notes: "Ditolak oleh kasir" })
    )
  );
});

test("Nanti hides the order for this session — it stays in the queue, no status change", async () => {
  getOrdersByStore.mockResolvedValue({ data: [qr(1)] });
  const first = renderAlert();
  fireEvent.click(await screen.findByText("page.cashier.qrAlert.later"));
  await waitFor(() => expect(screen.queryByTestId("qr-order-alert")).not.toBeInTheDocument());
  expect(updateOrderStatus).not.toHaveBeenCalled();

  first.unmount();
  renderAlert();
  await waitFor(() => expect(getOrdersByStore).toHaveBeenCalledTimes(2));
  expect(screen.queryByTestId("qr-order-alert")).not.toBeInTheDocument();
});

test("a failed accept keeps the order on screen with an error", async () => {
  getOrdersByStore.mockResolvedValue({ data: [qr(1)] });
  updateOrderStatus.mockRejectedValue({
    response: { data: { message: "Order already processed" } }
  });
  renderAlert();
  fireEvent.click(await screen.findByText("page.cashier.qrAlert.accept"));
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Order already processed"));
  expect(screen.getByTestId("qr-order-alert")).toHaveTextContent("QR-1");
});
