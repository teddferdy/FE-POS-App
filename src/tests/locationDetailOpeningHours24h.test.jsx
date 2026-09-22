import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import LocationDetail from "../page/location/LocationDetail";
import { getLocationDetail } from "@/services/location";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams("id=loc1"), jest.fn()]
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("@/services/location", () => ({
  getLocationDetail: jest.fn()
}));
jest.mock("@/services/general", () => ({
  getProvinces: jest.fn(() => Promise.resolve([])),
  getCities: jest.fn(() => Promise.resolve([])),
  getDistricts: jest.fn(() => Promise.resolve([])),
  getVillages: jest.fn(() => Promise.resolve([])),
  getPostalCode: jest.fn(() => Promise.resolve([]))
}));
jest.mock(
  "@/components/organism/abort-controller",
  () =>
    function AbortControllerStub() {
      return <div>abort</div>;
    }
);
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>
}));
jest.mock("leaflet", () => ({
  Icon: { Default: { prototype: {}, mergeOptions: jest.fn() } }
}));
jest.mock("leaflet/dist/leaflet.css", () => ({}), { virtual: true });

const baseLocation = {
  id: "loc1",
  name: "Store 1",
  status: "active",
  // No latitude/longitude — the map panel (react-leaflet) is skipped
  // entirely, keeping this test focused on the opening-hours badge.
  openingHours: [
    { day: "Monday", open: "00:00", close: "23:59", is24Hours: true },
    { day: "Tuesday", open: "09:00", close: "21:00", is24Hours: false },
    { day: "Wednesday", open: null, close: null, is24Hours: false }
  ]
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <LocationDetail />
    </QueryClientProvider>
  );
};

describe("LocationDetail — Phase 39 Batch 6D is24Hours display", () => {
  beforeEach(() => {
    getLocationDetail.mockReset().mockResolvedValue({ data: baseLocation });
  });

  test("a 24-hour day shows the 'Open 24 Hours' badge instead of a time range", async () => {
    renderPage();

    await screen.findByText("page.location.detail.is24Hours");
    expect(screen.queryByText("00:00 - 23:59")).not.toBeInTheDocument();
  });

  test("a normal-hours day still shows its time range, not the 24-hour badge", async () => {
    renderPage();

    await screen.findByText("09:00 - 21:00");
  });

  test("a closed day still shows the closed label, not the 24-hour badge", async () => {
    renderPage();

    await screen.findByText("page.location.detail.closed");
    // Only Monday is 24 hours — exactly one badge should render.
    expect(screen.getAllByText("page.location.detail.is24Hours")).toHaveLength(1);
  });
});
