import { axiosInstance } from ".";

export const getAllBusinessTrip = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.status) params.append("status", payload.status);
  if (payload?.search) params.append("search", payload.search);
  const { data, status } = await axiosInstance.get(`/business-trip/get-all?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getBusinessTripById = async (id) => {
  const { data, status } = await axiosInstance.get(`/business-trip/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addBusinessTrip = async (payload) => {
  const { data, status } = await axiosInstance.post("/business-trip/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editBusinessTrip = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/business-trip/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deleteBusinessTrip = async (id) => {
  const { data, status } = await axiosInstance.delete(`/business-trip/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const changeBusinessTripStatus = async (id, status) => {
  const { data, status: httpStatus } = await axiosInstance.patch(`/business-trip/status/${id}`, {
    status
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data?.message}`);
  return data;
};
