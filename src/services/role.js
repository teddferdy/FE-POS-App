import { axiosInstance } from ".";

export const getAllRole = async () => {
  const { data, status } = await axiosInstance.get("/role/get-role");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllRoleTable = async ({ page = 1, limit = 10, statusRole = "all" }) => {
  const { data, status } = await axiosInstance.get(
    `/role/get-role-all?page=${page}&limit=${limit}&status=${statusRole}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addRole = async (payload) => {
  const { data, status } = await axiosInstance.post("/role/add-new-role", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editRole = async (payload) => {
  const { data, status } = await axiosInstance.put(`/role/edit-role/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteRole = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/role/delete-role/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getRoleById = async (id) => {
  const { data, status } = await axiosInstance.get(`/role/get-role-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const updateUserRole = async (payload) => {
  const { data, status } = await axiosInstance.put("/role/update-user-role", payload);
  if (status !== 200) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const getUsersByRole = async ({ store, roleId, search } = {}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  if (roleId) params.append("roleId", roleId);
  if (search) params.append("search", search);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/role/get-users-by-role${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const updateAccessMenu = async (payload) => {
  const { data, status } = await axiosInstance.put("/role/update-access-menu", payload);
  if (status !== 200) throw Error(`${data?.message || data?.error}`);
  return data;
};
