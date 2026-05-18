import { axiosInstance } from ".";

export const createOrder = async (payload) => {
  const { data, status } = await axiosInstance.post("/order/create-order", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOrdersByStore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/order/get-order-by-store?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOrderById = async (id) => {
  const { data, status } = await axiosInstance.get(`/order/get-order-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editOrder = async (payload) => {
  const { data, status } = await axiosInstance.put(`/order/edit-order/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const updateOrderStatus = async (payload) => {
  const { data, status } = await axiosInstance.put(`/order/update-status/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editOrderItem = async (payload) => {
  const { data, status } = await axiosInstance.put(`/order/edit-item/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteOrder = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/order/delete-order/${payload.id}`);
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const applyDiscount = async (id, payload) => {
  const { data, status } = await axiosInstance.post(`/order/apply-discount/${id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
