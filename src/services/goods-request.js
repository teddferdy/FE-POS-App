import { axiosInstance } from ".";

export const getAllGoodsRequest = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.status) params.append("status", payload.status);
  if (payload?.search) params.append("search", payload.search);
  if (payload?.store) params.append("queryStore", payload.store);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/goods-request/get-all?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getGoodsRequestById = async (id) => {
  const { data, status } = await axiosInstance.get(`/goods-request/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addGoodsRequest = async (payload) => {
  const { data, status } = await axiosInstance.post("/goods-request/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editGoodsRequest = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/goods-request/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deleteGoodsRequest = async (id) => {
  const { data, status } = await axiosInstance.delete(`/goods-request/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const changeGoodsRequestStatus = async (id, status) => {
  const { data, status: httpStatus } = await axiosInstance.patch(`/goods-request/status/${id}`, {
    status
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data?.message}`);
  return data;
};
