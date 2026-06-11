import { axiosInstance } from ".";

export const getAllProductionOrder = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.status) params.append("status", payload.status);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  if (payload?.product) params.append("product", payload.product);
  const { data, status } = await axiosInstance.get(`/production-order/get-all?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getProductionOrderById = async (id) => {
  const { data, status } = await axiosInstance.get(`/production-order/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addProductionOrder = async (payload) => {
  const { data, status } = await axiosInstance.post("/production-order/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editProductionOrder = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/production-order/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deleteProductionOrder = async (id) => {
  const { data, status } = await axiosInstance.delete(`/production-order/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const changeProductionOrderStatus = async (id, status) => {
  const { data, status: httpStatus } = await axiosInstance.patch(`/production-order/status/${id}`, {
    status
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data?.message}`);
  return data;
};

export const startProduction = async (id) => {
  const { data, status } = await axiosInstance.post(`/production-order/start/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const completeProduction = async (id, payload) => {
  const { data, status } = await axiosInstance.post(
    `/production-order/complete/${id}`,
    payload || {}
  );
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
