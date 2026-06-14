import { axiosInstance } from ".";

export const createOrder = async (payload) => {
  const { data, status } = await axiosInstance.post("/order/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getOrdersByStore = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.location) params.set("store", payload.location);
  if (payload?.page) params.set("page", payload.page);
  if (payload?.limit) params.set("limit", payload.limit);
  if (payload?.date) params.set("date", payload.date);
  if (payload?.status) params.set("status", payload.status);
  const { data, status } = await axiosInstance.get(`/order/get-orders?${params.toString()}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOrderById = async (id) => {
  const { data, status } = await axiosInstance.get(`/order/get-order/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const updateOrderStatus = async (payload) => {
  const { data, status } = await axiosInstance.put("/order/update-status", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const returnOrder = async (id, payload) => {
  const { data, status } = await axiosInstance.post(`/pos/order/${id}/return`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
