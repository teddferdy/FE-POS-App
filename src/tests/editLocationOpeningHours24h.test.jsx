import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import EditLocation from "../page/location/EditLocation";
import { getLocationById, editLocation } from "@/services/location";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("id=loc1"), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock("@/services/location", () => ({
  getLocationById: jest.fn(),
  editLocation: jest.fn(() => Promise.resolve({ data: {} }))
}));

jest.mock("@/services/employee", () => ({
  getAllEmployee: jest.fn(() => Promise.resolve({ data: [] }))
}));

jest.mock("@/services/geocoding", () => ({
  reverseGeocode: jest.fn(),
  forwardGeocode: jest.fn()
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
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ options, value, onChange, placeholder }) {
    return (
      <select
        data-testid={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}>
        <option value="" />
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
}));

jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() => Promise.resolve([])),
  getCities: jest.fn(() => Promise.resolve([])),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));

const baseLocation = {
  id: "loc1",
  name: "Store 1",
  store: [],
  openingHours: [
    { day: "monday", open: "00:00", close: "23:59", is24Hours: true },
    { day: "tuesday", open: "08:00", close: "17:00" }, // legacy row, no is24Hours key
    { day: "wednesday", open: "09:00", close: "21:00", is24Hours: false }
  ]
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <EditLocation />
    </QueryClientProvider>
  );
};

const openOperationalHoursPanel = async () => {
  fireEvent.mouseDown(await screen.findByText("page.location.form.tabLainnya"));
  fireEvent.click(await screen.findByText("page.location.form.operationalHours"));
  await screen.findByText("common.day.monday");
};

const saveDraft = async () => {
  fireEvent.click(screen.getByText("page.location.form.saveDraft"));
  const confirmBtn = await screen.findByText("page.location.form.draftModalConfirm");
  fireEvent.click(confirmBtn);
};

describe("EditLocation — Phase 39 Batch 6D is24Hours flag", () => {
  beforeEach(() => {
    editLocation.mockClear();
    getLocationById.mockReset().mockImplementation(() => Promise.resolve({ data: baseLocation }));
  });

  test("hydrates a 24-hour day as checked, with disabled 00:00/23:59 time inputs", async () => {
    renderPage();
    await openOperationalHoursPanel();

    const mondayRow = screen.getByText("common.day.monday").closest("div.grid");
    const toggle24 = mondayRow.querySelector('input[aria-label="page.location.form.is24Hours"]');
    expect(toggle24).toBeChecked();

    const timeInputs = mondayRow.querySelectorAll('input[type="time"]');
    expect(timeInputs[0]).toBeDisabled();
    expect(timeInputs[0]).toHaveValue("00:00");
    expect(timeInputs[1]).toBeDisabled();
    expect(timeInputs[1]).toHaveValue("23:59");
  });

  test("legacy data with no is24Hours key hydrates to false — never inferred", async () => {
    renderPage();
    await openOperationalHoursPanel();

    const tuesdayRow = screen.getByText("common.day.tuesday").closest("div.grid");
    const toggle24 = tuesdayRow.querySelector('input[aria-label="page.location.form.is24Hours"]');
    expect(toggle24).not.toBeChecked();

    const timeInputs = tuesdayRow.querySelectorAll('input[type="time"]');
    expect(timeInputs[0]).not.toBeDisabled();
    expect(timeInputs[0]).toHaveValue("08:00");
  });

  test("saving without touching openingHours preserves the loaded is24Hours values", async () => {
    renderPage();
    await openOperationalHoursPanel();

    await saveDraft();

    await waitFor(() => expect(editLocation).toHaveBeenCalled());
    const fd = editLocation.mock.calls[0][0];
    const openingHours = JSON.parse(fd.get("openingHours"));
    const monday = openingHours.find((d) => d.day === "monday");
    const wednesday = openingHours.find((d) => d.day === "wednesday");
    expect(monday).toMatchObject({ is24Hours: true, open: "00:00", close: "23:59" });
    expect(wednesday).toMatchObject({ is24Hours: false, open: "09:00", close: "21:00" });
  });

  test("turning 24 Hours on for a normal-hours day and saving sends the placeholder times", async () => {
    renderPage();
    await openOperationalHoursPanel();

    const wednesdayRow = screen.getByText("common.day.wednesday").closest("div.grid");
    const toggle24 = wednesdayRow.querySelector('input[aria-label="page.location.form.is24Hours"]');
    fireEvent.click(toggle24);

    await saveDraft();

    await waitFor(() => expect(editLocation).toHaveBeenCalled());
    const fd = editLocation.mock.calls[0][0];
    const openingHours = JSON.parse(fd.get("openingHours"));
    const wednesday = openingHours.find((d) => d.day === "wednesday");
    expect(wednesday).toMatchObject({ is24Hours: true, open: "00:00", close: "23:59" });
  });
});
