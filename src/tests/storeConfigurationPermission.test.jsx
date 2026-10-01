import React from "react";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

// FE W3 Phase 2 — canonical store.manage UX gate (GET /auth/context) and the
// Sidebar entry it drives. roleType/accessMenu never decide W3 visibility.

const mockGetAuthContext = jest.fn();
jest.mock("@/services/auth", () => ({
  getAuthContext: (...args) => mockGetAuthContext(...args)
}));

jest.mock("@/services/session", () => ({
  endSession: jest.fn(() => Promise.resolve()),
  SESSION_END_REASON: { LOGOUT: "logout", EXPIRED: "expired" }
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: "id", changeLanguage: jest.fn() } })
}));

let mockUser = { id: 1, userName: "ani", roleType: "admin", store: 1 };
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockUser }, jest.fn(), jest.fn()]
}));
jest.mock("@/hooks/useUserSession", () => ({ useUserSession: () => mockUser }));
jest.mock("@/assets/logo-sidebar.png", () => "logo.png");

import { useStoreManagePermission } from "@/hooks/useStoreManagePermission";
import Sidebar from "@/components/layout/Sidebar";

const contextBody = (permissions, extra = {}) => ({
  message: "Success",
  data: {
    session: null,
    context: {
      activeTenantId: null,
      activeStoreId: null,
      activeRole: null,
      permissions,
      assignedStoreIds: [],
      isPlatformAdmin: false,
      reason: null,
      ...extra
    }
  }
});

const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper = (client) => {
  const QueryWrapper = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};

const renderSidebar = () =>
  render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <Sidebar collapsed={false} />
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  mockGetAuthContext.mockReset();
  mockUser = { id: 1, userName: "ani", roleType: "admin", store: 1 };
});

describe("useStoreManagePermission", () => {
  test("is loading until the auth context resolves", async () => {
    let resolve;
    mockGetAuthContext.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useStoreManagePermission(), {
      wrapper: wrapper(makeClient())
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.canManageStores).toBe(false);
    resolve(contextBody(["store.manage"]));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  test("grants when the canonical permissions include store.manage", async () => {
    mockGetAuthContext.mockResolvedValue(
      contextBody(["audit.read", "user.manage", "role.manage", "store.manage"], {
        activeRole: "tenant_admin",
        activeTenantId: 10
      })
    );
    const { result } = renderHook(() => useStoreManagePermission(), {
      wrapper: wrapper(makeClient())
    });
    await waitFor(() => expect(result.current.canManageStores).toBe(true));
    expect(result.current.isError).toBe(false);
  });

  test("denies when store.manage is absent", async () => {
    mockGetAuthContext.mockResolvedValue(
      contextBody(["audit.read"], { activeRole: "store_admin" })
    );
    const { result } = renderHook(() => useStoreManagePermission(), {
      wrapper: wrapper(makeClient())
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canManageStores).toBe(false);
  });

  test("denies (and reports the error) when the auth context fails", async () => {
    mockGetAuthContext.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useStoreManagePermission(), {
      wrapper: wrapper(makeClient())
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.canManageStores).toBe(false);
  });

  test("a legacy super_admin role alone grants nothing", async () => {
    mockUser = { id: 2, roleType: "super_admin", store: null };
    mockGetAuthContext.mockResolvedValue(contextBody([]));
    const { result } = renderHook(() => useStoreManagePermission(), {
      wrapper: wrapper(makeClient())
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canManageStores).toBe(false);
  });

  test("components sharing the query issue one auth-context request", async () => {
    mockGetAuthContext.mockResolvedValue(contextBody(["store.manage"]));
    const client = makeClient();
    const first = renderHook(() => useStoreManagePermission(), { wrapper: wrapper(client) });
    const second = renderHook(() => useStoreManagePermission(), { wrapper: wrapper(client) });
    await waitFor(() => expect(first.result.current.canManageStores).toBe(true));
    await waitFor(() => expect(second.result.current.canManageStores).toBe(true));
    expect(mockGetAuthContext).toHaveBeenCalledTimes(1);
  });
});

describe("Sidebar Store Configuration entry", () => {
  const ITEM = "page.storeConfiguration.title";

  test.each([
    ["role-based branch", { id: 1, roleType: "admin", store: 1 }],
    [
      "accessMenu-controlled branch",
      {
        id: 1,
        roleType: "admin",
        store: 1,
        accessMenu: [{ title: "Product", href: "/product-list", view: true }]
      }
    ],
    ["super_admin", { id: 1, roleType: "super_admin", store: null }]
  ])("%s: visible with store.manage", async (_label, user) => {
    mockUser = user;
    mockGetAuthContext.mockResolvedValue(contextBody(["store.manage"]));
    renderSidebar();
    expect(await screen.findByText(ITEM)).toBeInTheDocument();
  });

  test.each([
    ["role-based branch", { id: 1, roleType: "admin", store: 1 }],
    [
      "accessMenu-controlled branch",
      {
        id: 1,
        roleType: "admin",
        store: 1,
        accessMenu: [{ title: "Product", href: "/product-list", view: true }]
      }
    ],
    ["super_admin without the permission", { id: 1, roleType: "super_admin", store: 5 }]
  ])("%s: hidden without store.manage", async (_label, user) => {
    mockUser = user;
    mockGetAuthContext.mockResolvedValue(contextBody(["audit.read"]));
    renderSidebar();
    await waitFor(() => expect(mockGetAuthContext).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText(ITEM)).not.toBeInTheDocument());
  });

  test("hidden while loading and when the auth context fails", async () => {
    mockGetAuthContext.mockRejectedValue(new Error("network"));
    renderSidebar();
    expect(screen.queryByText(ITEM)).not.toBeInTheDocument();
    await waitFor(() => expect(mockGetAuthContext).toHaveBeenCalled());
    expect(screen.queryByText(ITEM)).not.toBeInTheDocument();
  });
});
