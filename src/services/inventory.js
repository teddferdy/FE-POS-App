import { axiosInstance } from ".";

export const getForecasts = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.productId) params.append("productId", payload.productId);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/inventory/forecast${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const runForecast = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.productId) params.append("productId", payload.productId);
  const query = params.toString();
  const { data, status } = await axiosInstance.post(
    `/inventory/forecast/run${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getDeadStock = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/inventory/dead-stock${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getExpiringSoon = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/inventory/expiring-soon${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getValuation = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/inventory/valuation${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getBatches = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.productId) params.append("productId", payload.productId);
  if (payload.status) params.append("status", payload.status);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(`/inventory/batch${query ? `?${query}` : ""}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const postWriteOffExpired = async (payload) => {
  const { data, status } = await axiosInstance.post("/inventory/batch/writeoff", payload);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getReconcile = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/inventory/reconcile${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const postReconcile = async (payload) => {
  const { data, status } = await axiosInstance.post("/inventory/reconcile/fix", payload);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
