import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import QrOrderFreshness from "../page/customer-order/QrOrderFreshness";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, opts) => (opts && typeof opts === "object" ? `${k}:${JSON.stringify(opts)}` : k),
    i18n: { language: "en" }
  })
}));

// DR-10 (BA §35.7): stale state is visibly stale and never authoritative.

describe("QrOrderFreshness", () => {
  test("renders nothing before the first successful load", () => {
    const { container } = render(<QrOrderFreshness updatedAt={0} onRetry={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the age of the list without a live region", () => {
    render(<QrOrderFreshness updatedAt={Date.now() - 42000} onRetry={jest.fn()} />);
    const text = screen.getByTestId("qr-orders-freshness");
    expect(text).toHaveTextContent('page.customerOrder.freshness.updated:{"seconds":42}');
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("a failed refresh announces the list as stale and offers retry", () => {
    const onRetry = jest.fn();
    render(<QrOrderFreshness updatedAt={Date.now() - 90000} isError onRetry={onRetry} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("page.customerOrder.freshness.stale");
    fireEvent.click(screen.getByText("page.customerOrder.retry"));
    expect(onRetry).toHaveBeenCalled();
  });
});
