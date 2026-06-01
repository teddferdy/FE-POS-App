import { axiosInstance } from ".";

export const getAllPurchaseOrder = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/purchase-order?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addPurchaseOrder = async (payload) => {
  const { data, status } = await axiosInstance.post("/purchase-order", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editPurchaseOrder = async (payload) => {
  const { data, status } = await axiosInstance.put(`/purchase-order/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const receivePurchaseOrder = async (id) => {
  const { data, status } = await axiosInstance.post(`/purchase-order/${id}/receive`);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
