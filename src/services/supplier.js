import { axiosInstance } from ".";

export const getAllSupplier = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/supplier?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSupplier = async (payload) => {
  const { data, status } = await axiosInstance.post("/supplier", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editSupplier = async (payload) => {
  const { data, status } = await axiosInstance.put(`/supplier/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteSupplier = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/supplier/${payload.id}`);
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getSupplierById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/supplier/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
