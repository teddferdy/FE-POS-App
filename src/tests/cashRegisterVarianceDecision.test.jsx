import React from "react";
import { render, screen, within, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import fs from "fs";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterHistory from "../page/cash-register/CashRegisterHistory";
import CashRegisterDetail from "../page/cash-register/CashRegisterDetail";
import { getCashRegisterHistory, getZReport, decideCashVariance } from "@/services/cash-register";
import { toast } from "sonner";

// DR-15 (BA §35.7): the cash-variance decision is wired for MVP. A register
// closed with a variance beyond the outlet tolerance is stored as
// varianceApprovalStatus = "pending_approval" and only a super_admin may
// approve/reject it (PUT /cash-register/:id/decide-variance). The
// translator below resolves keys against the runtime dictionaries
// (public/locales) with {{var}} interpolation, so assertions use the real
// EN/ID copy users see.
//
// Paths below are repo-relative string literals: jest always runs from the
// repository root (locally and in CI), so no path computation is needed.
const RUNTIME_EN = JSON.parse(fs.readFileSync("public/locales/en/translation.json", "utf8"));
const RUNTIME_ID = JSON.parse(fs.readFileSync("public/locales/id/translation.json", "utf8"));
const mockLocales = {
  en: new Map(Object.entries(RUNTIME_EN)),
  id: new Map(Object.entries(RUNTIME_ID))
};
const mockState = { lng: "en", roleType: "super_admin", locationItem: undefined };

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => {
      const v = (mockState.lng === "id" ? mockLocales.id : mockLocales.en).get(k);
      if (typeof v !== "string") return k;
      return v.replace(/{{\s*(\w+)\s*}}/g, (m, name) =>
        opts && opts[name] != null ? String(opts[name]) : m
      );
    },
    i18n: { language: mockState.lng, changeLanguage: jest.fn() }
  })
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1", user: { id: 9, roleType: mockState.roleType, store: 1 } }]
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));

jest.mock("@/services/cash-register", () => ({
  getCashRegisterHistory: jest.fn(),
  closeCashRegister: jest.fn(),
  getZReport: jest.fn(),
  decideCashVariance: jest.fn()
}));

jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));

jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn(() => Promise.resolve({ data: [], pagination: { total: 0 } }))
}));

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

jest.mock("@/hooks/useGlobalStoreFilter", () => ({
  useGlobalStoreFilter: () => ["all", jest.fn()]
}));

jest.mock("@/components/ui/StoreFilter", () => () => null);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { item: mockState.locationItem } })
}));

const BASE_ROW = {
  id: 2,
  store: 1,
  status: "closed",
  openingBalance: 200000,
  totalSales: 1110000,
  totalExpenses: 0,
  closingBalance: 1340000,
  variance: 30000,
  openedAt: "2026-10-09T02:09:07.000Z",
  closedAt: "2026-10-09T10:00:00.000Z",
  storeData: { name: "Outlet Satu" },
  userData: { fullName: "Kasir Satu" },
  createdByUser: { fullName: "Kasir Satu" },
  modifiedByUser: { fullName: "Kasir Satu" }
};

const row = (overrides) => ({ ...BASE_ROW, ...overrides });

const axiosError = (status) => {
  const err = new Error(`Request failed with status code ${status}`);
  err.response = { status, data: { success: false, message: "server says no" } };
  return err;
};

const networkError = () => {
  const err = new Error("Network Error");
  err.request = {};
  return err;
};

const renderWithClient = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
};

const historyResponse = (rows) => ({
  data: rows,
  pagination: { total: rows.length, totalPages: 1 }
});

const renderHistory = (rows) => {
  getCashRegisterHistory.mockResolvedValue(historyResponse(rows));
  return renderWithClient(<CashRegisterHistory />);
};

