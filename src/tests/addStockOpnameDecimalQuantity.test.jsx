import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import AddStockOpname from "../page/stock-opname/AddStockOpname";
import { addStockOpname } from "../services/stock";

// jsdom has no ResizeObserver; some UI primitives measure on mount.
window.ResizeObserver =
  window.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() }
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()]
}));
jest.mock("../services/stock", () => ({
  addStockOpname: jest.fn(),
  updateStockOpname: jest.fn(),
  changeStockOpnameStatus: jest.fn(),
  downloadStockOpnameTemplate: jest.fn(),
  getStockOpnameById: jest.fn(() => Promise.resolve({ data: null }))
}));
jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() => Promise.resolve({ data: [] }))
}));
jest.mock("@/services/product", () => ({
  getAllProduct: jest.fn(() => Promise.resolve({ data: [] }))
}));

const renderWithProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AddStockOpname />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// The four quantity inputs on a row share placeholder="0" and are rendered
// in this fixed column order: stokAwal, barangMasuk, barangKeluar, stokFisik.
const getQuantityInputs = () => screen.getAllByPlaceholderText("0");

const saveDraft = async () => {
  const draftButton = screen.getByText("page.stockOpname.button.saveDraft");
  fireEvent.click(draftButton);
  const confirmButton = await screen.findByText("common.yesSaveDraft");
  fireEvent.click(confirmButton);
};

describe("AddStockOpname quantity decimal handling", () => {
  beforeEach(() => {
    addStockOpname.mockReset().mockResolvedValue({ data: { id: 1 } });
  });

  test("preserves a fractional stokAwalJumlah instead of stripping the decimal point", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "12.5" } });

    expect(stokAwal.value).toBe("12.5");
  });

  test("preserves a leading-fractional value (0.5)", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "0.5" } });

    expect(stokAwal.value).toBe("0.5");
  });

  test("preserves a two-decimal-digit value (1.25)", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "1.25" } });

    expect(stokAwal.value).toBe("1.25");
  });

  test("still accepts a plain integer (12)", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "12" } });

    expect(stokAwal.value).toBe("12");
  });

  test("empty input stays empty, not NaN/0/garbage, while the field is being edited", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "12.5" } });
    fireEvent.change(stokAwal, { target: { value: "" } });

    expect(stokAwal.value).toBe("");
  });

  test("non-numeric characters are stripped, consistent with the existing validation contract", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "abc12.5xyz" } });

    expect(stokAwal.value).toBe("12.5");
  });

  test("submitted draft payload preserves the decimal quantity, not a corrupted integer", async () => {
    renderWithProviders();
    const [stokAwal, barangMasuk, barangKeluar, stokFisik] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "12.5" } });
    fireEvent.change(barangMasuk, { target: { value: "0.5" } });
    fireEvent.change(barangKeluar, { target: { value: "1.25" } });
    fireEvent.change(stokFisik, { target: { value: "12" } });

    await saveDraft();

    await waitFor(() => expect(addStockOpname).toHaveBeenCalledTimes(1));
    const payload = addStockOpname.mock.calls[0][0];
    const item = payload.items[0];
    expect(item.stokAwalJumlah).toBe(12.5);
    expect(item.barangMasukJumlah).toBe(0.5);
    expect(item.barangKeluarJumlah).toBe(1.25);
    expect(item.stokFisikJumlah).toBe(12);
  });

  test("submitted draft payload keeps plain-integer quantities as integers", async () => {
    renderWithProviders();
    const [stokAwal, barangMasuk, barangKeluar] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "12" } });
    fireEvent.change(barangMasuk, { target: { value: "3" } });
    fireEvent.change(barangKeluar, { target: { value: "1" } });

    await saveDraft();

    await waitFor(() => expect(addStockOpname).toHaveBeenCalledTimes(1));
    const item = addStockOpname.mock.calls[0][0].items[0];
    expect(item.stokAwalJumlah).toBe(12);
    expect(item.barangMasukJumlah).toBe(3);
    expect(item.barangKeluarJumlah).toBe(1);
  });
});

