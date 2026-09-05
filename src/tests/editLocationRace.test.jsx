import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import EditLocation from "../page/location/EditLocation";
import { getCities } from "@/services/general";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("id=loc1"), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock("@/services/location", () => ({
  getLocationById: jest.fn(() =>
    Promise.resolve({ data: { id: "loc1", name: "Store 1", store: [] } })
  ),
  editLocation: jest.fn()
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

// A native <select> stub for every Combobox instance, distinguished by the
// (translated-to-literal, since useTranslation is mocked identity) `placeholder`
// prop each call site passes — this exercises the REAL onChange handler in
// EditLocation.jsx (and therefore the real race-guard logic), just without
// simulating cmdk/Popover open-and-click mechanics irrelevant to this test.
jest.mock("@/components/ui/combobox", () => ({
  Combobox: function ComboboxStub({ options, value, onChange, placeholder }) {
    return (
      <select
        data-testid={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}>
        <option value="" />
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
}));

jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() =>
    Promise.resolve([
      { kode_prov: "P1", nama_provinsi: "Province A" },
      { kode_prov: "P2", nama_provinsi: "Province B" }
    ])
  ),
  getCities: jest.fn(),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));

const deferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <EditLocation />
    </QueryClientProvider>
  );
};

// Regression coverage for a real async race in EditLocation.jsx: rapidly
// changing province twice before the first `getCities` call resolves could
// let the stale first response land after the second and overwrite it,
// showing cities for the wrong province. Reverting the `citiesRequestRef`
// guard (src/page/location/EditLocation.jsx) makes this test fail — the
// city dropdown would end up populated with Province A's cities even
// though Province B is the one actually selected.
describe("EditLocation — province→city cascade race condition", () => {
  test("a late-resolving stale response for the first province does not overwrite the second province's cities", async () => {
    const provinceACities = deferred();
    const provinceBCities = deferred();
    getCities.mockImplementation((code) => {
      if (code === "P1") return provinceACities.promise;
      if (code === "P2") return provinceBCities.promise;
      return Promise.resolve([]);
    });

    renderPage();

    // The province/city cascade lives under the "alamat" (address) tab, not
    // the default-active tab. Radix Tabs' trigger needs a pointerdown-style
    // event to switch (a plain `click` does not trigger onValueChange in
    // jsdom) — matches the existing working pattern in
    // ReportSettingsPage.test.jsx.
    fireEvent.mouseDown(await screen.findByText("page.location.form.tabAlamat"));

    const provinceSelect = await screen.findByTestId("page.location.form.selectProvince");

    // User picks Province A, then rapidly switches to Province B before
    // A's city lookup has resolved.
    fireEvent.change(provinceSelect, { target: { value: "P1" } });
    await waitFor(() => expect(getCities).toHaveBeenCalledWith("P1"));

    fireEvent.change(provinceSelect, { target: { value: "P2" } });
    await waitFor(() => expect(getCities).toHaveBeenCalledWith("P2"));

    // Resolve out of order: B (the latest, correct selection) finishes
    // first, then the stale A request finishes after it.
    provinceBCities.resolve([{ kode_kab: "B1", nama_kabupaten: "City in B" }]);
    await waitFor(() => {
      const citySelect = screen.getByTestId("page.location.form.selectCity");
      expect(citySelect).toHaveTextContent("City in B");
    });

    provinceACities.resolve([{ kode_kab: "A1", nama_kabupaten: "City in A" }]);

    // Give the stale-then-resolved promise's microtask a chance to run and
    // (if the guard were broken) incorrectly overwrite the city list.
    await new Promise((r) => setTimeout(r, 50));

    const citySelect = screen.getByTestId("page.location.form.selectCity");
    expect(citySelect).toHaveTextContent("City in B");
    expect(citySelect).not.toHaveTextContent("City in A");
    expect(provinceSelect.value).toBe("P2");
  });
});
