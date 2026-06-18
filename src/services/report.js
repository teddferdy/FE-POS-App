import { axiosInstance } from ".";

export const getSalesSummary = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.filter) params.append("filter", payload.filter);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/report/sales-summary${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getBestSellerReport = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/report/best-seller${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getDailyReport = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(`/report/daily${query ? `?${query}` : ""}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getProfitLoss = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/report/profit-loss${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getCashFlow = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(`/report/cash-flow${query ? `?${query}` : ""}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
