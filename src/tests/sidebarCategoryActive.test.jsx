import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

const mockGetAuthContext = jest.fn();
jest.mock("@/services/auth", () => ({
  getAuthContext: (...args) => mockGetAuthContext(...args)
}));
jest.mock("@/services/session", () => ({
  endSession: jest.fn(() => Promise.resolve()),
  SESSION_END_REASON: { LOGOUT: "logout" }
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: "id", changeLanguage: jest.fn() } })
}));

let mockUser = { id: 1, userName: "ani", roleType: "super_admin", store: null };
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockUser }, jest.fn(), jest.fn()]
}));
jest.mock("@/hooks/useUserSession", () => ({ useUserSession: () => mockUser }));
jest.mock("@/assets/logo-sidebar.png", () => "logo.png");

import Sidebar from "@/components/layout/Sidebar";

const renderAt = (path) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Sidebar collapsed={false} />
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  mockGetAuthContext.mockReset();
  mockGetAuthContext.mockResolvedValue({
    message: "Success",
    data: {
      session: null,
      context: {
        activeTenantId: null,
        activeStoreId: null,
        activeRole: null,
        permissions: [],
        assignedStoreIds: [],
        isPlatformAdmin: false,
        reason: null
      }
    }
  });
  mockUser = { id: 1, userName: "ani", roleType: "super_admin", store: null };
});

describe("Sidebar category active state", () => {
  test("Location category is active on /location-list", async () => {
    renderAt("/location-list");
    const btn = await screen.findByText("sidebar.section.location");
    expect(btn.closest("button").className).toMatch("bg-primary");
  });

  test("active follows the current page across categories", async () => {
    renderAt("/product-list");
    const produk = await screen.findByText("sidebar.section.produkPromo");
    expect(produk.closest("button").className).toMatch("bg-primary");
    const lokasi = await screen.findByText("sidebar.section.location");
    expect(lokasi.closest("button").className).not.toMatch("bg-primary");
  });
});
