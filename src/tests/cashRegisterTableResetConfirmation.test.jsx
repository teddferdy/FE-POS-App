import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterOpenClose from "../page/cash-register/CashRegisterOpenClose";
import { openCashRegister, getOpenRegisters, getTableResetPreview } from "@/services/cash-register";
import { getAllLocation, getLocationDetail } from "@/services/location";
import { toast } from "sonner";

// Phase 39 Batch 6C: table reset on register open. Locked spec: the
// eligibility preview is fetched fresh right after the (unaffected)
// "store already has an open register" guard; a confirmation dialog only
// appears when eligibleCount > 0; cleanup is best-effort (a partial/full
// BE-reported failure surfaces as a warning toast, never blocks/undoes a
// successful register open).

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      if (!opts) return k;
      const val = opts.count ?? opts.failed ?? opts.time ?? opts.amount ?? opts.balance;
      return val != null ? `${k}:${val}` : k;
    }
  })
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1", user: { id: 1, roleType: "super_admin", store: "1" } }]
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn() }
}));

jest.mock("@/services/cash-register", () => ({
  openCashRegister: jest.fn(),
  getOpenRegisters: jest.fn(),
  getTableResetPreview: jest.fn()
}));

jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(),
  getLocationDetail: jest.fn()
}));

jest.mock("@/services/invoice", () => ({
  getWhatsAppStatus: jest.fn(() => Promise.resolve({ data: { ready: true } })),
  restartWhatsApp: jest.fn()
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

const renderWithQuery = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CashRegisterOpenClose />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("Phase 39 Batch 6C — table-reset confirmation on register open", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllLocation.mockResolvedValue({ data: [{ id: 1, name: "Store A" }] });
    getLocationDetail.mockResolvedValue({
      data: { id: 1, timezone: "Asia/Jakarta", openingHours: [] }
    });
    getOpenRegisters.mockResolvedValue({ data: [] });
    openCashRegister.mockResolvedValue({
      success: true,
      data: { id: 501 },
      tableCleanupResult: { attempted: false, succeeded: 0, failed: 0 }
    });
  });

  const clickOpen = async () => {
    fireEvent.click(await screen.findByText("Rp 100.000"));
    // handleOpenClick is async (awaits the preview fetch) — wrap in act()
    // so its post-await state updates are flushed deterministically rather
    // than leaking into whatever assertion runs next.
    await act(async () => {
      fireEvent.click(screen.getByText(/page\.cashRegister\.openClose\.openWithAmount/));
    });
  };

  test("Test 1 — eligibleCount === 0: no confirmation dialog, opens directly", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 0 } });
    renderWithQuery();
    await clickOpen();

    await waitFor(() => expect(openCashRegister).toHaveBeenCalled());
    expect(openCashRegister).toHaveBeenCalledWith(
      expect.objectContaining({ confirmTableReset: false })
    );
    expect(
      screen.queryByText("page.cashRegister.openClose.tableResetConfirmTitle")
    ).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/cash-register/current");
  });

  test("Test 2 — eligibleCount > 0: confirmation dialog appears with the count, register not yet opened", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 3 } });
    renderWithQuery();
    await clickOpen();

    expect(
      await screen.findByText("page.cashRegister.openClose.tableResetConfirmDesc:3")
    ).toBeInTheDocument();
    expect(openCashRegister).not.toHaveBeenCalled();
  });

  test("Test 3 — Cancel: register is not opened, no table mutation triggered", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 2 } });
    renderWithQuery();
    await clickOpen();

    await screen.findByText("page.cashRegister.openClose.tableResetConfirmDesc:2");
    fireEvent.click(screen.getByText("common.cancel"));

    await waitFor(() =>
      expect(
        screen.queryByText("page.cashRegister.openClose.tableResetConfirmDesc:2")
      ).not.toBeInTheDocument()
    );
    expect(openCashRegister).not.toHaveBeenCalled();
  });

  test("Test 4 — Confirm: register opening proceeds with confirmTableReset: true", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 2 } });
    renderWithQuery();
    await clickOpen();

    fireEvent.click(await screen.findByText("page.cashRegister.openClose.tableResetConfirmButton"));

    await waitFor(() =>
      expect(openCashRegister).toHaveBeenCalledWith(
        expect.objectContaining({ confirmTableReset: true })
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith("/cash-register/current");
  });

  test("Test 5 — a BE-reported cleanup failure surfaces a warning toast, register open still succeeds", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 2 } });
    openCashRegister.mockResolvedValue({
      success: true,
      data: { id: 502 },
      tableCleanupResult: { attempted: true, succeeded: 1, failed: 1, warning: "1 failed" }
    });
    renderWithQuery();
    await clickOpen();
    fireEvent.click(await screen.findByText("page.cashRegister.openClose.tableResetConfirmButton"));

    await waitFor(() =>
      expect(toast.warning).toHaveBeenCalledWith("page.cashRegister.openClose.tableResetWarning:1")
    );
    // A cleanup warning is not a register-open failure.
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/cash-register/current");
  });

  test("Test 6 — the existing 'store already open' guard still prevents opening, before any preview fetch", async () => {
    getOpenRegisters.mockResolvedValue({ data: [{ store: 1 }] });
    renderWithQuery();
    await clickOpen();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "page.cashRegister.openClose.fail",
        expect.objectContaining({ description: "page.cashRegister.openClose.storeOpenError" })
      )
    );
    expect(getTableResetPreview).not.toHaveBeenCalled();
    expect(openCashRegister).not.toHaveBeenCalled();
  });

  test("Test 7 — the zero-eligible case adds no extra friction to normal opening", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 0 } });
    renderWithQuery();
    const balanceBtn = await screen.findByText("Rp 100.000");
    fireEvent.click(balanceBtn);
    const openBtn = screen
      .getByText(/page\.cashRegister\.openClose\.openWithAmount/)
      .closest("button");
    expect(openBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(openBtn);
    });
    await waitFor(() => expect(openCashRegister).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByText("page.cashRegister.openClose.tableResetConfirmTitle")
    ).not.toBeInTheDocument();
  });

  test("Test 8 — existing error handling remains intact when register open itself fails", async () => {
    getTableResetPreview.mockResolvedValue({ data: { eligibleCount: 0 } });
    openCashRegister.mockRejectedValue({
      response: { data: { message: "Server exploded" } }
    });
    renderWithQuery();
    await clickOpen();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "page.cashRegister.openClose.fail",
        expect.objectContaining({ description: "Server exploded" })
      )
    );
    expect(mockNavigate).not.toHaveBeenCalledWith("/cash-register/current");
  });
});
