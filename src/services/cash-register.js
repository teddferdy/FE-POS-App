import { axiosInstance } from ".";

export const openCashRegister = async (payload) => {
  const { data, status } = await axiosInstance.post("/cash-register/open", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const closeCashRegister = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/cash-register/close/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getCurrentCashRegister = async (storeId) => {
  const { data, status } = await axiosInstance.get(`/cash-register/current?store=${storeId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getCashRegisterHistory = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/cash-register/history?page=${payload?.page || 1}&limit=${payload?.limit || 10}&store=${payload?.store || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
