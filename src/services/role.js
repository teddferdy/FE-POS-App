import { axiosInstance } from ".";

export const getAllRole = async () => {
  const { data, status } = await axiosInstance.get("/role/get-role");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllRoleTable = async () => {
  const { data, status } = await axiosInstance.get("/role/get-role-all");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addRole = async (payload) => {
  const { data, status } = await axiosInstance.post("/role/add-new-role", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editRole = async (payload) => {
  const { data, status } = await axiosInstance.put(`/role/edit-role/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteRole = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/role/edit-role/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};
