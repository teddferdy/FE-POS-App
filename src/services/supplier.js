import { axiosInstance } from ".";

export const getAllSupplier = async (payload) => {
  const statusParam =
    payload?.status && payload.status !== "all" ? `&status=${payload.status}` : "";
  const productsParam = payload?.includeProducts ? `&includeProducts=true` : "";
  const { data, status } = await axiosInstance.get(
    `/supplier?page=${payload?.page || 1}&limit=${payload?.limit || 10}&search=${payload?.search || ""}&store=${payload?.store || ""}${statusParam}${productsParam}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSupplier = async (payload) => {
  const { data, status } = await axiosInstance.post("/supplier", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editSupplier = async (payload) => {
  const { data, status } = await axiosInstance.put(`/supplier/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteSupplier = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/supplier/${payload.id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};

export const getSupplierById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/supplier/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getSupplierDetail = async (payload) => {
  const { data, status } = await axiosInstance.get(`/supplier/detail/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
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

export const downloadSupplierTemplate = async () => {
  return downloadBlob("/supplier/template", `template-supplier.xlsx`);
};

export const downloadSupplierExcel = async () => {
  return downloadBlob("/supplier/download", `${Date.now()}-suppliers.xlsx`);
};

export const uploadSupplierExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/supplier/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const downloadSupplierProductTemplate = async (supplierId) => {
  const params = supplierId ? `?supplier=${supplierId}` : "";
  return downloadBlob(`/supplier/product-template${params}`, `template-supplier-product.xlsx`);
};

export const importSupplierProducts = async ({ id, file }) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post(`/supplier/${id}/import-products`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const compareSuppliers = async ({ productId, search }) => {
  const params = new URLSearchParams();
  if (productId) params.append("productId", productId);
  if (search) params.append("search", search);
  const { data, status } = await axiosInstance.get(`/supplier/compare?${params.toString()}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

// ===================== Supplier Categories =====================
export const getAllSupplierCategories = async (params = {}) => {
  const searchParam = params?.search ? `&search=${params.search}` : "";
  const statusParam = params?.status && params.status !== "all" ? `&status=${params.status}` : "";
  const { data, status } = await axiosInstance.get(
    `/supplier-category?page=${params?.page || 1}&limit=${params?.limit || 50}${searchParam}${statusParam}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getSupplierCategoryById = async ({ id }) => {
  const { data, status } = await axiosInstance.get(`/supplier-category/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSupplierCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/supplier-category", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editSupplierCategory = async ({ id, ...payload }) => {
  const { data, status } = await axiosInstance.put(`/supplier-category/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteSupplierCategory = async ({ id }) => {
  const { data, status } = await axiosInstance.delete(`/supplier-category/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error || data?.message);
  return data;
};

// ===================== Supplier Contacts =====================
export const getSupplierContacts = async (supplierId) => {
  const { data, status } = await axiosInstance.get(`/supplier-contact/supplier/${supplierId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSupplierContact = async ({ supplierId, ...payload }) => {
  const { data, status } = await axiosInstance.post(
    `/supplier-contact/supplier/${supplierId}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editSupplierContact = async ({ id, ...payload }) => {
  const { data, status } = await axiosInstance.put(`/supplier-contact/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteSupplierContact = async ({ id }) => {
  const { data, status } = await axiosInstance.delete(`/supplier-contact/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error || data?.message);
  return data;
};

// ===================== Supplier Bank Accounts =====================
export const getSupplierBankAccounts = async (supplierId) => {
  const { data, status } = await axiosInstance.get(`/supplier-bank-account/supplier/${supplierId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSupplierBankAccount = async ({ supplierId, ...payload }) => {
  const { data, status } = await axiosInstance.post(
    `/supplier-bank-account/supplier/${supplierId}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editSupplierBankAccount = async ({ id, ...payload }) => {
  const { data, status } = await axiosInstance.put(`/supplier-bank-account/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteSupplierBankAccount = async ({ id }) => {
  const { data, status } = await axiosInstance.delete(`/supplier-bank-account/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error || data?.message);
  return data;
};
