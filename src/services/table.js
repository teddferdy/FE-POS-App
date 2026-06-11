import { axiosInstance } from ".";

export const getTablesByStore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/table/get-tables?store=${payload?.location || ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTableAvailability = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/table/get-availability?store=${payload?.location || ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTablesWithActiveOrders = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/table/get-tables-with-orders?store=${payload?.location || ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addTable = async (payload) => {
  const { data, status } = await axiosInstance.post("/table/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editTable = async ({ id, ...payload }) => {
  const { data, status } = await axiosInstance.put(`/table/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const updateTableStatus = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/table/update-status/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteTable = async (id) => {
  const { data, status } = await axiosInstance.delete(`/table/delete/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.error}`);
  return data;
};
