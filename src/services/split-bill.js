import { axiosInstance } from ".";

export const createSplitBill = async (payload) => {
  const { data, status } = await axiosInstance.post("/split-bill/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getSplitBillByOrder = async (orderId) => {
  const { data, status } = await axiosInstance.get(`/split-bill/get-by-order/${orderId}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const paySplitBill = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/split-bill/pay/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const cancelSplitBill = async (id, payload) => {
  const { data, status } = await axiosInstance.delete(`/split-bill/cancel/${id}`, { data: payload });
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const mergeSplitBills = async (payload) => {
  const { data, status } = await axiosInstance.post("/split-bill/merge", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
