import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddLocation from "../page/location/AddLocation";
import { addLocation } from "@/services/location";

// A platform actor's store form carries the chosen target tenant
// (TARGET_TENANT_REQUIRED fix path) and shows the backend's tenant refusal
// on the field.

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(""), jest.fn()],
  Link: ({ children }) => <span>{children}</span>
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/hooks/useTenantManagePermission", () => ({
  useTenantManagePermission: () => ({ canManageTenants: true, isLoading: false, isError: false })
}));
jest.mock("@/services/tenant", () => ({
  getTenants: jest.fn(() =>
    Promise.resolve({
      data: [{ id: 3, code: "warung-bakso", name: "Warung Bakso", status: "active" }]
    })
  )
}));
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ id, options, onChange, placeholder }) {
    return (
      <div data-testid={id || placeholder}>
        {options.map((o) => (
          <button key={String(o.value)} type="button" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
}));
jest.mock("@/services/location", () => ({
  addLocation: jest.fn(() => Promise.resolve({ data: {} })),
  editLocation: jest.fn(() => Promise.resolve({ data: {} })),
  getLocationById: jest.fn(() => Promise.resolve({ data: {} })),
  generateLocationId: jest.fn(() => Promise.resolve({ data: { storeId: "ST-099" } }))
}));
jest.mock("@/services/employee", () => ({
  getAllEmployee: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/geocoding", () => ({
  reverseGeocode: jest.fn(),
  forwardGeocode: jest.fn()
}));
jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() => Promise.resolve([])),
  getCities: jest.fn(() => Promise.resolve([])),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));
jest.mock(
  "@/components/ui/location-map-picker",
  () =>
    function LocationMapPickerStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/organism/UserGuide",
  () =>
    function UserGuideStub() {
      return <div />;
    }
);
jest.mock(
  "@/components/organism/MissingFieldsModal",
  () =>
    function MissingFieldsModalStub() {
      return null;
    }
);

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AddLocation />
    </QueryClientProvider>
  );
};

const saveDraft = async () => {
  fireEvent.click(await screen.findByText("page.location.form.saveDraft"));
  fireEvent.click(await screen.findByText("page.location.form.draftModalConfirm"));
};

const sentBody = () => {
  const payload = addLocation.mock.calls[0][0];
  return payload instanceof FormData ? JSON.parse(payload.get("data")) : payload;
};

beforeEach(() => addLocation.mockClear());

test("the chosen tenant is sent as tenantId", async () => {
  renderPage();
  fireEvent.click(await screen.findByText("Warung Bakso (warung-bakso)"));
  await saveDraft();
  await waitFor(() => expect(addLocation).toHaveBeenCalled());
  expect(sentBody().tenantId).toBe(3);
});

test("without a chosen tenant no tenantId is sent", async () => {
  renderPage();
  await screen.findByText("Warung Bakso (warung-bakso)");
  await saveDraft();
  await waitFor(() => expect(addLocation).toHaveBeenCalled());
  expect(sentBody()).not.toHaveProperty("tenantId");
});

test("a TARGET_TENANT_REQUIRED refusal is shown on the tenant field", async () => {
  addLocation.mockRejectedValueOnce(
    Object.assign(new Error("422"), {
      response: { status: 422, data: { code: "TARGET_TENANT_REQUIRED", field: "tenantId" } }
    })
  );
  renderPage();
  await screen.findByText("Warung Bakso (warung-bakso)");
  await saveDraft();
  await waitFor(() =>
    expect(screen.getAllByText("page.location.tenant.error.required").length).toBeGreaterThan(0)
  );
});
