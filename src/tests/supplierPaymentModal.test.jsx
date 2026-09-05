import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SupplierPaymentModal from "../components/organism/supplier-payment-modal";
import { recordPayment } from "../services/purchase-payment";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ date, setDate }) => (
    <input
      aria-label="payment-date"
      value={date ? date.toISOString() : ""}
      onChange={(e) => setDate && setDate(new Date(e.target.value))}
    />
  )
}));

jest.mock("../services/purchase-payment", () => ({
  recordPayment: jest.fn()
}));

const orders = [
  {
    id: 11,
    orderNumber: "PO-011",
    finalAmount: "150000",
    payments: []
  },
  {
    id: 12,
    orderNumber: "PO-012",
    finalAmount: "100000",
    payments: [{ amount: "100000" }]
  }
];

describe("SupplierPaymentModal", () => {
  beforeEach(() => {
    recordPayment.mockReset();
    recordPayment.mockResolvedValue({ data: { id: 1 } });
  });

  test("submits the auto-selected outstanding PO, never null", async () => {
    const onSuccess = jest.fn();
    render(
      <SupplierPaymentModal
        open
        supplierId={5}
        purchaseOrders={orders}
        onOpenChange={jest.fn()}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "25000" } });
    fireEvent.click(screen.getByText("page.supplier.detail.modal.confirm"));

    await waitFor(() => expect(recordPayment).toHaveBeenCalledTimes(1));
    const payload = recordPayment.mock.calls[0][0];
    expect(payload.purchaseOrder).toBe(11);
    expect(payload.supplier).toBe(5);
    expect(payload.amount).toBe(25000);
    expect(onSuccess).toHaveBeenCalled();
  });

  test("sends an idempotency key for the modal session, refreshed on reopen", async () => {
    const { unmount } = render(
      <SupplierPaymentModal
        open
        supplierId={5}
        purchaseOrders={orders}
        onOpenChange={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "25000" } });
    fireEvent.click(screen.getByText("page.supplier.detail.modal.confirm"));
    await waitFor(() => expect(recordPayment).toHaveBeenCalledTimes(1));

    const firstKey = recordPayment.mock.calls[0][0].idempotencyKey;
    expect(firstKey).toBeTruthy();

    unmount();
    render(
      <SupplierPaymentModal
        open
        supplierId={5}
        purchaseOrders={orders}
        onOpenChange={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "30000" } });
    fireEvent.click(screen.getByText("page.supplier.detail.modal.confirm"));
    await waitFor(() => expect(recordPayment).toHaveBeenCalledTimes(2));

    const secondKey = recordPayment.mock.calls[1][0].idempotencyKey;
    expect(secondKey).toBeTruthy();
    expect(secondKey).not.toBe(firstKey);
  });

  test("rejects submit when the amount is not positive", async () => {
    render(
      <SupplierPaymentModal
        open
        supplierId={5}
        purchaseOrders={orders}
        onOpenChange={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("page.supplier.detail.modal.confirm"));

    await waitFor(() => expect(recordPayment).not.toHaveBeenCalled());
  });

  test("keeps the modal open (never calls onOpenChange) when the amount is invalid", async () => {
    const onOpenChange = jest.fn();
    render(
      <SupplierPaymentModal
        open
        supplierId={5}
        purchaseOrders={orders}
        onOpenChange={onOpenChange}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("page.supplier.detail.modal.confirm"));

    await waitFor(() => expect(recordPayment).not.toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test("keeps the modal open when recordPayment rejects", async () => {
    recordPayment.mockRejectedValue(new Error("network down"));
    const onOpenChange = jest.fn();
    render(
      <SupplierPaymentModal
        open
        supplierId={5}
        purchaseOrders={orders}
        onOpenChange={onOpenChange}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "25000" } });
    fireEvent.click(screen.getByText("page.supplier.detail.modal.confirm"));

    await waitFor(() => expect(recordPayment).toHaveBeenCalledTimes(1));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
