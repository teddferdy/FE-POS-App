import { axiosInstance } from ".";

export const getStockHistory = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/stock-history?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllStockHistory = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.product) params.append("product", payload.product);
  if (payload?.referenceType) params.append("referenceType", payload.referenceType);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/stock-history/get-all${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getStockHistoryByProduct = async (productId) => {
  const { data, status } = await axiosInstance.get(`/stock-history/get-by-product/${productId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getLowStockProducts = async () => {
  const { data, status } = await axiosInstance.get("/stock-history/low-stock");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getStockOpname = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.location) params.append("store", payload.location);
  if (payload?.status) params.append("status", payload.status);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/stock-opname/get-all${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getStockOpnameById = async (id) => {
  const { data, status } = await axiosInstance.get(`/stock-opname/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addStockOpname = async (payload) => {
  const { data, status } = await axiosInstance.post("/stock-opname/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const updateStockOpname = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/stock-opname/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteStockOpname = async (id) => {
  const { data, status } = await axiosInstance.delete(`/stock-opname/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(data?.message || "Gagal menghapus");
  return data;
};

export const changeStockOpnameStatus = async (id, status) => {
  const { data, status: httpStatus } = await axiosInstance.patch(`/stock-opname/status/${id}`, {
    status
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data.message}`);
  return data;
};

export const uploadStockOpnameExcel = async (file, auditDate) => {
  const formData = new FormData();
  formData.append("file", file);
  if (auditDate) formData.append("auditDate", auditDate);
  const { data, status } = await axiosInstance.post("/stock-opname/upload-excel", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const downloadStockOpnameTemplate = async () => {
  const { data, status } = await axiosInstance.get("/stock-opname/download-excel", {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Gagal download template");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "template-stock-opname.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportStockOpnameExcel = async () => {
  const { data, status } = await axiosInstance.get("/stock-opname/export", {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Gagal export data");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data-stock-opname.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportStockOpnameByIds = async (ids) => {
  const { data, status } = await axiosInstance.post(
    "/stock-opname/export-selected",
    { ids },
    { responseType: "arraybuffer" }
  );
  if (status !== 200) throw new Error("Gagal export data");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data-stock-opname.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
