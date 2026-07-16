import { axiosInstance } from ".";

export const getBundles = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.store) params.append("store", payload.store);
  if (payload?.status) params.append("status", payload.status);
  if (payload?.search) params.append("search", payload.search);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/product-bundle/get-all${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getBundleById = async (id) => {
  const { data, status } = await axiosInstance.get(`/product-bundle/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const createBundle = async (payload) => {
  const { data, status } = await axiosInstance.post("/product-bundle/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const updateBundle = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/product-bundle/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteBundle = async (id) => {
  const { data, status } = await axiosInstance.delete(`/product-bundle/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(data?.message || "Gagal menghapus bundle");
  return data;
};

export const changeBundleStatus = async (id, status) => {
  const { data, status: httpStatus } = await axiosInstance.patch(`/product-bundle/status/${id}`, {
    status
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data.message}`);
  return data;
};
