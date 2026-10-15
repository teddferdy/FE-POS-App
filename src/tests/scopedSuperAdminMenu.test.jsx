import {
  filterMenuByPermission,
  filterNavCategoriesByPermission,
  canAccess,
  hasMenuAccess
} from "../utils/permission";
import { bypassesMenuPermissions, isMenuScopedSuperAdmin } from "../utils/role";
import { navCategories, sidebarMenuSuperAdmin } from "../utils/sidebar-menu";
import BAKSO_MENU from "./fixtures-bakso-admin-access-menu.json";

// A super_admin account carrying its own accessMenu (BE login sends
// accessMenuScoped: true) sees only those menus — e.g. the bakso client's
// bakso_admin — while every other super_admin keeps seeing everything.

const scoped = { id: 30, roleType: "super_admin", accessMenuScoped: true, accessMenu: BAKSO_MENU };
const fullSuper = {
  id: 6,
  roleType: "super_admin",
  accessMenu: [{ menu: "dashboard", read: true }]
};

const categoryHrefs = (user) => {
  const cats = filterNavCategoriesByPermission(navCategories.super_admin, user);
  return Object.fromEntries(
    cats.map((c) => [c.id, c.sections.flatMap((s) => s.items.map((i) => i.href))])
  );
};

const leafHrefs = (items) =>
  items.flatMap((item) => (item.children?.length ? leafHrefs(item.children) : [item.href]));

beforeEach(() => sessionStorage.clear());

describe("role helpers", () => {
  test("only a flagged super_admin is menu-scoped", () => {
    expect(isMenuScopedSuperAdmin(scoped)).toBe(true);
    expect(bypassesMenuPermissions(scoped)).toBe(false);
    expect(isMenuScopedSuperAdmin(fullSuper)).toBe(false);
    expect(bypassesMenuPermissions(fullSuper)).toBe(true);
    expect(bypassesMenuPermissions({ roleType: "admin", accessMenuScoped: true })).toBe(false);
  });
});

describe("bakso_admin navigation categories", () => {
  test("Lokasi and Produk & Promo show every item", () => {
    const hrefs = categoryHrefs(scoped);
    expect(hrefs.location).toEqual([
      "/location-list",
      "/price-list-template",
      "/table-list",
      "/reservation"
    ]);
    expect(hrefs.produk).toEqual(
      expect.arrayContaining([
        "/category-list",
        "/product-list",
        "/bundle",
        "/discount-list",
        "/promo-list"
      ])
    );
  });

  test("Membership-SDM and Pengaturan are gone", () => {
    const hrefs = categoryHrefs(scoped);
    expect(hrefs.membershipSdm).toBeUndefined();
    expect(hrefs.pengaturan).toBeUndefined();
  });

  test("Bahan Baku: supplier, ingredients, stock, production — no purchasing or delivery", () => {
    const inv = categoryHrefs(scoped).inventory;
    expect(inv).toEqual(
      expect.arrayContaining([
        "/supplier-category",
        "/supplier",
        "/ingredient-category",
        "/ingredient",
        "/stock-opname",
        "/stock-adjustment",
        "/stock-transfer",
        "/stock-history",
        "/low-stock",
        "/production-order",
        "/bom"
      ])
    );
    for (const hidden of [
      "/purchase-order",
      "/goods-request",
      "/goods-receipt",
      "/purchase-return",
      "/delivery-orders",
      "/driver-list"
    ]) {
      expect(inv).not.toContain(hidden);
    }
  });

  test("Keuangan & Laporan: sales + daily reports only", () => {
    const rep = categoryHrefs(scoped).laporan;
    expect(rep).toEqual(
      expect.arrayContaining(["/report/sales", "/best-selling", "/report/daily"])
    );
    for (const hidden of [
      "/expense-category",
      "/expense",
      "/accounting",
      "/report/cash-flow",
      "/advanced-reporting"
    ]) {
      expect(rep).not.toContain(hidden);
    }
  });

  test("a full super_admin still sees every category item", () => {
    expect(filterNavCategoriesByPermission(navCategories.super_admin, fullSuper)).toBe(
      navCategories.super_admin
    );
  });
});

describe("bakso_admin POS menu and actions", () => {
  test("cashier and returns stay; the kitchen (dapur) items are gone", () => {
    const leaves = leafHrefs(
      filterMenuByPermission(JSON.parse(JSON.stringify(sidebarMenuSuperAdmin)), scoped)
    );
    expect(leaves).toEqual(
      expect.arrayContaining([
        "/home",
        "/cash-register/current",
        "/sales-return",
        "/accounts-receivable"
      ])
    );
    for (const hidden of [
      "/kitchen-display",
      "/qr-order-management",
      "/queue-list",
      "/waiter-request",
      "/tax-list",
      "/role-management"
    ]) {
      expect(leaves).not.toContain(hidden);
    }
  });

  test("page actions follow the list (e.g. BOM edit allowed, Accounting not)", () => {
    expect(canAccess(scoped, "/bom", "edit")).toBe(true);
    expect(canAccess(scoped, "/table", "add")).toBe(true);
    expect(canAccess(scoped, "/expense", "view")).toBe(false);
    expect(hasMenuAccess(scoped, "/accounting")).toBe(false);
    expect(canAccess(fullSuper, "/expense", "view")).toBe(true);
  });
});
