import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { CookiesProvider } from "react-cookie";

// The BE decides who administers tenants (/auth/context tenantAdministration:
// "all" platform, "own" a client's super admin such as bakso_admin). For a
// menu-scoped account the /tenant accessMenu entry is the switch that shows
// the menu; accessMenu alone never grants anything, and own scope never
// unlocks the platform-only target-tenant field (canManageTenants).

const mockGetAuthContext = jest.fn();
jest.mock("@/services/auth", () => ({
  getAuthContext: (...args) => mockGetAuthContext(...args)
}));

import { useTenantManagePermission } from "@/hooks/useTenantManagePermission";
import { hasExplicitMenuAccess } from "@/utils/permission";
import BAKSO_MENU from "./fixtures-bakso-admin-access-menu.json";

const contextResponse = (permissions = [], tenantAdministration = null) => ({
  data: { context: { permissions, isPlatformAdmin: false, tenantAdministration } }
});

const wrapper = ({ children }) => (
  <CookiesProvider>
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, refetchOnMount: false } }
        })
      }>
      {children}
    </QueryClientProvider>
  </CookiesProvider>
);

const usePermission = (user) => {
  sessionStorage.setItem("user", JSON.stringify(user));
  return renderHook(() => useTenantManagePermission(), { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  mockGetAuthContext.mockResolvedValue(contextResponse());
});

test("tenant.manage from the auth context grants full access", async () => {
  mockGetAuthContext.mockResolvedValue(contextResponse(["tenant.manage"], "all"));
  const { result } = usePermission({ id: 1, roleType: "super_admin" });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canManageTenants).toBe(true);
  expect(result.current.canAdministerTenants).toBe(true);
  expect(result.current.ownTenantsOnly).toBe(false);
});

const BAKSO = { id: 30, roleType: "super_admin", accessMenuScoped: true, accessMenu: BAKSO_MENU };

test("bakso_admin: BE own scope + /tenant in its accessMenu opens its own tenants", async () => {
  mockGetAuthContext.mockResolvedValue(contextResponse(["store.manage"], "own"));
  const { result } = usePermission(BAKSO);

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(hasExplicitMenuAccess({ accessMenu: BAKSO_MENU }, "/tenant", ["view"])).toBe(true);
  expect(result.current.canAdministerTenants).toBe(true);
  expect(result.current.ownTenantsOnly).toBe(true);
  expect(result.current.canManageTenants).toBe(false);
});

test("bakso_admin without /tenant in its accessMenu does not see the menu", async () => {
  mockGetAuthContext.mockResolvedValue(contextResponse(["store.manage"], "own"));
  const { result } = usePermission({
    ...BAKSO,
    accessMenu: BAKSO_MENU.filter((m) => m.menu !== "/tenant")
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canAdministerTenants).toBe(false);
});

test("/tenant in accessMenu without the BE scope grants nothing", async () => {
  mockGetAuthContext.mockResolvedValue(contextResponse([], null));
  for (const user of [
    BAKSO,
    { id: 31, roleType: "admin", accessMenu: [{ menu: "/tenant", view: true }] }
  ]) {
    sessionStorage.clear();
    const { result, unmount } = usePermission(user);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canAdministerTenants).toBe(false);
    expect(result.current.canManageTenants).toBe(false);
    unmount();
  }
});
