import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { CookiesProvider } from "react-cookie";

// /tenant is canonically gated by tenant.manage, but a menu-scoped role
// (bakso_admin) can carry an explicit /tenant entry in its accessMenu. That
// grant must drive the Tenant menu and Add Location's target-tenant field.

const mockGetAuthContext = jest.fn();
jest.mock("@/services/auth", () => ({
  getAuthContext: (...args) => mockGetAuthContext(...args)
}));

import { useTenantManagePermission } from "@/hooks/useTenantManagePermission";
import { hasExplicitMenuAccess } from "@/utils/permission";
import BAKSO_MENU from "./fixtures-bakso-admin-access-menu.json";

const contextResponse = (permissions = []) => ({
  data: { context: { permissions, isPlatformAdmin: false } }
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

test("tenant.manage from the auth context still grants access", async () => {
  mockGetAuthContext.mockResolvedValue(contextResponse(["tenant.manage"]));
  const { result } = usePermission({ id: 1, roleType: "super_admin" });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canManageTenants).toBe(true);
});

test("bakso_admin gets tenant access from /tenant in its accessMenu", async () => {
  const { result } = usePermission({
    id: 30,
    roleType: "super_admin",
    accessMenuScoped: true,
    accessMenu: BAKSO_MENU
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canManageTenants).toBe(true);
  expect(hasExplicitMenuAccess({ accessMenu: BAKSO_MENU }, "/tenant", ["view"])).toBe(true);
});

test("a non-super-admin role can be granted /tenant explicitly", async () => {
  const { result } = usePermission({
    id: 31,
    roleType: "admin",
    accessMenu: [{ menu: "/tenant", view: true }]
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canManageTenants).toBe(true);
});

test("a plain super_admin is not granted by roleType or a stored /tenant entry", async () => {
  const { result } = usePermission({
    id: 32,
    roleType: "super_admin",
    accessMenu: [{ menu: "/tenant", view: true }]
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canManageTenants).toBe(false);
});

test("an accessMenu without /tenant does not grant tenant access", async () => {
  const { result } = usePermission({
    id: 33,
    roleType: "admin",
    accessMenu: [{ menu: "/location-list", view: true }]
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.canManageTenants).toBe(false);
});
