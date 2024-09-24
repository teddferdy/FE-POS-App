import { axiosInstance } from ".";

export const getAllCategory = async () => {
  const { data, status } = await axiosInstance.get("/category/get-category");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllCategoryTable = async () => {
  const { data, status } = await axiosInstance.get("/category/get-category-all");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/category/add-new-category", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editCategory = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/category/edit-category/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteCategory = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/category/delete-category/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};
