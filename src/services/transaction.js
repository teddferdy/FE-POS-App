import { axiosInstance } from ".";

export const createTransaction = async (payload) => {
  const { data, status } = await axiosInstance.post("/order/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getAllTransaction = async ({ page = 1, limit = 10, ...params } = {}) => {
  const { data, status } = await axiosInstance.get("/order/get-orders", {
    params: { page, limit, ...params }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTransactionById = async (id) => {
  const { data, status } = await axiosInstance.get(`/order/get-order/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const cancelTransaction = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/order/update-status`,
    { id: payload.id, status: "cancelled" }
  );
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};
