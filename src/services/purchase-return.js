import { axiosInstance } from ".";

export const getAllPurchaseReturn = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.status) params.append("status", payload.status);
  const { data, status } = await axiosInstance.get(`/purchase-return/get-all?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getReturnsByPO = async (poId) => {
  const { data, status } = await axiosInstance.get(`/purchase-return/by-po/${poId}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getPurchaseReturnById = async (id) => {
  const { data, status } = await axiosInstance.get(`/purchase-return/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const approvePurchaseReturn = async (id) => {
  const { data, status } = await axiosInstance.patch(`/purchase-return/approve/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const rejectPurchaseReturn = async (id) => {
  const { data, status } = await axiosInstance.patch(`/purchase-return/reject/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
