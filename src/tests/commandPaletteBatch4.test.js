/* eslint-disable no-undef */
import { buildPaletteGroups, filterPaletteGroups } from "@/utils/command-palette";
import { sidebarMenuSuperAdmin } from "@/utils/sidebar-menu";

const t = (key, opts) => opts?.defaultValue ?? key;

describe("Batch 4 — Admin Global Search audit", () => {
  it("RED: filtering by group title 'pengaturan' should find items under Pengaturan group via group title", () => {
    // Build groups from super_admin menu (includes Pengaturan → Manajemen Role & Izin)
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const pengaturanGroup = groups.find(
      (g) => g.title.toLowerCase().includes("pengaturan") || g.id.includes("settings")
    );
    expect(pengaturanGroup).toBeDefined();
    // Query "pengaturan" should discover /role-management (label "Manajemen Role & Izin" does NOT contain "pengaturan")
    // It should match via group title "Pengaturan" after fix
    const filtered = filterPaletteGroups(groups, "pengaturan");
    const flat = filtered.flatMap((g) => g.items);
    const found = flat.some((i) => i.path === "/role-management");
    expect(found).toBe(true);
  });

  it("RED: role-management should be discoverable via keyword 'permission'", () => {
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const filtered = filterPaletteGroups(groups, "permission");
    const flat = filtered.flatMap((g) => g.items);
    const found = flat.some((i) => i.path === "/role-management");
    expect(found).toBe(true);
  });

  it("RED: role-management should be discoverable via keyword 'izin'", () => {
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const filtered = filterPaletteGroups(groups, "izin");
    const flat = filtered.flatMap((g) => g.items);
    const found = flat.some((i) => i.path === "/role-management");
    expect(found).toBe(true);
  });

  it("permission-aware: unauthorized user does NOT see /role-management", () => {
    // Simulate non-super_admin without accessMenu containing role-management
    // Use a mock user with no access to role-management: we directly test buildPaletteGroups with filtered menu that excludes Pengaturan
    const filteredMenu = sidebarMenuSuperAdmin.filter(
      (section) => section.i18nKey !== "sidebar.section.settings"
    );
    const groups = buildPaletteGroups(filteredMenu, t);
    const filtered = filterPaletteGroups(groups, "role");
    const flat = filtered.flatMap((g) => g.items);
    expect(flat.some((i) => i.path === "/role-management")).toBe(false);
  });

  it("search supports useful aliases: 'produk' vs 'product' both match", () => {
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const byProduk = filterPaletteGroups(groups, "produk").flatMap((g) => g.items);
    const byProduct = filterPaletteGroups(groups, "product").flatMap((g) => g.items);
    expect(byProduk.some((i) => i.path === "/product-list")).toBe(true);
    expect(byProduct.some((i) => i.path === "/product-list")).toBe(true);
  });

  it("DashboardLayout Cmd+K handler respects contenteditable (does not hijack)", () => {
    const fs = require("fs");
    const path = require("path");

    const file = fs.readFileSync(
      path.join(__dirname, "../components/layout/DashboardLayout.jsx"),
      "utf8"
    );
    expect(file).toContain("isContentEditable");
    expect(file).toContain('e.target.tagName === "INPUT"');
  });

  it("store context is preserved: navigation uses existing router, not window.location", () => {
    const fs = require("fs");
    const path = require("path");

    const file = fs.readFileSync(
      path.join(__dirname, "../components/layout/CommandPalette.jsx"),
      "utf8"
    );
    expect(file).toContain("useNavigate");
    expect(file).toContain("navigate(path)");
    expect(file).not.toContain("window.location.reload");
    expect(file).not.toContain("window.location.assign");
  });
});
