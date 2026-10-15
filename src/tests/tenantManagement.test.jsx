import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

// Platform tenant administration (/tenant) and the store form's target-tenant
// field — the fix path for TARGET_TENANT_REQUIRED ("platform store creation
// requires an explicit target tenant").

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => (opts && opts.name ? `${k}:${opts.name}` : k),
    i18n: { language: "id", changeLanguage: jest.fn() }
  })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockGetTenants = jest.fn();
const mockCreateTenant = jest.fn();
const mockUpdateTenant = jest.fn();
jest.mock("@/services/tenant", () => ({
  getTenants: (...args) => mockGetTenants(...args),
  createTenant: (...args) => mockCreateTenant(...args),
  updateTenant: (...args) => mockUpdateTenant(...args)
}));

let mockPermission;
jest.mock("@/hooks/useTenantManagePermission", () => ({
  useTenantManagePermission: () => mockPermission
}));

// Plain stub for the Radix/cmdk combobox (same pattern as other suites).
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ id, options, value, onChange, placeholder }) {
    return (
      <div data-testid={id || placeholder} data-field-value={value ?? ""}>
        {options.map((o) => (
          <button key={String(o.value)} type="button" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
}));

import TenantList, { suggestTenantCode } from "@/page/tenant/TenantList";
import TenantSelectField, { tenantErrorMessage } from "@/components/organism/TenantSelectField";

const tenant = (id, extra = {}) => ({
  id,
  code: `warung-${id}`,
  name: `Warung ${id}`,
  status: "active",
  storeCount: 1,
  activeMemberCount: 2,
  ...extra
});

const listResponse = (rows) => ({
  success: true,
  data: rows,
  pagination: { page: 1, limit: 20, total: rows.length, totalPages: 1 }
});

const httpError = (status, data = {}) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status, data } });

const wrap = (ui) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
        })
      }>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockPermission = { canManageTenants: true, isLoading: false, isError: false, refetch: jest.fn() };
  mockGetTenants.mockResolvedValue(listResponse([tenant(1), tenant(2, { status: "suspended" })]));
});

describe("suggestTenantCode", () => {
  test.each([
    ["Warung Bakso Pak Kumis", "warung-bakso-pak-kumis"],
    ["  Bakso & Mie  Ayam!! ", "bakso-mie-ayam"],
    ["Café Ñoño", "cafe-nono"],
    ["a".repeat(60), "a".repeat(50)]
  ])("%j → %j", (name, code) => {
    expect(suggestTenantCode(name)).toBe(code);
  });
});

