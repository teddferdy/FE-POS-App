/* global __dirname */
import fs from "fs";
import path from "path";
import { matchPath } from "react-router-dom";
import { SUBPAGES, canOpenMenu, canOpenPage, requiredMenuAccess } from "@/utils/pageAccess";
import { filterNavCategoriesByPermission } from "@/utils/permission";
import { getLeafItemsGrouped } from "@/page/role/rolePermissions";
import { navCategories } from "@/utils/sidebar-menu";
import BAKSO_MENU from "./fixtures-bakso-admin-access-menu.json";

// Opening a page by URL follows the same rule as the sidebar: a menu the
// sidebar hides from a menu-controlled account is "Akses Ditolak" by URL, a
// menu it shows always opens. Accounts without an accessMenu and the global
// super_admin are untouched.

const MATRIX = getLeafItemsGrouped().flatMap((g) => g.items);
const ROUTES = fs
  .readdirSync(path.resolve(__dirname, "../routes"))
  .flatMap((f) =>
    [
      ...fs
        .readFileSync(path.resolve(__dirname, "../routes", f), "utf8")
        .matchAll(/<Route\s+path="([^"]+)"/g)
    ].map((m) => m[1])
  );

const role = (accessMenu, roleType = "admin") => ({ id: 9, roleType, accessMenu });
const sidebarHrefs = (user) =>
  filterNavCategoriesByPermission(navCategories.super_admin, user, (href) =>
    canOpenMenu(user, href)
  )
    .flatMap((c) => c.sections)
    .flatMap((s) => s.items)
    .map((i) => i.href);
const navHrefs = navCategories.super_admin
  .flatMap((c) => c.sections)
  .flatMap((s) => s.items)
  .map((i) => i.href)
  .filter(Boolean);

beforeEach(() => sessionStorage.clear());

test("every guarded sub-page is a real route under a menu the role matrix offers", () => {
  const matrixHrefs = new Set(MATRIX.map((i) => i.href));
  for (const [pattern, href] of SUBPAGES) {
    expect(ROUTES).toContain(pattern);
    expect(matrixHrefs.has(href)).toBe(true);
  }
});

test.each([
  [
    "view only",
    role([
      { menu: "/product-list", view: true },
      { menu: "/stock-adjustment", add: true }
    ])
  ],
  [
    "kasir",
    role(
      [
        { menu: "/home", view: true },
        { menu: "/kitchen-display", view: true }
      ],
      "kasir"
    )
  ],
  [
    "bakso_admin",
    { id: 30, roleType: "super_admin", accessMenuScoped: true, accessMenu: BAKSO_MENU }
  ],
  ["nothing granted", role([{ menu: "/home", view: false }])]
])("%s: the sidebar shows a menu exactly when its page opens", (_label, user) => {
  const shown = new Set(sidebarHrefs(user));
  for (const href of navHrefs) {
    if (!requiredMenuAccess(href)) continue; // not decided by this guard
    expect([href, canOpenPage(user, href)]).toEqual([href, shown.has(href)]);
  }
});

test("view-only role: list and detail open, add and edit are refused", () => {
  const user = role([{ menu: "/product-list", view: true }]);
  expect(canOpenPage(user, "/product-list")).toBe(true);
  expect(canOpenPage(user, "/detail-product/12")).toBe(true);
  expect(canOpenPage(user, "/add-product")).toBe(false);
  expect(canOpenPage(user, "/edit-product")).toBe(false);
  expect(canOpenPage(user, "/supplier")).toBe(false);
  expect(canOpenPage(user, "/add-supplier")).toBe(false);
});

test("an add-only menu (Penyesuaian Stok) shows in the sidebar and opens", () => {
  const user = role([{ menu: "/stock-adjustment", add: true }]);
  expect(sidebarHrefs(user)).toContain("/stock-adjustment");
  expect(canOpenPage(user, "/stock-adjustment")).toBe(true);
});

test("an action the matrix never offers falls back to opening the menu", () => {
  // goods receipt offers add/view/delete, no edit
  const user = role([{ menu: "/goods-receipt", view: true }]);
  expect(canOpenPage(user, "/edit-goods-receipt")).toBe(true);
});

test("pages this guard does not decide stay open for everyone", () => {
  const user = role([{ menu: "/product-list", view: true }]);
  for (const p of [
    "/home",
    "/dashboard-super-admin",
    "/profile",
    "/notification",
    "/tenant",
    "/store-configuration",
    "/audit-log"
  ]) {
    expect([p, canOpenPage(user, p)]).toEqual([p, true]);
  }
});

test("global super_admin and accounts without an accessMenu are untouched", () => {
  const global = { id: 1, roleType: "super_admin", accessMenu: [{ menu: "/home", view: true }] };
  const noMenu = { id: 2, roleType: "admin", accessMenu: [] };
  for (const user of [global, noMenu]) {
    for (const p of ["/supplier", "/add-product", "/role-management", "/report/sales"]) {
      expect(canOpenPage(user, p)).toBe(true);
    }
  }
});

test("bakso_admin opens every menu it has, and their sub-pages", () => {
  const user = { id: 30, roleType: "super_admin", accessMenuScoped: true, accessMenu: BAKSO_MENU };
  const granted = new Set(BAKSO_MENU.filter((m) => m.view).map((m) => m.menu));
  for (const item of MATRIX) {
    if (granted.has(item.href) && requiredMenuAccess(item.href)) {
      expect([item.href, canOpenPage(user, item.href)]).toEqual([item.href, true]);
    }
  }
  for (const [pattern, href, action] of SUBPAGES) {
    const entry = BAKSO_MENU.find((m) => m.menu === href);
    if (!entry?.[action]) continue;
    const sample = pattern.replace(":id", "7");
    expect(matchPath({ path: pattern, end: true }, sample)).not.toBeNull();
    expect([sample, canOpenPage(user, sample)]).toEqual([sample, true]);
  }
});

test("Role Management now offers SDM and Member, and their pages follow the grant", () => {
  const offered = new Set(MATRIX.map((i) => i.href));
  for (const href of [
    "/employee-list",
    "/user-list",
    "/department-list",
    "/position-list",
    "/shift-list",
    "/shift-template-list",
    "/my-shift",
    "/business-trip",
    "/member-list",
    "/member-tier"
  ]) {
    expect([href, offered.has(href)]).toEqual([href, true]);
  }
  const viewer = role([{ menu: "/employee-list", view: true }]);
  expect(canOpenPage(viewer, "/employee-list")).toBe(true);
  expect(canOpenPage(viewer, "/detail-employee")).toBe(true);
  expect(canOpenPage(viewer, "/add-employee")).toBe(false);
  expect(canOpenPage(viewer, "/member-list")).toBe(false);
  expect(sidebarHrefs(viewer)).toContain("/employee-list");
});
