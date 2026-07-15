import { axiosInstance } from ".";

export const getAllIngredients = async ({ store, page = 1, limit = 10, search = "", status = "" } = {}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  params.append("page", page);
  params.append("limit", limit);
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status);
  const query = params.toString();
  const { data, status: statusCode } = await axiosInstance.get(
    `/ingredient/get-all${query ? `?${query}` : ""}`
  );
  if (statusCode !== 200) throw Error(`${data?.message}`);
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

const downloadBlob = async (url, filename) => {
  const { data, status } = await axiosInstance.get(url, { responseType: "arraybuffer" });
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

export const downloadIngredientTemplate = async () =>
  downloadBlob("/ingredient/download-template", "template-bahan-baku.xlsx");

export const downloadIngredientExcel = async () =>
  downloadBlob("/ingredient/download", `${Date.now()}-bahan-baku.xlsx`);

export const uploadIngredientExcel = async (payload) => {
  const { data, status } = await axiosInstance.post("/ingredient/import", payload, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