describe("TenantList", () => {
  test("without tenant.manage the page is access-denied and nothing is fetched", () => {
    mockPermission = { ...mockPermission, canManageTenants: false };
    wrap(<TenantList />);
    expect(mockGetTenants).not.toHaveBeenCalled();
    expect(screen.queryByText("page.tenant.action.create")).not.toBeInTheDocument();
  });

  test("lists tenants with their counts and status", async () => {
    wrap(<TenantList />);
    expect(await screen.findByText("Warung 1")).toBeInTheDocument();
    expect(screen.getByText("warung-2")).toBeInTheDocument();
    expect(screen.getAllByText("page.tenant.status.suspended").length).toBeGreaterThan(0);
  });

  test("creates a tenant with a suggested code from its name", async () => {
    mockCreateTenant.mockResolvedValue({ success: true, data: tenant(3) });
    wrap(<TenantList />);
    fireEvent.click(await screen.findByText("page.tenant.action.create"));

    fireEvent.change(screen.getByLabelText("page.tenant.form.name"), {
      target: { value: "Warung Bakso Pak Kumis" }
    });
    expect(screen.getByLabelText("page.tenant.form.code")).toHaveValue("warung-bakso-pak-kumis");

    fireEvent.click(screen.getByText("page.tenant.form.save"));
    await waitFor(() =>
      expect(mockCreateTenant).toHaveBeenCalledWith({
        code: "warung-bakso-pak-kumis",
        name: "Warung Bakso Pak Kumis"
      })
    );
  });

  test("an invalid code disables saving; a taken code is shown on the field", async () => {
    mockCreateTenant.mockRejectedValue(
      httpError(409, { code: "TENANT_CODE_TAKEN", field: "code" })
    );
    wrap(<TenantList />);
    fireEvent.click(await screen.findByText("page.tenant.action.create"));
    fireEvent.change(screen.getByLabelText("page.tenant.form.name"), {
      target: { value: "Warung" }
    });
    fireEvent.change(screen.getByLabelText("page.tenant.form.code"), {
      target: { value: "-bad-" }
    });
    expect(screen.getByText("page.tenant.form.save").closest("button")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("page.tenant.form.code"), {
      target: { value: "warung-1" }
    });
    fireEvent.click(screen.getByText("page.tenant.form.save"));
    expect(await screen.findByRole("alert")).toHaveTextContent("page.tenant.error.codeTaken");
  });

  test("editing suspends a tenant, warns first, and never sends the code", async () => {
    mockUpdateTenant.mockResolvedValue({ success: true, data: tenant(1, { status: "suspended" }) });
    wrap(<TenantList />);
    fireEvent.click(await screen.findByLabelText("page.tenant.action.editNamed:Warung 1"));

    expect(screen.getByLabelText("page.tenant.form.code")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("page.tenant.form.status"), {
      target: { value: "suspended" }
    });
    expect(screen.getByText("page.tenant.form.suspendWarning")).toBeInTheDocument();

    fireEvent.click(screen.getByText("page.tenant.form.save"));
    await waitFor(() => expect(mockUpdateTenant).toHaveBeenCalledWith(1, { status: "suspended" }));
  });

  test("search and status filters are passed to the API", async () => {
    wrap(<TenantList />);
    await screen.findByText("Warung 1");
    fireEvent.change(screen.getByLabelText("page.tenant.table.status"), {
      target: { value: "active" }
    });
    await waitFor(() =>
      expect(mockGetTenants).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "active", page: 1 })
      )
    );
  });
});

describe("TenantSelectField (store form)", () => {
  test("hidden for actors without tenant.manage", () => {
    mockPermission = { ...mockPermission, canManageTenants: false };
    wrap(<TenantSelectField value="" onChange={jest.fn()} />);
    expect(screen.queryByText("page.location.tenant.label")).not.toBeInTheDocument();
    expect(mockGetTenants).not.toHaveBeenCalled();
  });

  test("offers only active tenants and reports the chosen id", async () => {
    mockGetTenants.mockResolvedValue(listResponse([tenant(1)]));
    const onChange = jest.fn();
    wrap(<TenantSelectField value="" onChange={onChange} />);
    const box = screen.getByTestId("location-tenant");
    fireEvent.click(await within(box).findByText("Warung 1 (warung-1)"));
    expect(onChange).toHaveBeenCalledWith("1");
    expect(mockGetTenants).toHaveBeenCalledWith(expect.objectContaining({ status: "active" }));
  });

  test("maps the backend tenant refusals to readable messages", () => {
    const t = (k) => k;
    expect(tenantErrorMessage(t, httpError(422, { code: "TARGET_TENANT_REQUIRED" }))).toBe(
      "page.location.tenant.error.required"
    );
    expect(tenantErrorMessage(t, httpError(422, { code: "TENANT_NOT_APPROVED" }))).toBe(
      "page.location.tenant.error.notApproved"
    );
    expect(
      tenantErrorMessage(t, httpError(422, { code: "TENANT_REASSIGNMENT_NOT_PERMITTED" }))
    ).toBe("page.location.tenant.error.reassignment");
    expect(tenantErrorMessage(t, httpError(500, { code: "OTHER" }))).toBeNull();
  });
});
