import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ParkedCartPanel from "../page/cashier/components/ParkedCartPanel";
import { getParkedCarts, resumeParkedCart } from "@/services/parked-cart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback ?? key })
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/services/parked-cart", () => ({
  getParkedCarts: jest.fn(),
  resumeParkedCart: jest.fn(),
  cancelParkedCart: jest.fn()
}));

const renderPanel = (queryClient, props) =>
  render(
    <QueryClientProvider client={queryClient}>
      <ParkedCartPanel {...props} />
    </QueryClientProvider>
  );

// Regression coverage for the F3 design amendment's "mutation-response
// isolation" requirement: a resume mutation must capture the store at
// invocation time and act only against that store's query-cache entry,
// never whatever store happens to be selected once the response resolves.
describe("ParkedCartPanel — store-switch mutation isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("a resume started on Store A invalidates only Store A's cache, even after switching to Store B before the response resolves", async () => {
    getParkedCarts.mockImplementation(({ store }) =>
      Promise.resolve({
        data:
          store === "A"
            ? [
                {
                  id: 1,
                  status: "active",
                  tableId: null,
                  displayTotalItems: 1,
                  createdAt: new Date().toISOString()
                }
              ]
            : []
      })
    );

    let resolveResume;
    resumeParkedCart.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveResume = resolve;
        })
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const onResumed = jest.fn();

    const { rerender } = renderPanel(queryClient, {
      store: "A",
      onResumed,
      hasCartItems: false
    });

    await screen.findByText("#1");
    fireEvent.click(screen.getByText("Resume"));

    await waitFor(() => expect(resumeParkedCart).toHaveBeenCalledWith(1));

    // Switch stores while the resume request from Store A is still in flight.
    rerender(
      <QueryClientProvider client={queryClient}>
        <ParkedCartPanel store="B" onResumed={onResumed} hasCartItems={false} />
      </QueryClientProvider>
    );

    // Only now does the in-flight Store A resume resolve.
    await act(async () => {
      resolveResume({ data: { id: 1, status: "resumed", cartPayload: { items: [] } } });
    });

    await waitFor(() => expect(onResumed).toHaveBeenCalled());

    expect(invalidateSpy).toHaveBeenCalledWith(["parked-carts", "A"]);
    expect(invalidateSpy).not.toHaveBeenCalledWith(["parked-carts", "B"]);
  });

  test("resuming with a non-empty live cart asks for confirmation before calling the API, and cancelling the confirmation never calls resume", async () => {
    getParkedCarts.mockResolvedValue({
      data: [
        {
          id: 7,
          status: "active",
          tableId: null,
          displayTotalItems: 2,
          createdAt: new Date().toISOString()
        }
      ]
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderPanel(queryClient, { store: "A", onResumed: jest.fn(), hasCartItems: true });

    await screen.findByText("#7");
    fireEvent.click(screen.getByText("Resume"));

    // The confirmation dialog must appear, and resume must NOT have been
    // called yet — the live cart would be destroyed by resume's
    // rehydration, so the check has to happen before the API call.
    await screen.findByText("Resume parked cart?");
    expect(resumeParkedCart).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => expect(screen.queryByText("Resume parked cart?")).not.toBeInTheDocument());
    expect(resumeParkedCart).not.toHaveBeenCalled();
  });
});
