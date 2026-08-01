import { axiosInstance } from ".";

export const getSalesSummary = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/reports/sales-summary${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getProductSalesSummary = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/reports/product-sales${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getCategorySalesSummary = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/reports/category-sales${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getKasirPerformance = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/reports/kasir-performance${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};