// Snapshot-path Z-report (closed register with a persisted close snapshot):
// the backend reports summary.varianceApprovalStatus.
const snapshotReport = (status, varianceApprovalStatus, variance = 30000) => ({
  data: {
    register: {
      id: 2,
      status,
      openingBalance: 200000,
      closingBalance: 1340000,
      openedAt: BASE_ROW.openedAt,
      closedAt: BASE_ROW.closedAt
    },
    store: { id: 1, name: "Outlet Satu", timezone: "Asia/Jakarta" },
    summary: {
      totalSales: 1110000,
      totalExpenses: 0,
      expectedCash: 1310000,
      variance,
      varianceApprovalStatus
    }
  }
});

// Legacy live Z-report (register closed before snapshots existed): the
// backend summary carries no varianceApprovalStatus at all.
const legacyReport = () => {
  const r = snapshotReport("closed", null);
  delete r.data.summary.varianceApprovalStatus;
  return r;
};

const renderDetail = (navItem, report) => {
  mockState.locationItem = navItem;
  getZReport.mockResolvedValue(report);
  return renderWithClient(<CashRegisterDetail />);
};

const reviewRegion = () => screen.findByRole("region", { name: "Variance review" });

beforeEach(() => {
  jest.clearAllMocks();
  mockState.lng = "en";
  mockState.roleType = "super_admin";
  mockState.locationItem = undefined;
});

