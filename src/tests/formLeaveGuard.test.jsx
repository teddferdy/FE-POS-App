import React from "react";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { useLeaveGuard } from "../hooks/useLeaveGuard";
import EditDepartment from "../page/department/EditDepartment";

// jsdom lacks ResizeObserver, which the Radix Switch on the form requires.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

// UX-04: every Add/Edit form asked "discard changes?" even when nothing was
// typed. useLeaveGuard leaves straight to the list for a clean form and only
// confirms when the react-hook-form state is dirty.

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

jest.mock("@/hooks/useUserSession", () => ({
  useUserSession: () => null
}));

jest.mock("@/contexts/StoreContext", () => ({
  useStore: () => null
}));

jest.mock("@/services/department", () => ({
  editDepartment: jest.fn(),
  getDepartmentById: jest.fn(() =>
    Promise.resolve({ data: { id: 7, name: "Dapur", description: "", status: "active" } })
  )
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams("id=7")]
}));

describe("useLeaveGuard (UX-04)", () => {
  // Minimal stand-in for a react-hook-form instance.
  const fakeForm = ({ isDirty = false, values = {}, defaults = {} } = {}) => ({
    formState: { isDirty, defaultValues: defaults },
    getValues: () => values
  });

  beforeEach(() => mockNavigate.mockClear());

  test("clean form navigates straight to the target", () => {
    const confirm = jest.fn();
    const form = fakeForm({ values: { name: "A", on: true }, defaults: { on: true, name: "A" } });
    const { result } = renderHook(() => useLeaveGuard(form, "/list", confirm));

    result.current();

    expect(mockNavigate).toHaveBeenCalledWith("/list");
    expect(confirm).not.toHaveBeenCalled();
  });

  test("dirty form asks for confirmation and does not navigate", () => {
    const confirm = jest.fn();
    const { result } = renderHook(() =>
      useLeaveGuard(fakeForm({ isDirty: true }), "/list", confirm)
    );

    result.current();

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("values differing from defaults confirm even while the isDirty snapshot is stale", () => {
    const confirm = jest.fn();
    const form = fakeForm({ values: { name: "Baru" }, defaults: { name: "Lama" } });
    const { result } = renderHook(() => useLeaveGuard(form, "/list", confirm));

    result.current();

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("dirty form arms the browser beforeunload prompt; clean form does not", () => {
    const add = jest.spyOn(window, "addEventListener");
    const { rerender } = renderHook(
      ({ dirty }) => useLeaveGuard(fakeForm({ isDirty: dirty }), "/list", jest.fn()),
      { initialProps: { dirty: false } }
    );
    expect(add).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));

    rerender({ dirty: true });
    expect(add).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    add.mockRestore();
  });
});

describe("EditDepartment leave flow (UX-04 pilot)", () => {
  const renderPage = () =>
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <EditDepartment />
      </QueryClientProvider>
    );

  beforeEach(() => mockNavigate.mockClear());

  test("back arrow on an untouched loaded record goes straight to the list", async () => {
    renderPage();
    await screen.findByDisplayValue("Dapur");

    fireEvent.click(screen.getByRole("button", { name: "common.back" }));

    expect(mockNavigate).toHaveBeenCalledWith("/department-list");
    expect(screen.queryByText("modal.cancelTitle")).not.toBeInTheDocument();
  });

  test("after an edit, Cancel asks before discarding and does not navigate", async () => {
    renderPage();
    fireEvent.change(await screen.findByDisplayValue("Dapur"), { target: { value: "Dapur Baru" } });

    fireEvent.click(screen.getByRole("button", { name: /common.cancel/ }));

    await waitFor(() => expect(screen.getByText("modal.cancelTitle")).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
