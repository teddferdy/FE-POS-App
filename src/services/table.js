import { axiosInstance } from ".";

export const getTablesByStore = async (payload) => {
  const params = new URLSearchParams();
  params.append("store", payload?.location || "");
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.search) params.append("search", payload.search);
  const { data, status } = await axiosInstance.get(
    `/table/get-tables?${params.toString()}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTableById = async (id) => {
  const { data, status } = await axiosInstance.get(`/table/get-tables`);
  if (status !== 200) throw Error(`${data?.message}`);
  const tables = data?.data || data || [];
  const table = tables.find((t) => String(t.id) === String(id));
  if (!table) throw Error("Table not found");
  return { data: table };
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
