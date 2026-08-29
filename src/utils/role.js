export const ROLE_TYPES = ["super_admin", "admin", "kasir", "user"];

export const isSuperAdminRole = (user) => user?.roleType === "super_admin";

export const isAdminRole = (user) => user?.roleType === "admin" || user?.roleType === "super_admin";

export const isCashierRole = (user) => user?.roleType === "kasir" || user?.roleType === "cashier";

export const getRoleDashboard = (roleType) => {
  if (roleType === "super_admin") return "/dashboard-super-admin";
  if (roleType === "admin") return "/dashboard-admin";
  return "/home";
};

// ponytail: "Beranda" breadcrumb/menu — super_admin ke dashboard global,
// semua role lain (admin/kasir/user) ke dashboard per-toko.
export const getDashboardHref = (user) =>
  isSuperAdminRole(user) ? "/dashboard-super-admin" : "/dashboard-admin";

export const getHomePath = (user) => getRoleDashboard(user?.roleType);
