import { axiosInstance } from ".";

export const getAllIngredients = async ({ store, page = 1, limit = 10, search = "" } = {}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  params.append("page", page);
  params.append("limit", limit);
  if (search) params.append("search", search);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/ingredient/get-all${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getIngredientById = async (id) => {
  const { data, status } = await axiosInstance.get(`/ingredient/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addIngredient = async (payload) => {
  const { data, status } = await axiosInstance.post("/ingredient/add", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editIngredient = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/ingredient/edit/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deleteIngredient = async (id) => {
  const { data, status } = await axiosInstance.delete(`/ingredient/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const adjustIngredientStock = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/ingredient/adjust-stock/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
