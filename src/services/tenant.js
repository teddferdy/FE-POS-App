import { axiosInstance } from ".";

// Platform tenant administration (BE /tenants, tenant.manage).
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
