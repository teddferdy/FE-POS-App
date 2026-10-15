import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

// "Gunakan di Kasir & BISA" on the tax list (D3: one applied PPN per scope,
// never stacked). The row in use is badged from /tax-config/effective; the
// action is offered on other PPN rows the caller may edit.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("")]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: "id", changeLanguage: jest.fn() } })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }));
let mockUser;
jest.mock("react-cookie", () => ({ useCookies: () => [{ user: mockUser }, jest.fn(), jest.fn()] }));
jest.mock("@/hooks/useUserSession", () => ({ useUserSession: () => mockUser }));
let mockStore;
jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ ...mockStore, setActiveStore: jest.fn() })
}));
jest.mock("@/services/session", () => ({
  endSession: jest.fn(),
  SESSION_END_REASON: { LOGOUT: "logout", EXPIRED: "expired" }
}));
const mockGetAllTaxConfig = jest.fn();
const mockGetEffectiveTax = jest.fn();
const mockApplyTaxConfig = jest.fn();
jest.mock("@/services/tax-config", () => ({
  getAllTaxConfig: (...a) => mockGetAllTaxConfig(...a),
  getEffectiveTax: (...a) => mockGetEffectiveTax(...a),
  applyTaxConfig: (...a) => mockApplyTaxConfig(...a),
  deleteTaxConfig: jest.fn(),
  downloadTaxConfigTemplate: jest.fn(),
  downloadTaxConfigExcel: jest.fn(),
  uploadTaxConfigExcel: jest.fn()
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [{ id: 3, name: "Outlet Tiga" }] }))
}));
jest.mock("@/components/organism/UploadExcelModal", () => () => null);

import TaxConfigList from "@/page/tax-config/TaxConfigList";

const seeded = { id: 1, name: "PPN 11%", rate: 11, type: "ppn", status: "active", store: null };
const dup = {
  id: 2,
  name: "PPN 11% duplikat",
  rate: 11,
  type: "ppn",
  status: "active",
  store: null
};
const outlet = { id: 3, name: "PPN Outlet", rate: 10, type: "ppn", status: "inactive", store: 3 };
const service = {
  id: 4,
  name: "Service",
  rate: 5,
  type: "service_charge",
  status: "active",
  store: null
};

const listOf = (rows) => ({
  data: rows,
  total: rows.length,
  pagination: { total: rows.length, totalPages: 1 }
});
const effective = (appliedId) => ({
  success: true,
  data: {
    store: 3,
    channel: "counter",
    ppn: {
      status: "configured",
      rate: 11,
      rows: [
        { id: 1, name: "PPN 11%", rate: 11, scope: "global", applied: appliedId === 1 },
        { id: 2, name: "PPN 11% duplikat", rate: 11, scope: "global", applied: appliedId === 2 }
      ]
    },
    serviceCharge: { status: "absent", rate: 0, rows: [] },
    findings: []
  }
});

const renderList = () =>
  render(
    <MemoryRouter>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <TaxConfigList />
      </QueryClientProvider>
    </MemoryRouter>
  );

// the name also appears in the effective-tax summary card; take the table row
const rowOf = async (name) =>
  (await screen.findAllByText(name)).map((el) => el.closest("tr")).find(Boolean);

beforeEach(() => {
  jest.clearAllMocks();
  // a global super admin working in outlet 3 (the list needs an outlet)
  mockUser = { id: 1, roleType: "super_admin", store: null };
  mockStore = { activeStoreId: "3", activeStoreName: "Outlet Tiga", isSuperAdmin: true };
  mockGetAllTaxConfig.mockResolvedValue(listOf([seeded, dup, outlet, service]));
  mockGetEffectiveTax.mockResolvedValue(effective(2));
  mockApplyTaxConfig.mockResolvedValue({ success: true });
});

test("the PPN row in use is badged; only that row", async () => {
  renderList();
  expect(await screen.findByTestId("tax-applied-2")).toHaveTextContent("page.taxConfig.apply.used");
  expect(screen.queryByTestId("tax-applied-1")).not.toBeInTheDocument();
});

const openActions = async (name) => {
  const row = await rowOf(name);
  const trigger = within(row).getByRole("button", { name: "common.actions" });
  // Radix DropdownMenu opens from the keyboard in jsdom (no PointerEvent)
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
};

test("a global super admin applies another PPN row after confirming", async () => {
  renderList();
  await screen.findByTestId("tax-applied-2");
  await openActions("PPN 11%");
  fireEvent.click(await screen.findByRole("menuitem", { name: /page.taxConfig.apply.action/ }));
  expect(await screen.findByText("page.taxConfig.apply.modalTitle")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "page.taxConfig.apply.action" }));
  await waitFor(() => expect(mockApplyTaxConfig).toHaveBeenCalledWith(1));
});

test("the row already in use and non-PPN rows offer no apply action", async () => {
  renderList();
  await screen.findByTestId("tax-applied-2");
  await openActions("PPN 11% duplikat");
  await screen.findByRole("menuitem", { name: /common.view/ });
  expect(
    screen.queryByRole("menuitem", { name: /page.taxConfig.apply.action/ })
  ).not.toBeInTheDocument();
});

test("an outlet admin cannot apply a global row", async () => {
  mockUser = {
    id: 2,
    roleType: "admin",
    store: 3,
    accessMenu: [{ menu: "/tax-list", view: true, edit: true, detail: true, delete: true }]
  };
  mockStore = { activeStoreId: "3", activeStoreName: "Outlet", isSuperAdmin: false };
  sessionStorage.setItem("user", JSON.stringify(mockUser));
  renderList();
  await openActions("PPN 11%");
  await screen.findByRole("menuitem", { name: /common.edit/ });
  expect(
    screen.queryByRole("menuitem", { name: /page.taxConfig.apply.action/ })
  ).not.toBeInTheDocument();
  sessionStorage.clear();
});
