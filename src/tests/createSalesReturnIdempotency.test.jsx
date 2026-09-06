import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CreateSalesReturn from "../page/sales-return/CreateSalesReturn";
import { getOrderById } from "@/services/order";
import { returnOrder } from "@/services/sales-return";
import { toast } from "sonner";

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams("orderId=1"), jest.fn()],
  useNavigate: () => jest.fn()
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key, opts) => (typeof opts === "string" ? opts : key) })
}));
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 42 } }]
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock("@/services/order", () => ({
  getOrderById: jest.fn(),
  getOrdersByStore: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/sales-return", () => ({
  returnOrder: jest.fn()
}));
jest.mock("@/services/type-payment", () => ({
  getAllTypePayment: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/inventory", () => ({
  getBatches: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock(
  "@/components/ui/PageHeader",
  () =>
    function PageHeaderStub() {
      return <div data-testid="page-header" />;
    }
);
jest.mock(
  "@/components/organism/modal",
  () =>
    function ModalStub({ open, onConfirm, confirmText, loading }) {
      if (!open) return null;
      return (
        <button type="button" disabled={loading} onClick={() => onConfirm?.()}>
          {confirmText || "confirm"}
        </button>
      );
    }
);

const order = {
  id: 1,
  orderNumber: "ORD-1",
  paymentStatus: "paid",
  paymentMethod: "cash",
  totalPrice: 20000,
  items: [
    { id: 100, product: 5, productName: "Widget", quantity: 2, totalPrice: 20000, unit: "pcs" }
  ]
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateSalesReturn />
    </QueryClientProvider>
  );
};

describe("CreateSalesReturn — idempotency key + conflict handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrderById.mockResolvedValue({ data: order });
  });

  test("retrying after a failed attempt (unmodified request) reuses the same idempotencyKey", async () => {
    // Simulates a network drop: the request may or may not have reached
    // the server, so the client-side mutation itself fails — the retry
    // must carry the SAME key so the server can recognize it if the
    // first attempt actually did land.
    returnOrder.mockRejectedValueOnce({ response: { status: 500, data: {} } });
    renderPage();

    await screen.findByText("Widget");
    fireEvent.click(screen.getByText(/page.salesReturn.create.add/));
    fireEvent.change(screen.getByDisplayValue("page.salesReturn.create.reasonPlaceholder"), {
      target: { value: "page.salesReturn.create.reason.damaged" }
    });

    fireEvent.click(screen.getByText("page.salesReturn.create.submit"));
    fireEvent.click(await screen.findByText("page.salesReturn.create.confirmButton"));

    await waitFor(() => expect(returnOrder).toHaveBeenCalledTimes(1));
    const firstKey = returnOrder.mock.calls[0][1].idempotencyKey;
    expect(firstKey).toBeTruthy();

    // Retry the exact same, still-unmodified request.
    returnOrder.mockResolvedValueOnce({ data: { id: 9, status: "pending" } });
    fireEvent.click(screen.getByText("page.salesReturn.create.submit"));
    fireEvent.click(await screen.findByText("page.salesReturn.create.confirmButton"));

    await waitFor(() => expect(returnOrder).toHaveBeenCalledTimes(2));
    const secondKey = returnOrder.mock.calls[1][1].idempotencyKey;
    expect(secondKey).toBe(firstKey);
  });

  test("editing the return after a failed attempt generates a fresh idempotencyKey", async () => {
    returnOrder.mockRejectedValueOnce({ response: { status: 500, data: {} } });
    renderPage();

    await screen.findByText("Widget");
    fireEvent.click(screen.getByText(/page.salesReturn.create.add/));
    fireEvent.change(screen.getByDisplayValue("page.salesReturn.create.reasonPlaceholder"), {
      target: { value: "page.salesReturn.create.reason.damaged" }
    });
    fireEvent.click(screen.getByText("page.salesReturn.create.submit"));
    fireEvent.click(await screen.findByText("page.salesReturn.create.confirmButton"));
    await waitFor(() => expect(returnOrder).toHaveBeenCalledTimes(1));
    const firstKey = returnOrder.mock.calls[0][1].idempotencyKey;

    // A genuine edit (different reason) must not silently reuse the
    // stale key from the earlier, different draft.
    fireEvent.change(screen.getByDisplayValue("page.salesReturn.create.reason.damaged"), {
      target: { value: "page.salesReturn.create.reason.defective" }
    });
    returnOrder.mockResolvedValueOnce({ data: { id: 10, status: "pending" } });
    fireEvent.click(screen.getByText("page.salesReturn.create.submit"));
    fireEvent.click(await screen.findByText("page.salesReturn.create.confirmButton"));
    await waitFor(() => expect(returnOrder).toHaveBeenCalledTimes(2));
    const secondKey = returnOrder.mock.calls[1][1].idempotencyKey;
    expect(secondKey).not.toBe(firstKey);
  });

  test("a 409 conflict response surfaces the conflict-specific toast", async () => {
    returnOrder.mockRejectedValueOnce({
      response: { status: 409, data: { message: "Refund exceeds remaining refundable amount" } }
    });
    renderPage();

    await screen.findByText("Widget");
    fireEvent.click(screen.getByText(/page.salesReturn.create.add/));
    fireEvent.change(screen.getByDisplayValue("page.salesReturn.create.reasonPlaceholder"), {
      target: { value: "page.salesReturn.create.reason.damaged" }
    });
    fireEvent.click(screen.getByText("page.salesReturn.create.submit"));
    fireEvent.click(await screen.findByText("page.salesReturn.create.confirmButton"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Refund exceeds remaining refundable amount")
    );
  });
});