describe("AddStockOpname decimal contract guards", () => {
  beforeEach(() => {
    addStockOpname.mockReset().mockResolvedValue({ data: { id: 1 } });
  });

  test("magnitude beyond 999999.9999 is rejected, never submitted", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "1000000" } });

    await saveDraft();

    await waitFor(() =>
      expect(screen.getByText("page.stockOpname.validation.quantityTooLarge")).toBeInTheDocument()
    );
    expect(addStockOpname).not.toHaveBeenCalled();
  });

  test("computed stokAkhir has no float dust (10.1 + 0.2 - 0.3 === 10)", async () => {
    renderWithProviders();
    const [stokAwal, barangMasuk, barangKeluar, stokFisik] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "10.1" } });
    fireEvent.change(barangMasuk, { target: { value: "0.2" } });
    fireEvent.change(barangKeluar, { target: { value: "0.3" } });
    fireEvent.change(stokFisik, { target: { value: "10" } });

    await saveDraft();

    await waitFor(() => expect(addStockOpname).toHaveBeenCalledTimes(1));
    const item = addStockOpname.mock.calls[0][0].items[0];
    expect(item.stokAkhirJumlah).toBe(10);
    expect(item.selisihJumlah).toBe(0);
  });

  test("four-decimal-place values survive end to end (1.2345)", async () => {
    renderWithProviders();
    const [stokAwal] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "1.2345" } });

    await saveDraft();

    await waitFor(() => expect(addStockOpname).toHaveBeenCalledTimes(1));
    expect(addStockOpname.mock.calls[0][0].items[0].stokAwalJumlah).toBe(1.2345);
  });

  test("negative computed selisih is preserved, not clamped", async () => {
    renderWithProviders();
    const [stokAwal, barangMasuk, barangKeluar, stokFisik] = getQuantityInputs();

    fireEvent.change(stokAwal, { target: { value: "10" } });
    fireEvent.change(barangMasuk, { target: { value: "0" } });
    fireEvent.change(barangKeluar, { target: { value: "2.5" } });
    fireEvent.change(stokFisik, { target: { value: "5" } });

    await saveDraft();

    await waitFor(() => expect(addStockOpname).toHaveBeenCalledTimes(1));
    const item = addStockOpname.mock.calls[0][0].items[0];
    // akhir = 10 + 0 - 2.5 = 7.5 ; selisih = 5 - 7.5 = -2.5
    expect(item.stokAkhirJumlah).toBe(7.5);
    expect(item.selisihJumlah).toBe(-2.5);
  });
});

describe("hasValidDecimalPrecision / isWithinDecimalMagnitude / roundTo4dp", () => {
  test("predicates mirror the BE DECIMAL(10,4) contract", async () => {
    const { hasValidDecimalPrecision, isWithinDecimalMagnitude, roundTo4dp } =
      await import("../page/stock-opname/AddStockOpname");

    // valid shape + finite
    for (const v of ["1", "12", "0", "1.5", "1.25", "0.125", "10.1234", ".5"]) {
      expect(hasValidDecimalPrecision(v)).toBe(true);
    }
    // invalid shape / precision / non-numeric
    for (const v of ["", "abc", "1.23456", "1.2.3", "Infinity", "-", "."]) {
      expect(hasValidDecimalPrecision(v)).toBe(false);
    }
    // magnitude
    for (const v of ["0", "1.5", "999999.9999"]) {
      expect(isWithinDecimalMagnitude(v)).toBe(true);
    }
    for (const v of ["1000000", "9999999", "Infinity", "abc", ""]) {
      expect(isWithinDecimalMagnitude(v)).toBe(false);
    }

    // rounding is precision-normalizing only, never value-changing
    expect(roundTo4dp(10.000000000000002)).toBe(10);
    expect(roundTo4dp(1.2345)).toBe(1.2345);
    expect(roundTo4dp(7.5)).toBe(7.5);
    expect(roundTo4dp(-2.5)).toBe(-2.5);
  });
});
