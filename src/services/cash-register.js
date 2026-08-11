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
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.store) params.append("store", payload.store);
  if (payload?.search) params.append("search", payload.search);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/cash-register/history?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOpenRegisters = async () => {
  const { data, status } = await axiosInstance.get("/cash-register/open-registers");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getXReport = async (storeId) => {
  const { data, status } = await axiosInstance.get(`/cash-register/x-report?store=${storeId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getZReport = async (registerId) => {
  const { data, status } = await axiosInstance.get(`/cash-register/z-report/${registerId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
