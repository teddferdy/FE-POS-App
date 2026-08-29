export const ROLE_TYPES = ["super_admin", "admin", "kasir", "user"];

export const isSuperAdminRole = (user) => user?.roleType === "super_admin";

export const isAdminRole = (user) => user?.roleType === "admin" || user?.roleType === "super_admin";

export const isCashierRole = (user) => user?.roleType === "kasir" || user?.roleType === "cashier";

export const getRoleDashboard = (roleType) => {
  if (roleType === "super_admin") return "/dashboard-super-admin";
  if (roleType === "admin") return "/dashboard-admin";
  // ponytail: kasir/user mendarat di dashboard karyawan ringan (bukan langsung POS)
  return "/dashboard-user";
};

// ponytail: "Beranda" breadcrumb/menu — super_admin ke dashboard global,
// admin ke dashboard per-toko, kasir/user ke dashboard karyawan ringan.
export const getDashboardHref = (user) => {
  if (isSuperAdminRole(user)) return "/dashboard-super-admin";
  if (isAdminRole(user)) return "/dashboard-admin";
  return "/dashboard-user";
};

export const getHomePath = (user) => getRoleDashboard(user?.roleType);