describe("CashRegisterHistory — variance approval status", () => {
  test("closed + pending shows the awaiting-approval status with Approve and Reject for super_admin", async () => {
    renderHistory([row({ varianceApprovalStatus: "pending_approval" })]);

    expect(await screen.findByText("Awaiting approval")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled();
  });

  test.each([
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["auto_approved", "Within tolerance"]
  ])("closed + %s shows %s and no decision controls", async (status, label) => {
    renderHistory([row({ varianceApprovalStatus: status })]);

    expect(await screen.findByText(label)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
  });

  test("an open register shows no approval status and no decision controls", async () => {
    renderHistory([row({ status: "open", closedAt: null, varianceApprovalStatus: null })]);

    await screen.findByText("Outlet Satu");
    expect(screen.queryByText("Awaiting approval")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("an open register whose row still carries a pending status is never actionable", async () => {
    renderHistory([
      row({ status: "open", closedAt: null, varianceApprovalStatus: "pending_approval" })
    ]);

    await screen.findByText("Outlet Satu");
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("admin sees the pending status read-only", async () => {
    mockState.roleType = "admin";
    renderHistory([row({ varianceApprovalStatus: "pending_approval" })]);

    expect(await screen.findByText("Awaiting approval")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
  });

  test("Indonesian locale renders the Indonesian status and actions", async () => {
    mockState.lng = "id";
    renderHistory([row({ varianceApprovalStatus: "pending_approval" })]);

    expect(await screen.findByText("Menunggu persetujuan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Setujui" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tolak" })).toBeInTheDocument();
  });

  test("the existing variance amount caption is unchanged", async () => {
    renderHistory([row({ varianceApprovalStatus: "pending_approval" })]);

    const cell = await screen.findByTestId("closing-balance-2");
    expect(cell).toHaveTextContent("Rp 1.340.000");
    expect(cell).toHaveTextContent("Variance +Rp 30.000");
  });
});

describe("CashRegisterHistory — decision interactions", () => {
  const openDialog = async (name) => {
    renderHistory([row({ varianceApprovalStatus: "pending_approval" })]);
    fireEvent.click(await screen.findByRole("button", { name }));
    return screen.findByRole("dialog");
  };

  test("Approve asks for confirmation; cancelling sends no request", async () => {
    const dialog = await openDialog("Approve");

    expect(within(dialog).getByText("Approve variance?")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(decideCashVariance).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("confirming Approve calls the service with the register id and refreshes the list", async () => {
    decideCashVariance.mockResolvedValue({
      success: true,
      data: { id: 2, status: "closed", varianceApprovalStatus: "approved" }
    });
    const dialog = await openDialog("Approve");
    const callsBefore = getCashRegisterHistory.mock.calls.length;

    getCashRegisterHistory.mockResolvedValue(
      historyResponse([row({ varianceApprovalStatus: "approved" })])
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve variance" }));

    await waitFor(() => expect(decideCashVariance).toHaveBeenCalledWith(2, "approve"));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Variance approved"));
    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(getCashRegisterHistory.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Reject confirms that the register is not reopened and calls the service with reject", async () => {
    decideCashVariance.mockResolvedValue({
      success: true,
      data: { id: 2, status: "closed", varianceApprovalStatus: "rejected" }
    });
    const dialog = await openDialog("Reject");

    expect(within(dialog).getByText("Reject variance?")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("does not reopen the register");
    expect(dialog).toHaveTextContent("Rp 30.000");

    getCashRegisterHistory.mockResolvedValue(
      historyResponse([row({ varianceApprovalStatus: "rejected" })])
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject variance" }));

    await waitFor(() => expect(decideCashVariance).toHaveBeenCalledWith(2, "reject"));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Variance rejected"));
    expect(await screen.findByText("Rejected")).toBeInTheDocument();
  });

  test("while the request is in flight both actions are disabled and repeated confirms send one request", async () => {
    let resolve;
    decideCashVariance.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    );
    const dialog = await openDialog("Approve");
    const confirm = within(dialog).getByRole("button", { name: "Approve variance" });

    fireEvent.click(confirm);
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Loading" })).toBeDisabled()
    );
    expect(screen.getByRole("button", { name: "Approve", hidden: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject", hidden: true })).toBeDisabled();
    expect(decideCashVariance).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve({ success: true, data: { id: 2, varianceApprovalStatus: "approved" } });
    });
  });

  test("409 explains the state changed and reloads the authoritative list", async () => {
    decideCashVariance.mockRejectedValue(axiosError(409));
    const dialog = await openDialog("Approve");
    const callsBefore = getCashRegisterHistory.mock.calls.length;

    getCashRegisterHistory.mockResolvedValue(
      historyResponse([row({ varianceApprovalStatus: "approved" })])
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve variance" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This register is no longer awaiting approval. The latest status has been loaded."
      )
    );
    await waitFor(() =>
      expect(getCashRegisterHistory.mock.calls.length).toBeGreaterThan(callsBefore)
    );
    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  test("403 shows an access-denied message without crashing", async () => {
    decideCashVariance.mockRejectedValue(axiosError(403));
    const dialog = await openDialog("Reject");

    fireEvent.click(within(dialog).getByRole("button", { name: "Reject variance" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("You don't have permission to decide this variance.")
    );
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  test("a 5xx failure keeps the register pending and the actions available for retry", async () => {
    decideCashVariance.mockRejectedValue(axiosError(500));
    const dialog = await openDialog("Approve");

    fireEvent.click(within(dialog).getByRole("button", { name: "Approve variance" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("The decision could not be saved. Please try again.")
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled());
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
  });

  test("a network failure never claims success", async () => {
    decideCashVariance.mockRejectedValue(networkError());
    const dialog = await openDialog("Approve");

    fireEvent.click(within(dialog).getByRole("button", { name: "Approve variance" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't reach the server. The decision was not saved. Check your connection and try again."
      )
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
  });
});

describe("CashRegisterDetail — variance review", () => {
  const PENDING_NAV = row({ varianceApprovalStatus: "pending_approval" });

  test("authoritative pending status from the Z-report enables the decision for super_admin", async () => {
    renderDetail(PENDING_NAV, snapshotReport("closed", "pending_approval"));

    const region = await reviewRegion();
    await within(region).findByText("Awaiting approval");
    expect(await within(region).findByRole("button", { name: "Approve" })).toBeEnabled();
    expect(within(region).getByRole("button", { name: "Reject" })).toBeEnabled();
  });

  test("stale navigation state saying pending is overridden by the authoritative Z-report", async () => {
    renderDetail(PENDING_NAV, snapshotReport("closed", "approved"));

    const region = await reviewRegion();
    expect(await within(region).findByText("Approved")).toBeInTheDocument();
    expect(within(region).queryByText("Awaiting approval")).not.toBeInTheDocument();
    expect(within(region).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("no decision is offered while only navigation state is known", async () => {
    getZReport.mockImplementation(() => new Promise(() => {}));
    mockState.locationItem = PENDING_NAV;
    renderWithClient(<CashRegisterDetail />);

    const region = await reviewRegion();
    expect(within(region).getByText("Awaiting approval")).toBeInTheDocument();
    expect(within(region).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("a legacy Z-report without the status keeps the row status read-only and points to the history list", async () => {
    renderDetail(PENDING_NAV, legacyReport());

    const region = await reviewRegion();
    await waitFor(() => expect(getZReport).toHaveBeenCalled());
    expect(
      await within(region).findByText(
        "Approve or reject this variance from the Register History list."
      )
    ).toBeInTheDocument();
    expect(within(region).getByText("Awaiting approval")).toBeInTheDocument();
    expect(within(region).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("admin sees the authoritative pending status without decision controls", async () => {
    mockState.roleType = "admin";
    renderDetail(PENDING_NAV, snapshotReport("closed", "pending_approval"));

    const region = await reviewRegion();
    await within(region).findByText("Awaiting approval");
    expect(within(region).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("an open register shows no variance review", async () => {
    renderDetail(
      row({ status: "open", closedAt: null, varianceApprovalStatus: null }),
      snapshotReport("open", null)
    );

    await screen.findAllByText("Outlet Satu");
    await waitFor(() => expect(getZReport).toHaveBeenCalled());
    expect(screen.queryByRole("region", { name: "Variance review" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  test("approving shows the decided status in place and reloads the Z-report", async () => {
    decideCashVariance.mockResolvedValue({
      success: true,
      data: { id: 2, status: "closed", varianceApprovalStatus: "approved" }
    });
    renderDetail(PENDING_NAV, snapshotReport("closed", "pending_approval"));

    const region = await reviewRegion();
    fireEvent.click(await within(region).findByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    const zCallsBefore = getZReport.mock.calls.length;
    getZReport.mockResolvedValue(snapshotReport("closed", "approved"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve variance" }));

    await waitFor(() => expect(decideCashVariance).toHaveBeenCalledWith(2, "approve"));
    expect(await within(region).findByText("Approved")).toBeInTheDocument();
    expect(within(region).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    await waitFor(() => expect(getZReport.mock.calls.length).toBeGreaterThan(zCallsBefore));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("a rejected variance states that the register stays closed with unchanged figures", async () => {
    renderDetail(row({ varianceApprovalStatus: "rejected" }), snapshotReport("closed", "rejected"));

    const region = await reviewRegion();
    expect(await within(region).findByText("Rejected")).toBeInTheDocument();
    expect(
      within(region).getByText(
        "Decision recorded. The register stays closed and its figures are unchanged."
      )
    ).toBeInTheDocument();
  });

  test("409 on the detail page reloads the authoritative status", async () => {
    decideCashVariance.mockRejectedValue(axiosError(409));
    renderDetail(PENDING_NAV, snapshotReport("closed", "pending_approval"));

    const region = await reviewRegion();
    fireEvent.click(await within(region).findByRole("button", { name: "Reject" }));
    const dialog = await screen.findByRole("dialog");
    getZReport.mockResolvedValue(snapshotReport("closed", "approved"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject variance" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This register is no longer awaiting approval. The latest status has been loaded."
      )
    );
    expect(await within(region).findByText("Approved")).toBeInTheDocument();
  });

  test("Indonesian locale renders the Indonesian review copy", async () => {
    mockState.lng = "id";
    renderDetail(PENDING_NAV, snapshotReport("closed", "pending_approval"));

    const region = await screen.findByRole("region", { name: "Tinjauan selisih" });
    expect(await within(region).findByText("Menunggu persetujuan")).toBeInTheDocument();
    expect(await within(region).findByRole("button", { name: "Setujui" })).toBeInTheDocument();
  });
});
