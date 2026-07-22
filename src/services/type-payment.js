import { axiosInstance } from ".";

export const getAllTypePaymentListActive = async ({
  store,
  page = 1,
  limit = 10,
  statusPayment = "all"
}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  params.append("page", page);
  params.append("limit", limit);
  params.append("status", statusPayment);
  const { data, status } = await axiosInstance.get(
    `/type-payment/get-type-payment?${params.toString()}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllTypePayment = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  if (payload.status) params.append("status", payload.status);
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  if (payload.search) params.append("search", payload.search);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/type-payment/get-list-type-payment${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getTypePaymentById = async (id) => {
  const { data, status } = await axiosInstance.get(`/type-payment/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.post("/type-payment/add-new-type-payment", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/type-payment/edit-type-payment/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
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

export const downloadTypePaymentTemplate = async () => {
  return downloadBlob("/type-payment/template", `template-type-payment.xlsx`);
};

export const downloadTypePaymentExcel = async () => {
  return downloadBlob("/type-payment/download", `${Date.now()}-type-payment.xlsx`);
};

export const uploadTypePaymentExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/type-payment/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/type-payment/delete-type-payment/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
