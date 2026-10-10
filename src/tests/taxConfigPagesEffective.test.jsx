import React from "react";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

// P1 effective-tax summary — integration into the tax list and detail pages:
// scope labels, backend-owned summary independent of list pagination,
// detail-page contributing rows, and the corrected back navigation.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

const mockNavigate = jest.fn();
let mockSearchId = "7";
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(`id=${mockSearchId}`)]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: "id", changeLanguage: jest.fn() } })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));

let mockUser = { id: 1, roleType: "super_admin", store: "3" };
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockUser }, jest.fn(), jest.fn()]
}));
jest.mock("@/hooks/useUserSession", () => ({
  useUserSession: () => mockUser
}));
let mockStore = { activeStoreId: "3", activeStoreName: "Outlet Tiga", isSuperAdmin: true };
jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ ...mockStore, setActiveStore: jest.fn() })
}));
jest.mock("@/services/session", () => ({
  endSession: jest.fn(),
  SESSION_END_REASON: { LOGOUT: "logout", EXPIRED: "expired" }
}));

const mockGetAllTaxConfig = jest.fn();
const mockGetTaxConfigById = jest.fn();
const mockGetEffectiveTax = jest.fn();
jest.mock("@/services/tax-config", () => ({
  getAllTaxConfig: (...a) => mockGetAllTaxConfig(...a),
  getTaxConfigById: (...a) => mockGetTaxConfigById(...a),
  getEffectiveTax: (...a) => mockGetEffectiveTax(...a),
  deleteTaxConfig: jest.fn(),
  downloadTaxConfigTemplate: jest.fn(),
  downloadTaxConfigExcel: jest.fn(),
  uploadTaxConfigExcel: jest.fn()
}));
const mockGetAllLocation = jest.fn();
jest.mock("@/services/location", () => ({
  getAllLocation: (...a) => mockGetAllLocation(...a)
}));
jest.mock("@/components/organism/UploadExcelModal", () => () => null);

import TaxConfigList from "@/page/tax-config/TaxConfigList";
import DetailTaxConfig from "@/page/tax-config/DetailTaxConfig";

const renderWithClient = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
};

const globalRow = { id: 1, name: "PPN 11%", rate: 11, type: "ppn", status: "active", store: null };
const outletRow = { id: 2, name: "PPN Outlet", rate: 10, type: "ppn", status: "active", store: 3 };
const effective22 = {
  success: true,
  data: {
    store: 3,
    channel: "counter",
    ppn: {
      status: "configured",
      rate: 22,
      rows: [
        { id: 1, name: "PPN 11%", rate: 11, scope: "global" },
        { id: 7, name: "12", rate: 11, scope: "global" }
      ]
    },
    serviceCharge: { status: "absent", rate: 0, rows: [] },
    findings: [
      {
        code: "MULTIPLE_ACTIVE_SAME_SCOPE",
        severity: "warning",
        message: "...",
        policyRef: "D3",
        decision: "undecided"
      }
    ]
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchId = "7";
  mockUser = { id: 1, roleType: "super_admin", store: "3" };
  mockStore = { activeStoreId: "3", activeStoreName: "Outlet Tiga", isSuperAdmin: true };
  mockGetAllLocation.mockResolvedValue({ data: [{ id: 3, name: "Outlet Tiga" }] });
  mockGetEffectiveTax.mockResolvedValue(effective22);
});

