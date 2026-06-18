import { axiosInstance } from ".";

export const createTransaction = async (payload) => {
  const { data, status } = await axiosInstance.post("/transaction/create-transaction", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getAllTransaction = async ({ page = 1, limit = 10, ...params } = {}) => {
  const { data, status } = await axiosInstance.get("/transaction/get-all-transaction", {
    params: { page, limit, ...params }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getTransactionById = async (id) => {
  const { data, status } = await axiosInstance.get(`/transaction/get-transaction/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const cancelTransaction = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/transaction/cancel-transaction/${payload.id}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};
