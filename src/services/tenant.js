import { axiosInstance } from ".";

// Tenant administration (BE /tenants): every tenant for the platform, its own
// tenants for a client's super admin (context.tenantAdministration "own").
export const getTenants = async ({ page = 1, limit = 20, search, status } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  const { data } = await axiosInstance.get("/tenants", { params });
  return data;
};

export const createTenant = async ({ code, name }) => {
  const { data } = await axiosInstance.post("/tenants", { code, name });
  return data;
};

export const updateTenant = async (id, changes) => {
  const { data } = await axiosInstance.patch(`/tenants/${id}`, changes);
  return data;
};

// Only an empty tenant (no stores, no other active member) can be deleted.
export const deleteTenant = async (id) => {
  const { data } = await axiosInstance.delete(`/tenants/${id}`);
  return data;
};
