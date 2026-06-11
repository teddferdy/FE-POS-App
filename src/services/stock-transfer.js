import { axiosInstance } from ".";

export const transferStock = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/transfer", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getTransferHistory = async ({ store, page = 1, limit = 10 } = {}) => {
  const { data, status } = await axiosInstance.get(
    `/pos/transfer-history?store=${store}&page=${page}&limit=${limit}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTransferById = async (id) => {
  const { data, status } = await axiosInstance.get(`/pos/transfer/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const deleteStockTransfer = async (id, store) => {
  const { data, status } = await axiosInstance.delete(`/pos/transfer/${id}`, {
    params: { store }
  });
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const approveStockTransfer = async (id) => {
  const { data, status } = await axiosInstance.put(`/pos/transfer/${id}/approve`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const rejectStockTransfer = async (id) => {
  const { data, status } = await axiosInstance.put(`/pos/transfer/${id}/reject`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const adjustStock = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/adjust", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
