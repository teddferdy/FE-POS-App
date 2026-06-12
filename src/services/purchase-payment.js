import { axiosInstance } from ".";

export const getPaymentsByPO = async (poId) => {
  const { data, status } = await axiosInstance.get(`/purchase-payment/by-po/${poId}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getPaymentsBySupplier = async (supplierId) => {
  const { data, status } = await axiosInstance.get(`/purchase-payment/by-supplier/${supplierId}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getAllPayments = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  if (payload.supplierId) params.append("supplierId", payload.supplierId);
  const { data, status } = await axiosInstance.get(`/purchase-payment/list?${params.toString()}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const recordPayment = async (payload) => {
  const { data, status } = await axiosInstance.post("/purchase-payment/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deletePayment = async (id) => {
  const { data, status } = await axiosInstance.delete(`/purchase-payment/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};
