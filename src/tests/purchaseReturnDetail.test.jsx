import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DetailPurchaseReturn from "../page/purchase-return/DetailPurchaseReturn";
import { getPurchaseReturnById } from "@/services/purchase-return";
import { resolveReturnedBy } from "@/services/purchase-order";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("@/services/purchase-return", () => ({
  getPurchaseReturnById: jest.fn()
}));
jest.mock("@/services/index", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const ret = {
  id: 11,
  returnNumber: "PR-20240101-000001",
  storeData: { name: "Store A" },
  reason: "damaged",
  returnedBy: { name: "Kasir" },
  createdAt: "2024-01-01T00:00:00.000Z",
  status: "pending",
  resolution: null,
  totalAmount: 30000,
  purchaseOrder: { orderNumber: "PO-1" },
  items: [
    {
      product: { name: "Item A" },
      qty: 2,
      unit: "pcs",
      price: 10000,
      subtotal: 20000,
      notes: null
    },
    {
      product: { name: "Item B" },
      qty: 1.5,
      unit: "pcs",
      price: 10000,
      subtotal: 15000,
      notes: null
    }
  ]
};

const renderDetail = (initialEntries = ["/purchase-return/detail?id=11"]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/purchase-return/detail" element={<DetailPurchaseReturn />} />
          <Route path="/purchase-return" element={<div>RETURN_LIST</div>} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

// Phase 32 Batch A (PR-10): safe numeric totals, live route links,
// authenticated-identity returnedBy.
describe("DetailPurchaseReturn correctness", () => {
  beforeEach(() => {
    getPurchaseReturnById.mockResolvedValue({ data: ret });
  });

  test("total quantity uses safe numeric handling (no parseInt truncation)", async () => {
    renderDetail();
    await waitFor(() =>
      expect(screen.getAllByText("PR-20240101-000001").length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText("3.5").length).toBeGreaterThan(0);
  });

  test("breadcrumb list navigation lands on the live /purchase-return route", async () => {
    renderDetail();
    await waitFor(() =>
      expect(screen.getAllByText("PR-20240101-000001").length).toBeGreaterThan(0)
    );
    fireEvent.click(screen.getByText("page.purchaseReturn.detail.breadcrumb.list"));
    await waitFor(() => expect(screen.getByText("RETURN_LIST")).toBeInTheDocument());
  });
});

describe("resolveReturnedBy — authenticated identity preferred", () => {
  test("uses the authenticated user id when available", () => {
    expect(resolveReturnedBy({ id: 42 }, "Some Name")).toBe(42);
  });

  test("falls back to the typed name when no authenticated id exists", () => {
    expect(resolveReturnedBy(null, "Some Name")).toBe("Some Name");
    expect(resolveReturnedBy({}, "Some Name")).toBe("Some Name");
  });

  test("returns null when neither exists", () => {
    expect(resolveReturnedBy(null, "")).toBeNull();
    expect(resolveReturnedBy(null, null)).toBeNull();
    expect(resolveReturnedBy(undefined, undefined)).toBeNull();
  });
});
