import { axiosInstance } from ".";

export const getAllSupplier = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/supplier?page=${payload?.page || 1}&limit=${payload?.limit || 10}&search=${payload?.search || ""}`
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
