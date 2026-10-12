import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { toast } from "sonner";
import CashMovements from "../page/cash-register/components/CashMovements";
import {
  listCashMovements,
  createCashMovement,
  decideCashMovement
} from "../services/cash-register";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      const dict = {
        "page.cashRegister.movements.title": "Cash Movements",
        "page.cashRegister.movements.recordBtn": "Record Movement",
        "page.cashRegister.movements.empty": "No cash movements recorded yet",
        "page.cashRegister.movements.type.cash_in": "Cash In",
        "page.cashRegister.movements.type.cash_out": "Cash Out",
        "page.cashRegister.movements.status.pending_approval": "Pending Approval",
        "page.cashRegister.movements.status.active": "Active",
        "page.cashRegister.movements.status.rejected": "Rejected",
        "page.cashRegister.movements.status.reversed": "Reversed",
        "page.cashRegister.movements.reason.owner_draw": "Owner Draw",
        "page.cashRegister.movements.reason.float_topup": "Float Top-up",
        "page.cashRegister.movements.amountPositive": "Amount must be a positive whole number",
        "page.cashRegister.movements.notesRequiredForOther":
          "Notes are required when the reason is Other",
        "page.cashRegister.movements.recordFailed": "Failed to record cash movement",
        "page.cashRegister.movements.decideFailed": "Failed to decide cash movement",
        "page.cashRegister.movements.approve": "Approve",
        "page.cashRegister.movements.reject": "Reject",
        "page.cashRegister.movements.reverse": "Reverse",
        "page.cashRegister.movements.approveAria": "Approve movement #{{id}}",
        "page.cashRegister.movements.rejectAria": "Reject movement #{{id}}",
        "page.cashRegister.movements.reverseAria": "Reverse movement #{{id}}",
        "page.cashRegister.movements.reasonLabel": "Reason",
        "page.cashRegister.movements.amountLabel": "Amount (IDR)",
        "common.save": "Save"
      };
      let s = dict[k] || (typeof opts === "string" ? opts : k);
      const params = typeof opts === "object" && opts ? opts : {};
      for (const [key, value] of Object.entries(params)) {
        s = s.replaceAll(`{{${key}}}`, String(value)).replaceAll(`#{${key}}`, String(value));
      }
      return s;
    }
  })
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

jest.mock("../services/cash-register", () => ({
  listCashMovements: jest.fn(),
  createCashMovement: jest.fn(),
  decideCashMovement: jest.fn(),
  reverseCashMovement: jest.fn()
}));

const renderComponent = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CashMovements registerId={7} canManage {...props} />
    </QueryClientProvider>
  );
};

const pendingMovement = {
  id: 11,
  cashRegisterId: 7,
  store: 3,
  type: "cash_out",
  reasonCode: "owner_draw",
  amount: 700000,
  notes: null,
  status: "pending_approval"
};

const activeMovement = {
  id: 12,
  cashRegisterId: 7,
  store: 3,
  type: "cash_in",
  reasonCode: "float_topup",
  amount: 30000,
  notes: "paguyuban",
  status: "active"
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("lists movements newest-first with status and approve/reject actions for pending rows", async () => {
  listCashMovements.mockResolvedValueOnce({ data: [pendingMovement, activeMovement] });
  renderComponent();

  expect(await screen.findByText("Owner Draw")).toBeInTheDocument();
  expect(
    await screen.findByText(
      (_, el) => el?.tagName === "P" && (el?.textContent || "").includes("paguyuban")
    )
  ).toBeInTheDocument();
  expect(screen.getByText("Pending Approval")).toBeInTheDocument();
  expect(screen.getByText("Active")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Approve movement #11" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reject movement #11" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reverse movement #12" })).toBeInTheDocument();
});

test("empty list renders the empty state and no action buttons", async () => {
  listCashMovements.mockResolvedValueOnce({ data: [] });
  renderComponent();

  expect(await screen.findByText("No cash movements recorded yet")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Approve movement/ })).not.toBeInTheDocument();
});

test("non-managing roles see no record or decision actions", async () => {
  listCashMovements.mockResolvedValueOnce({ data: [pendingMovement] });
  renderComponent({ canManage: false });

  expect(await screen.findByText("Pending Approval")).toBeInTheDocument();
  expect(screen.queryByText("Record Movement")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Approve movement/ })).not.toBeInTheDocument();
});

test("approving a pending movement calls the decide endpoint and refetches", async () => {
  listCashMovements
    .mockResolvedValueOnce({ data: [pendingMovement] })
    .mockResolvedValueOnce({ data: [{ ...pendingMovement, status: "active" }] });
  decideCashMovement.mockResolvedValueOnce({ data: { ...pendingMovement, status: "active" } });
  renderComponent();

  fireEvent.click(await screen.findByRole("button", { name: "Approve movement #11" }));

  await waitFor(() => expect(decideCashMovement).toHaveBeenCalledWith(11, "approve"));
  expect(await screen.findByText("Active")).toBeInTheDocument();
});

test("record form rejects a non-positive amount without calling the API", async () => {
  listCashMovements.mockResolvedValueOnce({ data: [] });
  renderComponent();

  fireEvent.click(await screen.findByText("Record Movement"));
  fireEvent.click(screen.getByText("Save"));

  expect(await screen.findByText("Amount must be a positive whole number")).toBeInTheDocument();
  expect(createCashMovement).not.toHaveBeenCalled();
});

test("record form requires notes when reason is Other", async () => {
  listCashMovements.mockResolvedValueOnce({ data: [] });
  renderComponent();

  fireEvent.click(await screen.findByText("Record Movement"));
  fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "other" } });
  fireEvent.change(screen.getByPlaceholderText("50000"), { target: { value: "15000" } });
  fireEvent.click(screen.getByText("Save"));

  expect(
    await screen.findByText("Notes are required when the reason is Other")
  ).toBeInTheDocument();
  expect(createCashMovement).not.toHaveBeenCalled();
});

test("failed decide surfaces the server message and keeps the row pending", async () => {
  listCashMovements.mockResolvedValueOnce({ data: [pendingMovement] });
  decideCashMovement.mockRejectedValueOnce({
    response: { data: { message: "Movement already decided" } }
  });
  renderComponent();

  fireEvent.click(await screen.findByRole("button", { name: "Approve movement #11" }));

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to decide cash movement",
      expect.objectContaining({ description: "Movement already decided" })
    )
  );
  expect(screen.getByText("Pending Approval")).toBeInTheDocument();
});
