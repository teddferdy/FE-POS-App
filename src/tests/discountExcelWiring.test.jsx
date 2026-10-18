import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

const mockGetAllDiscount = jest.fn();
const mockTemplate = jest.fn();
const mockData = jest.fn();
const mockUpload = jest.fn();

jest.mock("@/services/discount", () => ({
  getAllDiscount: (...a) => mockGetAllDiscount(...a),
  deleteDiscount: jest.fn(),
  editDiscount: jest.fn(),
  downloadDiscountTemplate: (...a) => mockTemplate(...a),
  downloadDiscountExcel: (...a) => mockData(...a),
  uploadDiscountExcel: (...a) => mockUpload(...a)
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: "id" } })
}));
jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ activeStoreId: "", activeStoreName: "", setActiveStore: jest.fn() })
}));
let mockUser = null;
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockUser }]
}));
jest.mock("@/hooks/useUserSession", () => ({ useUserSession: () => mockUser }));

import DiscountList from "@/page/discount/DiscountList";

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <DiscountList />
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAllDiscount.mockResolvedValue({ data: [], pagination: {} });
  mockUser = { id: 1, roleType: "super_admin", store: "" };
});

describe("DiscountList excel actions wiring", () => {
  test("super_admin sees template and data buttons; template click downloads the template", async () => {
    renderPage();
    const templateBtn = await screen.findByText("page.discount.button.downloadTemplate");
    expect(screen.getByText("page.discount.button.downloadData")).toBeInTheDocument();
    fireEvent.click(templateBtn);
    await waitFor(() => expect(mockTemplate).toHaveBeenCalledTimes(1));
  });

  test("data button downloads the discount excel export", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("page.discount.button.downloadData"));
    await waitFor(() => expect(mockData).toHaveBeenCalledTimes(1));
  });

  test("admin does not see the super_admin-only excel actions", async () => {
    mockUser = { id: 2, roleType: "admin", store: 1 };
    renderPage();
    await waitFor(() => expect(mockGetAllDiscount).toHaveBeenCalled());
    expect(screen.queryByText("page.discount.button.downloadTemplate")).toBeNull();
    expect(screen.queryByText("page.discount.button.downloadData")).toBeNull();
    expect(screen.queryByText("page.discount.button.uploadExcel")).toBeNull();
  });

  test("import button opens the modal and uploads through uploadDiscountExcel", async () => {
    renderPage();
    fireEvent.click(await screen.findByText("page.discount.button.uploadExcel"));
    expect(await screen.findByText("page.discount.upload.title")).toBeInTheDocument();

    const file = new File(["kode,nama"], "diskon.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText("common.upload"));

    await waitFor(() => expect(mockUpload).toHaveBeenCalledWith(file));
  });
});
