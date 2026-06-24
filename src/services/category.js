import { axiosInstance } from ".";

export const getAllCategory = async () => {
  const { data, status } = await axiosInstance.get(
    `/category/get-category-all?page=1&pageSize=100&status=all`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllCategoryActive = async ({ location } = {}) => {
  const params = location ? `?status=active&store=${location}` : "?status=active";
  const { data, status } = await axiosInstance.get(`/category/get-category-all${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllCategoryTable = async ({ limit, page, statusCategory, location } = {}) => {
  const storeParam = location ? `&store=${location}` : "";
  const { data, status } = await axiosInstance.get(
    `/category/get-category-all?page=${page}&limit=${limit}&status=${statusCategory}${storeParam}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/category/add-new-category", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editCategory = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/category/edit-category/${payload.get("id")}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
  return data;
};

export const getCategoryById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/category/get-category/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteCategory = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/category/delete-category/${payload.id}`, {
    data: payload
  });
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

export const downloadExcel = async () => {
  return downloadBlob(`/category/download`, `${Date.now()}-category.xlsx`);
};

export const downloadTemplate = async () => {
  return downloadBlob(`/category/download-template`, `template-kategori.xlsx`);
};

export const uploadExcel = async (payload) => {
  const { data, status } = await axiosInstance.post("/category/upload-excel", payload, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
