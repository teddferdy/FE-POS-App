import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import fs from "fs";

// TaxConfigList search filter label must go through i18n: with the mocked
// identity translator the label renders the key itself ("common.search").
// A hardcoded Indonesian "Cari" bypasses the dictionary and shows the wrong
// language to English-locale users.
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
  useTranslation: () => ({ t: (k) => k, i18n: { language: "en", changeLanguage: jest.fn() } })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() }
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: { id: 1, roleType: "super_admin", store: "3" } }, jest.fn(), jest.fn()]
}));
jest.mock("@/hooks/useUserSession", () => ({
  useUserSession: () => ({ id: 1, roleType: "super_admin", store: "3" })
}));
jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({
    activeStoreId: "3",
    activeStoreName: "Outlet Tiga",
    isSuperAdmin: true,
    setActiveStore: jest.fn()
  })
}));
jest.mock("@/services/session", () => ({
  endSession: jest.fn(),
  SESSION_END_REASON: { LOGOUT: "logout", EXPIRED: "expired" }
}));

const mockGetAllTaxConfig = jest.fn();
const mockGetEffectiveTax = jest.fn();
jest.mock("@/services/tax-config", () => ({
  getAllTaxConfig: (...a) => mockGetAllTaxConfig(...a),
  getTaxConfigById: jest.fn(),
  getEffectiveTax: (...a) => mockGetEffectiveTax(...a),
  deleteTaxConfig: jest.fn(),
  downloadTaxConfigTemplate: jest.fn(),
  downloadTaxConfigExcel: jest.fn(),
  uploadTaxConfigExcel: jest.fn()
}));
jest.mock("@/services/location", () => ({
  getAllLocation: () => Promise.resolve({ data: [{ id: 3, name: "Outlet Tiga" }] })
}));
jest.mock("@/components/organism/UploadExcelModal", () => () => null);

import TaxConfigList from "@/page/tax-config/TaxConfigList";

const renderList = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockGetAllTaxConfig.mockResolvedValue({
    success: true,
    data: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    stats: {}
  });
  mockGetEffectiveTax.mockResolvedValue({
    success: true,
    data: {
      store: 3,
      channel: "counter",
      ppn: { status: "configured", rate: 11, rows: [] },
      serviceCharge: { status: "absent", rate: 0, rows: [] },
      findings: []
    }
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <TaxConfigList />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("TaxConfigList search filter label localization", () => {
  test("the visible label of the search control resolves through i18n, not a hardcoded word", async () => {
    renderList();
    const searchbox = await screen.findByPlaceholderText("page.taxConfig.list.search");
    const group = searchbox.closest("div.flex.flex-col");
    expect(group).not.toBeNull();
    const label = within(group).getByText("common.search", { selector: "label" });
    expect(label).toBeInTheDocument();
  });

  test("English dictionary resolves common.search to Search", () => {
    const en = JSON.parse(fs.readFileSync("src/i18n/en.json", "utf8"));
    expect(en["common.search"]).toBe("Search");
  });

  test("Indonesian dictionary resolves common.search to Cari", () => {
    const id = JSON.parse(fs.readFileSync("src/i18n/id.json", "utf8"));
    expect(id["common.search"]).toBe("Cari");
  });
});
