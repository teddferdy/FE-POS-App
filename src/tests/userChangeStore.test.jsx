import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AdminList from "../page/user/AdminList";
import { changeRoleUser } from "@/services/user";

// The prod `admin` account lost its store (403 "Store assignment required"
// on every store-scoped endpoint) and no page could reassign it: the BE
// already allows a global super_admin to move a user via
// PUT /auth/change-profile-user, but FE `changeRoleUser` had no caller.
// AdminList also read `name`/`storeName`, which GET /auth/get-all-user never
// returns (it returns the raw model: fullName, userName, store id).

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserverStub;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k })
}));

let mockSessionUser;
jest.mock("react-cookie", () => ({
  useCookies: () => [{ user: mockSessionUser }, jest.fn(), jest.fn()]
}));

jest.mock("@/hooks/useUserSession", () => ({ useUserSession: () => null }));
jest.mock("@/contexts/StoreContext", () => ({ useStore: () => null }));
jest.mock("@/utils/permission", () => ({ canAccess: () => true }));

jest.mock("@/services/user", () => ({
  getAllUsers: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 2,
          fullName: "Admin Toko",
          userName: "admin",
          roleType: "admin",
          store: null,
          status: "active"
        },
        {
          id: 3,
          fullName: "Kasir Satu",
          userName: "kasir1",
          roleType: "kasir",
          store: 7,
          status: "active"
        },
        {
          id: 1,
          fullName: "Vendor",
          userName: "root",
          roleType: "super_admin",
          store: null,
          status: "active"
        }
      ]
    })
  ),
  changeUserStatus: jest.fn(),
  changeRoleUser: jest.fn(() => Promise.resolve({ message: "ok" }))
}));

jest.mock("@/services/location", () => ({
  getAllLocation: jest.fn(() =>
    Promise.resolve({
      data: [
        { id: 7, name: "Bakso ABC" },
        { id: 8, name: "Bakso Dua" }
      ]
    })
  )
}));

// Radix popover/cmdk is unreliable in jsdom; a native select keeps the
// contract (id, options, value, onChange) under test.
jest.mock("@/components/ui/combobox", () => ({
  Combobox: ({ id, options, value, onChange }) => (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn()
}));

const renderList = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AdminList />
    </QueryClientProvider>
  );

const ACTION = "page.user.changeStore.action";

describe("AdminList user columns", () => {
  beforeEach(() => {
    mockSessionUser = { roleType: "super_admin", store: null };
  });

  test("shows fullName and resolves the store id to its name", async () => {
    renderList();
    expect(await screen.findByText("Kasir Satu")).toBeInTheDocument();
    expect(await screen.findByText("Bakso ABC")).toBeInTheDocument();
    expect(screen.getByText("Admin Toko")).toBeInTheDocument();
  });
});

describe("Change store action", () => {
  beforeEach(() => {
    changeRoleUser.mockClear();
    mockSessionUser = { roleType: "super_admin", store: null };
  });

  test("a global super admin gets it on non-super_admin rows only", async () => {
    renderList();
    await screen.findByText("Admin Toko");
    // admin + kasir rows; never the super_admin row (D-09: vendor stays global)
    expect(screen.getAllByTitle(ACTION)).toHaveLength(2);
  });

  test("a store-bound admin never sees it (the BE refuses with 403)", async () => {
    mockSessionUser = { roleType: "admin", store: 7 };
    renderList();
    await screen.findByText("Admin Toko");
    expect(screen.queryByTitle(ACTION)).not.toBeInTheDocument();
  });

  test("assigns a store to the unassigned admin with only { id, store }", async () => {
    renderList();
    await screen.findByText("Admin Toko");
    fireEvent.click(screen.getAllByTitle(ACTION)[0]);

    expect(await screen.findByText("page.user.changeStore.none")).toBeInTheDocument();
    const select = await screen.findByLabelText(/page.user.changeStore.newStore/);
    await waitFor(() => expect(select.querySelectorAll("option")).toHaveLength(3));
    fireEvent.change(select, { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "page.user.changeStore.save" }));

    await waitFor(() => expect(changeRoleUser).toHaveBeenCalledTimes(1));
    expect(changeRoleUser.mock.calls[0][0]).toEqual({ id: 2, store: 8 });
  });

  test("saving without a choice or with the current store is refused locally", async () => {
    renderList();
    await screen.findByText("Kasir Satu");
    fireEvent.click(screen.getAllByTitle(ACTION)[1]);
    const save = await screen.findByRole("button", { name: "page.user.changeStore.save" });

    fireEvent.click(save);
    expect(await screen.findByRole("alert")).toHaveTextContent("page.user.changeStore.required");

    const select = screen.getByLabelText(/page.user.changeStore.newStore/);
    await waitFor(() => expect(select.querySelectorAll("option")).toHaveLength(3));
    fireEvent.change(select, { target: { value: "7" } });
    fireEvent.click(save);
    expect(await screen.findByRole("alert")).toHaveTextContent("page.user.changeStore.sameStore");
    expect(changeRoleUser).not.toHaveBeenCalled();
  });
});
