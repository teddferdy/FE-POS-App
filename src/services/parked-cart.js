import { axiosInstance } from ".";

export const createParkedCart = async (payload) => {
  const { data, status } = await axiosInstance.post("/parked-cart", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getParkedCarts = async ({ store, status } = {}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  if (status) params.append("status", status);
  const { data, status: httpStatus } = await axiosInstance.get(`/parked-cart?${params}`);
  if (httpStatus !== 200) throw Error(`${data.message}`);
  return data;
};

export const getParkedCart = async (id) => {
  const { data, status } = await axiosInstance.get(`/parked-cart/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const resumeParkedCart = async (id) => {
  const { data, status } = await axiosInstance.post(`/parked-cart/${id}/resume`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const cancelParkedCart = async (id) => {
  const { data, status } = await axiosInstance.post(`/parked-cart/${id}/cancel`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