describe("TaxConfigList — scope column and effective summary", () => {
  test("labels global and outlet rows by scope using outlet names, not ids", async () => {
    mockGetAllTaxConfig.mockResolvedValue({
      success: true,
      data: [globalRow, outletRow],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      stats: { total: 2, active: 2, draft: 0, inactive: 0 }
    });
    renderWithClient(<TaxConfigList />);

    expect(await screen.findByText("page.taxConfig.scope.column")).toBeInTheDocument();
    const globalCell = (await screen.findByText("PPN 11%", { selector: "td *, td" })).closest("tr");
    expect(within(globalCell).getByText("page.taxConfig.scope.global")).toBeInTheDocument();
    const outletCell = screen.getByText("PPN Outlet").closest("tr");
    expect(await within(outletCell).findByText("Outlet Tiga")).toBeInTheDocument();
  });

  test("an outlet admin sees their own outlet name on outlet rows", async () => {
    mockUser = { id: 2, roleType: "admin", store: "3" };
    mockStore = { activeStoreId: "3", activeStoreName: "Kedai Tiga", isSuperAdmin: false };
    mockGetAllTaxConfig.mockResolvedValue({
      success: true,
      data: [outletRow],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      stats: {}
    });
    renderWithClient(<TaxConfigList />);
    const row = (await screen.findByText("PPN Outlet")).closest("tr");
    expect(within(row).getByText("Kedai Tiga")).toBeInTheDocument();
    expect(mockGetAllLocation).not.toHaveBeenCalled();
  });

  test("the summary comes from the backend for the active outlet, independent of the paginated list", async () => {
    // The visible page holds a single row; the backend summary covers both.
    mockGetAllTaxConfig.mockResolvedValue({
      success: true,
      data: [globalRow],
      pagination: { page: 1, limit: 1, total: 2, totalPages: 2 },
      stats: {}
    });
    renderWithClient(<TaxConfigList />);

    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("22%");
    expect(mockGetEffectiveTax).toHaveBeenCalledWith({ store: 3, channel: "counter" });
    expect(screen.getByTestId("finding-MULTIPLE_ACTIVE_SAME_SCOPE")).toBeInTheDocument();
  });

  test("a super admin with no outlet selected gets the global-scope summary", async () => {
    mockStore = { activeStoreId: null, activeStoreName: "", isSuperAdmin: true };
    mockUser = { id: 1, roleType: "super_admin", store: null };
    mockGetEffectiveTax.mockResolvedValue({
      ...effective22,
      data: { ...effective22.data, store: null }
    });
    mockGetAllTaxConfig.mockResolvedValue({ success: true, data: [], pagination: {}, stats: {} });
    renderWithClient(<TaxConfigList />);
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("22%");
    expect(mockGetEffectiveTax).toHaveBeenCalledWith({ store: null, channel: "counter" });
  });

  test("a list failure keeps its existing error state and the summary still loads", async () => {
    mockGetAllTaxConfig.mockRejectedValue(new Error("list down"));
    renderWithClient(<TaxConfigList />);
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("22%");
    await waitFor(() =>
      expect(screen.queryByText("page.taxConfig.scope.column")).not.toBeInTheDocument()
    );
  });
});

describe("DetailTaxConfig — scope, contributing rows, back navigation", () => {
  test("a global row shows Global scope and is evaluated in the current outlet context", async () => {
    mockGetTaxConfigById.mockResolvedValue({
      data: { id: 7, name: "12", rate: 11, type: "ppn", status: "active", store: null }
    });
    renderWithClient(<DetailTaxConfig />);

    expect(await screen.findByText("page.taxConfig.scope.globalHint")).toBeInTheDocument();
    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("22%");
    expect(mockGetEffectiveTax).toHaveBeenCalledWith({ store: 3, channel: "counter" });
    const marker = screen.getByText("page.taxConfig.effective.rows.thisConfig");
    expect(marker.closest("li")).toHaveTextContent("12");
  });

  test("an outlet row is evaluated in its own outlet and shows the outlet name, not the id", async () => {
    mockSearchId = "2";
    mockStore = { activeStoreId: null, activeStoreName: "", isSuperAdmin: true };
    mockGetTaxConfigById.mockResolvedValue({ data: outletRow });
    mockGetEffectiveTax.mockResolvedValue({
      ...effective22,
      data: {
        ...effective22.data,
        ppn: {
          status: "configured",
          rate: 10,
          rows: [{ id: 2, name: "PPN Outlet", rate: 10, scope: "outlet" }]
        },
        findings: []
      }
    });
    renderWithClient(<DetailTaxConfig />);

    expect(await screen.findByTestId("effective-ppn-rate")).toHaveTextContent("10%");
    expect(mockGetEffectiveTax).toHaveBeenCalledWith({ store: 3, channel: "counter" });
    const scopeField = screen.getByTestId("tax-detail-scope");
    expect(await within(scopeField).findByText("Outlet Tiga")).toBeInTheDocument();
    expect(within(scopeField).queryByText("3")).not.toBeInTheDocument();
  });

  test("the back button and breadcrumb navigate to the real /tax-list route", async () => {
    mockGetTaxConfigById.mockResolvedValue({
      data: { id: 7, name: "12", rate: 11, type: "ppn", status: "active", store: null }
    });
    renderWithClient(<DetailTaxConfig />);
    await screen.findByText("page.taxConfig.scope.globalHint");

    const backButton = screen.getAllByRole("button").find((b) => b.textContent.trim() === "");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/tax-list");

    fireEvent.click(screen.getByRole("button", { name: "page.taxConfig.list.title" }));
    expect(mockNavigate).toHaveBeenLastCalledWith("/tax-list");
    expect(mockNavigate).not.toHaveBeenCalledWith("/tax-config-list");
  });

  test("the detail page keeps its existing not-found state when the row fails to load", async () => {
    mockGetTaxConfigById.mockRejectedValue(new Error("nope"));
    renderWithClient(<DetailTaxConfig />);
    expect(await screen.findByText("page.taxConfig.detail.notFound")).toBeInTheDocument();
    expect(mockGetEffectiveTax).not.toHaveBeenCalled();
  });
});
