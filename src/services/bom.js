import { axiosInstance } from ".";

export const getAllBom = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.search) params.append("search", payload.search);
  const { data, status } = await axiosInstance.get(`/bom/get-all?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getBomById = async (id) => {
  const { data, status } = await axiosInstance.get(`/bom/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addBom = async (payload) => {
  const { data, status } = await axiosInstance.post("/bom/add", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editBom = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/bom/edit/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deleteBom = async (id) => {
  const { data, status } = await axiosInstance.delete(`/bom/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};
