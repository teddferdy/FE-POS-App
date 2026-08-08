import { axiosInstance } from ".";

export const getAccounts = async (storeId) => {
  const params = new URLSearchParams();
  if (storeId) params.append("store", storeId);
  const { data, status } = await axiosInstance.get(`/accounting/accounts?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const createAccount = async (payload) => {
  const { data, status } = await axiosInstance.post("/accounting/accounts", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const updateAccount = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/accounting/accounts/${id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteAccount = async (id) => {
  const { data, status } = await axiosInstance.delete(`/accounting/accounts/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getJournals = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.store) params.append("store", payload.store);
  if (payload?.sourceType) params.append("sourceType", payload.sourceType);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.offset) params.append("offset", payload.offset);
  const { data, status } = await axiosInstance.get(`/accounting/journals?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const createManualJournal = async (payload) => {
  const { data, status } = await axiosInstance.post("/accounting/journals", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteJournal = async (id) => {
  const { data, status } = await axiosInstance.delete(`/accounting/journals/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getTrialBalance = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.store) params.append("store", payload.store);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/accounting/trial-balance?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getIncomeStatement = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.store) params.append("store", payload.store);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/accounting/income-statement?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getBalanceSheet = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.store) params.append("store", payload.store);
  if (payload?.asOf) params.append("asOf", payload.asOf);
  const { data, status } = await axiosInstance.get(`/accounting/balance-sheet?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
