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

const mockGetAll = jest.fn();
const mockTemplate = jest.fn();

jest.mock("@/services/purchase-order", () => ({
  getAllPurchaseOrder: (...a) => mockGetAll(...a),
  getPurchaseOrderById: jest.fn(),
  cancelPurchaseOrder: jest.fn(),
  deletePurchaseOrder: jest.fn(),
  returnPurchaseOrder: jest.fn(),
  resolveReturnedBy: (user, fallbackName) => user?.id ?? (fallbackName || null),
  sendToSupplierPurchaseOrder: jest.fn(),
  uploadPurchaseOrderExcel: jest.fn(),
  downloadPurchaseOrderExcel: jest.fn(),
  downloadPurchaseOrderTemplate: (...a) => mockTemplate(...a)
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/inventory", () => ({
  getBatches: jest.fn(() => Promise.resolve({ data: { data: [] } }))
}));
jest.mock("@/services/purchase-payment", () => ({
  recordPayment: jest.fn()
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

import PurchaseOrderList from "@/page/purchase-order/PurchaseOrderList";

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <PurchaseOrderList />
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAll.mockResolvedValue({ data: [], pagination: {} });
  mockUser = { id: 1, roleType: "super_admin", store: "" };
});

describe("PurchaseOrderList excel actions wiring", () => {
  test("super_admin sees the template button and clicking it downloads the template", async () => {
    renderPage();
    const templateBtn = await screen.findByText("page.purchaseOrder.list.downloadTemplate");
    expect(screen.getByText("page.purchaseOrder.list.export")).toBeInTheDocument();
    fireEvent.click(templateBtn);
    await waitFor(() => expect(mockTemplate).toHaveBeenCalledTimes(1));
  });

  test("admin does not see super_admin-only excel actions", async () => {
    mockUser = { id: 2, roleType: "admin", store: 1 };
    renderPage();
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());
    expect(screen.queryByText("page.purchaseOrder.list.downloadTemplate")).toBeNull();
    expect(screen.queryByText("page.purchaseOrder.list.export")).toBeNull();
    expect(screen.queryByText("page.purchaseOrder.list.import")).toBeNull();
  });
});
