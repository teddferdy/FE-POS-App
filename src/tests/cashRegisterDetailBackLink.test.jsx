import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import CashRegisterDetail from "../page/cash-register/CashRegisterDetail";

// C03 (Phase 13/14): CashRegisterDetail's "not found" state passed
// backLink="/cash-register-history" (a hyphen) to PageHeader, but the actual
// route is "/cash-register/history" (finance.routes.jsx:68). PageHeader's
// back-arrow button navigates to whatever `backLink` resolves to with no
// existence check, so clicking it landed on the catch-all NotFoundPage — a
// reproducible 404 when drilling into register history -> detail -> back
// (or on any direct/stale navigation to this page with no `item` in state).

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("react-cookie", () => ({
  useCookies: () => [{ activeStore: "1" }]
}));

jest.mock("@/services/order", () => ({
  getOrdersByStore: jest.fn(() => Promise.resolve({ data: [] }))
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: undefined })
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CashRegisterDetail />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("CashRegisterDetail back navigation (C03)", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("the header back button navigates to the real /cash-register/history route, not a broken hyphenated path", () => {
    renderPage();

    // The header's back arrow is the icon-only outline button rendered by
    // PageHeader after its 3 breadcrumb buttons (home / cashier / history) —
    // it has no accessible name of its own (icon-only), so it's targeted by
    // excluding every button that does have visible text content.
    const buttons = screen.getAllByRole("button");
    const backButton = buttons.find((b) => b.textContent.trim() === "");
    expect(backButton).toBeTruthy();
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/cash-register/history");
    expect(mockNavigate).not.toHaveBeenCalledWith("/cash-register-history");
  });
});
