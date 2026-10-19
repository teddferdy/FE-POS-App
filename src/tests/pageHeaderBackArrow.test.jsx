import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PageHeader from "../components/ui/PageHeader";

// UX-01: PageHeader rendered the back arrow only when `backLink` was set, so
// 14 Add/Edit pages that passed only `onBack` (the cancel-confirm modal) —
// e.g. AddExpense, AddIngredient, AddAdmin, AddStockTransfer — showed no back
// arrow at all. The icon-only button also had no accessible name.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("@/hooks/useUserSession", () => ({
  useUserSession: () => null
}));

jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => null
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate
}));

describe("PageHeader back arrow (UX-01)", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders with only onBack and calls it instead of navigating", () => {
    const onBack = jest.fn();
    render(<PageHeader title="Tambah Biaya" onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: "common.back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("onBack wins over backLink so the unsaved-changes confirm is not bypassed", () => {
    const onBack = jest.fn();
    render(<PageHeader title="Edit Shift" backLink="/shift-list" onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: "common.back" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("with only backLink it navigates to that route", () => {
    render(<PageHeader title="Detail" backLink="/promo-list" />);

    fireEvent.click(screen.getByRole("button", { name: "common.back" }));

    expect(mockNavigate).toHaveBeenCalledWith("/promo-list");
  });

  test("is a non-submitting button so it never submits an enclosing form", () => {
    render(<PageHeader title="Tambah Produk" onBack={() => {}} />);

    expect(screen.getByRole("button", { name: "common.back" })).toHaveAttribute("type", "button");
  });

  test("list pages without backLink or onBack show no back arrow", () => {
    render(<PageHeader title="Daftar Produk" />);

    expect(screen.queryByRole("button", { name: "common.back" })).not.toBeInTheDocument();
  });
});
