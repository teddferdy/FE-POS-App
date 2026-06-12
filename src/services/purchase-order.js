import { axiosInstance } from ".";

export const getAllPurchaseOrder = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/purchase-order/get-all?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}&search=${encodeURIComponent(payload?.search || "")}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getPurchaseOrderById = async (id) => {
  const { data, status } = await axiosInstance.get(`/purchase-order/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addPurchaseOrder = async (payload) => {
  const { data, status } = await axiosInstance.post("/purchase-order/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editPurchaseOrder = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/purchase-order/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deletePurchaseOrder = async (id) => {
  const { data, status } = await axiosInstance.delete(`/purchase-order/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const receivePurchaseOrder = async (id) => {
  const { data, status } = await axiosInstance.put(`/purchase-order/receive/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const returnPurchaseOrder = async (id, payload) => {
  const { data, status } = await axiosInstance.post(`/pos/purchase-order/${id}/return`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
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

export const downloadPurchaseOrderTemplate = async () => {
  return downloadBlob("/purchase-order/template", `template-po.xlsx`);
};

export const downloadPurchaseOrderExcel = async () => {
  return downloadBlob("/purchase-order/download", `${Date.now()}-purchase-orders.xlsx`);
};

export const uploadPurchaseOrderExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/purchase-order/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
