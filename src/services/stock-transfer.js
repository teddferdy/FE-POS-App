import { axiosInstance } from ".";

export const transferStock = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/transfer", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getTransferHistory = async ({ store, page = 1, limit = 10, search, status: filterStatus } = {}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (search) params.append("search", search);
  if (filterStatus) params.append("status", filterStatus);
  const { data, status } = await axiosInstance.get(`/pos/transfer-history?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTransferById = async (id) => {
  const { data, status } = await axiosInstance.get(`/pos/transfer/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const receiveStockTransfer = async (id) => {
  const { data, status } = await axiosInstance.put(`/pos/transfer/${id}/receive`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const cancelStockTransfer = async (id) => {
  const { data, status } = await axiosInstance.put(`/pos/transfer/${id}/cancel`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const adjustStock = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/adjust", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
