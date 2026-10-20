import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { CookiesProvider } from "react-cookie";
import { shouldRetryQuery } from "../lib/query-retry";
import { useStoreManagePermission } from "../hooks/useStoreManagePermission";
import { useTenantManagePermission } from "../hooks/useTenantManagePermission";
import { getAuthContext } from "../services/auth";

// Observed on /dashboard-admin (2026-10-19): every denied request fired 3x
// (global `retry: 2` also retried 403s) and /auth/context refetched on each
// Sidebar/page mount (global refetchOnMount "always" overrode the hooks'
// 5 min staleTime).

jest.mock("../services/auth", () => ({
  getAuthContext: jest.fn(() => Promise.resolve({ data: { context: { permissions: [] } } }))
}));

const httpError = (status) => ({ response: { status } });

describe("shouldRetryQuery", () => {
  test.each([400, 401, 403, 404, 409, 422, 429])("never retries %i", (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(false);
  });

  test.each([
    ["5xx", httpError(500)],
    ["network error (no response)", new Error("Network Error")]
  ])("retries %s at most twice", (_name, error) => {
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
  });

  test("a denied query is requested exactly once under the app defaults", async () => {
    const fn = jest.fn(() => Promise.reject(httpError(403)));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: shouldRetryQuery, retryDelay: 1 } }
    });
    const Q = () => {
      useQuery(["denied"], fn);
      return null;
    };
    render(
      <QueryClientProvider client={client}>
        <Q />
      </QueryClientProvider>
    );
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("auth-context permission hooks", () => {
  test("a later Sidebar/page mount reuses the cached context instead of refetching", async () => {
    getAuthContext.mockClear();
    // Same defaults as src/index.jsx.
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: 30000, retry: false, refetchOnMount: "always" } }
    });
    const Sidebar = () => {
      useStoreManagePermission();
      useTenantManagePermission();
      return null;
    };
    const Page = () => {
      useStoreManagePermission();
      return null;
    };
    const { rerender } = render(
      <CookiesProvider>
        <QueryClientProvider client={client}>
          <Sidebar />
        </QueryClientProvider>
      </CookiesProvider>
    );
    await waitFor(() => expect(getAuthContext).toHaveBeenCalledTimes(1));

    rerender(
      <CookiesProvider>
        <QueryClientProvider client={client}>
          <Sidebar />
          <Page />
        </QueryClientProvider>
      </CookiesProvider>
    );
    await act(() => new Promise((r) => setTimeout(r, 30)));

    expect(getAuthContext).toHaveBeenCalledTimes(1);
  });
});
