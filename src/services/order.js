import { axiosInstance } from ".";

export const createOrder = async (payload) => {
  const { data, status } = await axiosInstance.post("/order/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getOrdersByStore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/order/get-orders?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
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

export const applyDiscount = async (payload) => {
  const { data, status } = await axiosInstance.put("/order/apply-discount", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const returnOrder = async (id, payload) => {
  const { data, status } = await axiosInstance.post(`/pos/order/${id}/return`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
