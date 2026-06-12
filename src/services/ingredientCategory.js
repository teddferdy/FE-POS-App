import { axiosInstance } from ".";

export const getAllIngredientCategory = async () => {
  const { data, status } = await axiosInstance.get(
    "/ingredient-category/get-all"
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addIngredientCategory = async (payload) => {
  const { data, status } = await axiosInstance.post(
    "/ingredient-category/add",
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getIngredientCategoryById = async (id) => {
  const { data, status } = await axiosInstance.get(
    `/ingredient-category/get-by-id/${id}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editIngredientCategory = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/ingredient-category/edit/${payload.id}`,
    payload
  );
  if (status !== 200 && status !== 201)
    throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteIngredientCategory = async (id) => {
  const { data, status } = await axiosInstance.delete(
    `/ingredient-category/delete/${id}`
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
