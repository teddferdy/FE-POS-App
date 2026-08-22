import { buildPaletteGroups, filterPaletteGroups, extraParents } from "@/utils/command-palette";
import { sidebarMenuSuperAdmin, sidebarMenuCashier } from "@/utils/sidebar-menu";

const t = (key, opts) => opts?.defaultValue ?? key;

describe("buildPaletteGroups", () => {
  it("mengelompokkan section sidebar dengan judul dari i18nKey", () => {
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const titles = groups.map((g) => g.title);
    expect(titles).toContain("POS & Penjualan");
    expect(titles).toContain("Master Data");
    expect(titles).toContain("Pengaturan");
    // grup Utama berisi item direct (Dashboard) dan muncul paling awal
    expect(groups[0].id).toBe("main");
    expect(groups[0].items.some((i) => i.path === "/dashboard-super-admin")).toBe(true);
  });

  it("item section dinormalisasi: path, label fallback ke title, icon terbawa", () => {
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const kasir = groups.flatMap((g) => g.items).find((i) => i.path === "/home");
    expect(kasir.label).toBe("Kasir");
    expect(kasir.icon).toBeDefined();
    expect(typeof kasir.keywords).toBe("string");
  });

  it("extra page yang sudah ada di sidebar tidak diduplikasi di grup Lainnya", () => {
    const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);
    const more = groups.find((g) => g.id === "more");
    const morePaths = (more?.items || []).map((i) => i.path);
    expect(morePaths).not.toContain("/member-list"); // ada di sidebar
    expect(morePaths).not.toContain("/role-management");
  });

  it("extra page disembunyikan bila induknya tidak diizinkan", () => {
    // menu kasir hanya punya /home & /member-list
    const cashierMenu = [{ ...sidebarMenuCashier[0], actions: ["view"] }, sidebarMenuCashier[1]];
    const groups = buildPaletteGroups(cashierMenu, t);
    const morePaths = (groups.find((g) => g.id === "more")?.items || []).map((i) => i.path);
    // induk /add-user (/employee-list | /user-list) tidak ada -> disembunyikan
    expect(morePaths).not.toContain("/add-user");
    expect(morePaths).not.toContain("/add-product");
    // tanpa induk wajib: support & notification tetap tampil
    expect(morePaths).toContain("/support");
    expect(morePaths).toContain("/notification");
  });

  it("/add-* menuntut action 'add' pada halaman induk", () => {
    const menuViewOnly = [
      { href: "/product-list", actions: ["view"] },
      { href: "/category-list", actions: ["view", "add"] }
    ];
    const groups = buildPaletteGroups(menuViewOnly, t);
    const morePaths = (groups.find((g) => g.id === "more")?.items || []).map((i) => i.path);
    expect(morePaths).not.toContain("/add-product"); // parent view-only
    expect(morePaths).toContain("/add-category"); // parent punya add
    expect(extraParents["/add-product"]).toEqual(["/product-list"]);
  });
});

describe("filterPaletteGroups", () => {
  const groups = buildPaletteGroups(sidebarMenuSuperAdmin, t);

  it("query kosong mengembalikan semua grup", () => {
    expect(filterPaletteGroups(groups, "   ", t)).toHaveLength(groups.length);
  });

  it("memfilter item per grup dan membuang grup kosong", () => {
    const filtered = filterPaletteGroups(groups, "kasir", t);
    expect(filtered.length).toBeGreaterThan(0);
    const allItems = filtered.flatMap((g) => g.items);
    expect(allItems.some((i) => i.path === "/home")).toBe(true);
    expect(
      allItems.every((i) => `${i.label} ${i.keywords} ${i.path}`.toLowerCase().includes("kasir"))
    ).toBe(true);
  });
});
