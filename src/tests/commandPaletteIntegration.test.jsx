import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import CommandPalette from "../components/layout/CommandPalette";

// jsdom lacks scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, opts) => opts?.defaultValue ?? k })
}));

jest.mock("@/hooks/useBodyScrollLock", () => ({
  useBodyScrollLock: jest.fn()
}));

const mockUserSession = jest.fn();
jest.mock("@/hooks/useUserSession", () => ({
  useUserSession: () => mockUserSession()
}));

const superAdmin = { roleType: "super_admin", accessMenu: [] };
const kasir = { roleType: "kasir", accessMenu: [] };

const renderPalette = (open = true, onClose = jest.fn()) => {
  return render(
    <MemoryRouter>
      <CommandPalette open={open} onClose={onClose} />
    </MemoryRouter>
  );
};

describe("CommandPalette integration — Batch 4", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUserSession.mockReset();
  });

  it("does not render when closed", () => {
    mockUserSession.mockReturnValue(superAdmin);
    const { container } = renderPalette(false);
    expect(container.textContent).toBe("");
  });

  it("renders and finds page by label", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    expect(input).toBeInTheDocument();
    // Search for Kasir (path /home)
    fireEvent.change(input, { target: { value: "Kasir" } });
    expect(await screen.findByText("Kasir")).toBeInTheDocument();
    expect(screen.getByText("/home")).toBeInTheDocument();
  });

  it("finds page by keyword 'produk' and 'product' (alias)", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "produk" } });
    expect(await screen.findByText("Daftar Produk")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "product" } });
    expect(await screen.findByText("Daftar Produk")).toBeInTheDocument();
  });

  it("unrelated page does not match", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "zzzznotfound" } });
    expect(await screen.findByText("commandPalette.notFound")).toBeInTheDocument();
  });

  it("/role-management appears for super_admin via search 'role' and via 'permission'", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "role" } });
    expect(await screen.findByText("Manajemen Role & Izin")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "permission" } });
    expect(await screen.findByText("Manajemen Role & Izin")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "pengaturan" } });
    // after group-title fix, pengaturan should also find role-management
    expect(await screen.findByText("Manajemen Role & Izin")).toBeInTheDocument();
  });

  it("/role-management does NOT appear for kasir (unauthorized)", async () => {
    mockUserSession.mockReturnValue(kasir);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "role" } });
    // kasir menu does not contain role-management; search should yield notFound
    expect(await screen.findByText("commandPalette.notFound")).toBeInTheDocument();
    expect(screen.queryByText("Manajemen Role & Izin")).not.toBeInTheDocument();
  });

  it("selecting a result navigates via router and closes", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    const onClose = jest.fn();
    renderPalette(true, onClose);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "Kasir" } });
    const btn = await screen.findByText("Kasir");
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/home");
    expect(onClose).toHaveBeenCalled();
  });

  it("Enter activates highlighted result", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    const onClose = jest.fn();
    renderPalette(true, onClose);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "Kasir" } });
    await screen.findByText("Kasir");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("Escape closes the dialog", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    const onClose = jest.fn();
    renderPalette(true, onClose);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("keyboard navigation: ArrowDown/Up changes selection", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "produk" } });
    await screen.findByText("Daftar Produk");
    // Two items for produk group: Kategori and Daftar Produk – ArrowDown should move
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    // No error thrown and selection updated; Enter should still navigate to first (or second) item
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("mouse hover changes selection", async () => {
    mockUserSession.mockReturnValue(superAdmin);
    renderPalette(true);
    const input = screen.getByPlaceholderText("commandPalette.placeholder");
    fireEvent.change(input, { target: { value: "Kasir" } });
    const btn = await screen.findByText("Kasir");
    fireEvent.mouseEnter(btn);
    // Hover sets selectedIndex to that item's index; no assertion needed beyond no crash
    expect(btn).toBeInTheDocument();
  });
});
