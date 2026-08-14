import React from "react";
import { render, screen } from "@testing-library/react";
import PaymentBreakdown from "@/components/dashboard-super-admin/PaymentBreakdown";

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("PaymentBreakdown", () => {
  test("renders known bucket types with their labels", () => {
    render(
      <PaymentBreakdown
        paymentBreakdown={{
          totalPayments: 200000,
          byType: [{ type: "cash", amount: 120000 }],
          byMethod: [{ method: "cash", count: 3 }]
        }}
      />
    );
    expect(screen.getByText("Tunai")).toBeTruthy();
  });

  test("falls back to the 'other' bucket for unknown/prototype-injected types without crashing", () => {
    const byType = [
      { type: "cash", amount: 120000 },
      { type: "__proto__", amount: 80000 },
      { type: "constructor", amount: 5000 }
    ];
    const { container } = render(
      <PaymentBreakdown paymentBreakdown={{ totalPayments: 205000, byType, byMethod: [] }} />
    );
    expect(screen.getAllByText("Lainnya").length).toBeGreaterThan(0);
    expect(screen.getByText("Tunai")).toBeTruthy();
    expect(container.textContent).not.toContain("undefined");
  });

  test("renders an empty state when there is no data", () => {
    render(<PaymentBreakdown paymentBreakdown={{}} />);
    expect(screen.getByText("Belum ada data pembayaran")).toBeTruthy();
  });
});
