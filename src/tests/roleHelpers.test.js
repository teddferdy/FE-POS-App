import {
  ROLE_TYPES,
  isSuperAdminRole,
  isAdminRole,
  isCashierRole,
  getRoleDashboard,
  getHomePath
} from "../utils/role";

describe("role helpers (F7-01 authorization conventions)", () => {
  test("ROLE_TYPES matches the actual role values used across the repository", () => {
    expect(ROLE_TYPES).toEqual(["super_admin", "admin", "kasir", "user"]);
  });

  test("the standard cashier can never override prices: only admin-family roles can", () => {
    const permissionByRole = Object.fromEntries(
      ROLE_TYPES.map((role) => [role, isAdminRole({ roleType: role })])
    );
    expect(permissionByRole.super_admin).toBe(true);
    expect(permissionByRole.admin).toBe(true);
    expect(permissionByRole.kasir).toBe(false);
    expect(permissionByRole.user).toBe(false);
  });

  test("super_admin keeps the implicit admin capability", () => {
    expect(isAdminRole({ roleType: "super_admin" })).toBe(true);
  });

  test("isAdminRole fails closed for missing, malformed, and unexpected roles", () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole({})).toBe(false);
    expect(isAdminRole({ roleType: undefined })).toBe(false);
    expect(isAdminRole({ roleType: "cashier" })).toBe(false);
    expect(isAdminRole({ roleType: "owner" })).toBe(false);
    expect(isAdminRole({ roleType: "" })).toBe(false);
  });

  test("isSuperAdminRole only grants the super_admin value", () => {
    expect(isSuperAdminRole({ roleType: "super_admin" })).toBe(true);
    expect(isSuperAdminRole({ roleType: "admin" })).toBe(false);
    expect(isSuperAdminRole({ roleType: "kasir" })).toBe(false);
    expect(isSuperAdminRole(undefined)).toBe(false);
  });

  test("isCashierRole recognizes kasir and the 'cashier' alias used in parts of the codebase", () => {
    expect(isCashierRole({ roleType: "kasir" })).toBe(true);
    expect(isCashierRole({ roleType: "cashier" })).toBe(true);
    expect(isCashierRole({ roleType: "admin" })).toBe(false);
    expect(isCashierRole({ roleType: "super_admin" })).toBe(false);
    expect(isCashierRole({ roleType: "user" })).toBe(false);
    expect(isCashierRole(undefined)).toBe(false);
  });

  test("dashboard routing keeps kasir/user on the lightweight dashboards", () => {
    expect(getRoleDashboard("super_admin")).toBe("/dashboard-super-admin");
    expect(getRoleDashboard("admin")).toBe("/dashboard-admin");
    expect(getRoleDashboard("kasir")).toBe("/dashboard-user");
    expect(getRoleDashboard("user")).toBe("/dashboard-user");
    expect(getHomePath({ roleType: "kasir" })).toBe("/dashboard-user");
    expect(getHomePath({ roleType: "super_admin" })).toBe("/dashboard-super-admin");
  });
});
