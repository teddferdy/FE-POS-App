import { axiosInstance } from ".";

export const getARList = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  if (payload.status) params.append("status", payload.status);
  if (payload.customerId) params.append("customerId", payload.customerId);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/accounts-receivable/list?${params.toString()}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getARById = async (id) => {
  const { data, status } = await axiosInstance.get(`/accounts-receivable/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const createAR = async (payload) => {
  const { data, status } = await axiosInstance.post("/accounts-receivable/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const recordARPayment = async (id, payload) => {
  const { data, status } = await axiosInstance.post(`/accounts-receivable/${id}/pay`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const updateAR = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/accounts-receivable/${id}`, payload);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const deleteAR = async (id) => {
  const { data, status } = await axiosInstance.delete(`/accounts-receivable/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const getARAging = async () => {
  const { data, status } = await axiosInstance.get("/accounts-receivable/aging");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
