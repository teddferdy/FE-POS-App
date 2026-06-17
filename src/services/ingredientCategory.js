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

const downloadBlob = async (url, filename) => {
  const { data, status } = await axiosInstance.get(url, {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Download failed");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const downloadIngredientCategoryTemplate = async () => {
  return downloadBlob("/ingredient-category/template", "ingredient-category-template.xlsx");
};

export const downloadIngredientCategoryExcel = async () => {
  return downloadBlob("/ingredient-category/download", `${Date.now()}-ingredient-categories.xlsx`);
};

export const uploadIngredientCategoryExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/ingredient-category/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
