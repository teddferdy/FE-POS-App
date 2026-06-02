import { axiosInstance } from ".";

export const getAllCurrencies = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  if (payload.search) params.append("search", payload.search);
  if (payload.status !== undefined) params.append("status", payload.status);
  if (payload.location) params.append("store", payload.location);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/currency${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getCurrencyById = async (id) => {
  const { data, status } = await axiosInstance.get(`/currency/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addCurrency = async (payload) => {
  const { data, status } = await axiosInstance.post("/currency", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editCurrency = async (payload) => {
  const { data, status } = await axiosInstance.put(`/currency/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteCurrency = async (id) => {
  const { data, status } = await axiosInstance.delete(`/currency/${id}`);
  if (status !== 200 && status !== 204) throw Error(data?.error || data?.message);
  return data;
};

export const setDefaultCurrency = async (id) => {
  const { data, status } = await axiosInstance.put(`/currency/${id}/default`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
