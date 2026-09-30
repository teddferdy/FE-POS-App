import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AddLocation from "../page/location/AddLocation";
import EditLocation from "../page/location/EditLocation";
import { addLocation, editLocation, getLocationById } from "@/services/location";
import { resolveSubmitStatus } from "@/lib/store-lifecycle";

let mockEditId = "";
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(mockEditId ? `id=${mockEditId}` : ""), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

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

// HB-2 R1: the store UI sends `status` as the authoritative lifecycle field
// and never sends `isActive` as lifecycle input (FormData stringifies
// booleans, so isActive:"false" would read as truthy on the BE).

// jsdom lacks ResizeObserver, which Radix Tabs requires on tab switch.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe("resolveSubmitStatus (pure contract)", () => {
  test("save-as-draft always resolves to draft", () => {
    expect(
      resolveSubmitStatus({ saveAsDraft: true, lifecycleTouched: false, isActive: true })
    ).toBe("draft");
  });

  test("untouched lifecycle control resolves to undefined (config-only)", () => {
    expect(
      resolveSubmitStatus({ saveAsDraft: false, lifecycleTouched: false, isActive: true })
    ).toBeUndefined();
    expect(
      resolveSubmitStatus({ saveAsDraft: false, lifecycleTouched: false, isActive: false })
    ).toBeUndefined();
  });

  test("touched control maps the boolean deterministically", () => {
    expect(
      resolveSubmitStatus({ saveAsDraft: false, lifecycleTouched: true, isActive: true })
    ).toBe("active");
    expect(
      resolveSubmitStatus({ saveAsDraft: false, lifecycleTouched: true, isActive: false })
    ).toBe("inactive");
  });

  test("create always carries an explicit status (no dirty tracking needed)", () => {
    expect(
      resolveSubmitStatus({ saveAsDraft: false, lifecycleTouched: true, isActive: true })
    ).toBe("active");
    expect(resolveSubmitStatus({ saveAsDraft: true, lifecycleTouched: true, isActive: true })).toBe(
      "draft"
    );
  });
});

const renderWithClient = (ui) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("AddLocation create payload", () => {
  beforeEach(() => {
    mockEditId = "";
    addLocation.mockClear();
  });

  test("create draft sends status=draft and no isActive", async () => {
    renderWithClient(<AddLocation />);
    fireEvent.click(await screen.findByText("page.location.form.saveDraft"));
    fireEvent.click(await screen.findByText("page.location.form.draftModalConfirm"));

    await waitFor(() => expect(addLocation).toHaveBeenCalled());
    const payload = addLocation.mock.calls[0][0];
    const body = payload instanceof FormData ? JSON.parse(payload.get("data")) : payload;
    expect(body.status).toBe("draft");
    expect("isActive" in body).toBe(false);
  });
});

const activeStoreFixture = {
  id: "loc-99",
  locationId: "loc-99",
  name: "Fixture Active Store",
  storeId: "ST-099",
  phoneNumber: "081234567890",
  email: "fixture@test.com",
  address: "Jl. Fixture No. 1",
  province: "31",
  city: "3171",
  district: "3171010",
  village: "3171010001",
  postalCode: "10110",
  status: "active",
  isActive: true,
  category: "Branch",
  image: "http://img.test/store.jpg",
  openingHours: []
};

describe("EditLocation edit payload", () => {
  beforeEach(() => {
    mockEditId = "99";
    editLocation.mockClear();
    getLocationById.mockResolvedValue({ data: activeStoreFixture });
  });

  const renderEdit = async () => {
    renderWithClient(<EditLocation />);
    await screen.findByDisplayValue("Fixture Active Store");
  };

  const saveChanges = async () => {
    fireEvent.click(screen.getByText("page.location.form.saveChanges"));
    fireEvent.click(await screen.findByText("common.yesSave"));
    await waitFor(() => expect(editLocation).toHaveBeenCalled());
    return editLocation.mock.calls[0][0];
  };

  const formOf = (sent) => {
    expect(sent).toBeInstanceOf(FormData);
    return sent;
  };

  test("configuration-only edit sends no lifecycle field", async () => {
    await renderEdit();
    const sent = await saveChanges();
    const fd = formOf(sent);
    expect(fd.get("status")).toBeNull();
    expect(fd.get("isActive")).toBeNull();
  });

  test("deactivate sends status=inactive and no isActive", async () => {
    await renderEdit();
    fireEvent.mouseDown(await screen.findByText("page.location.form.tabPengaturan"));
    fireEvent.click(screen.getByRole("switch"));
    const sent = await saveChanges();
    const fd = formOf(sent);
    expect(fd.get("status")).toBe("inactive");
    expect(fd.get("isActive")).toBeNull();
  });

  test("save-as-draft sends status=draft and no isActive", async () => {
    await renderEdit();
    fireEvent.click(screen.getByText("page.location.form.saveDraft"));
    fireEvent.click(await screen.findByText("page.location.form.draftModalConfirm"));
    await waitFor(() => expect(editLocation).toHaveBeenCalled());
    const fd = formOf(editLocation.mock.calls[0][0]);
    expect(fd.get("status")).toBe("draft");
    expect(fd.get("isActive")).toBeNull();
  });
});
