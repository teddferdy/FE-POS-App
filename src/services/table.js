import { axiosInstance } from ".";

export const getTablesByStore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/table/get-table?store=${payload?.location || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getTableAvailability = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/table/availability?store=${payload?.location || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getTablesWithActiveOrders = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/table/active-orders?store=${payload?.location || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addTable = async (payload) => {
  const { data, status } = await axiosInstance.post("/table/add-new-table", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editTable = async (payload) => {
  const { data, status } = await axiosInstance.put(`/table/edit-table/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const updateTableStatus = async (payload) => {
  const { data, status } = await axiosInstance.put(`/table/edit-status/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteTable = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/table/delete-table/${payload.id}`);
  if (status !== 200) throw Error(data?.error);
  return data;
};
