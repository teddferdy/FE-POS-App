import { axiosInstance } from ".";

export const getAllGoodsReceipt = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.status) params.append("status", payload.status);
  if (payload?.poId) params.append("poId", payload.poId);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  if (payload?.store) params.append("store", payload.store);
  if (payload?.search) params.append("search", payload.search);
  const { data, status } = await axiosInstance.get(`/goods-receipt/get-all?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getGoodsReceiptById = async (id) => {
  const { data, status } = await axiosInstance.get(`/goods-receipt/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const exportGoodsReceipt = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.status) params.append("status", payload.status);
  if (payload?.store) params.append("store", payload.store);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/goods-receipt/export?${params}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getGoodsReceiptByPO = async (poId) => {
  const { data, status } = await axiosInstance.get(`/goods-receipt/by-po/${poId}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

const buildDocFormData = (payload, files) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  (files || []).forEach((f) => {
    if (f instanceof File) formData.append("file", f);
  });
  return formData;
};

export const addGoodsReceipt = async (payload, files = []) => {
  const fileList = Array.isArray(files) ? files : files ? [files] : [];
  if (fileList.length > 0) {
    const { data, status } = await axiosInstance.post(
      "/goods-receipt/create",
      buildDocFormData(payload, fileList),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
    return data;
  }
  const { data, status } = await axiosInstance.post("/goods-receipt/create", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editGoodsReceipt = async (id, payload, files = []) => {
  const fileList = Array.isArray(files) ? files : files ? [files] : [];
  if (fileList.length > 0) {
    const { data, status } = await axiosInstance.put(
      `/goods-receipt/update/${id}`,
      buildDocFormData(payload, fileList),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
    return data;
  }
  const { data, status } = await axiosInstance.put(`/goods-receipt/update/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const deleteGoodsReceipt = async (id) => {
  const { data, status } = await axiosInstance.delete(`/goods-receipt/delete/${id}`);
  if (status !== 200 && status !== 204) throw Error(`${data?.message}`);
  return data;
};

export const changeGoodsReceiptStatus = async (id, status) => {
  const { data, status: httpStatus } = await axiosInstance.patch(`/goods-receipt/status/${id}`, {
    status
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data?.message}`);
  return data;
};
