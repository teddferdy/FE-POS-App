import { axiosInstance } from ".";

export const getDiscount = async () => {
  const { data, status } = await axiosInstance.get("/discount/get-discount");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getAllDiscountByLocationAndActive = async ({ limit, page, store }) => {
  const params = new URLSearchParams({ page, size: limit });
  if (store) params.append("store", store);
  const { data, status } = await axiosInstance.get(
    `/discount/get-discount-by-location?${params}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getAllDiscount = async ({ page, limit, location } = {}) => {
  const storeParam = location ? `&store=${location}` : "";
  const { data, status } = await axiosInstance.get(
    `/discount/get-discount?page=${page}&limit=${limit}${storeParam}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addDiscount = async (payload) => {
  const { data, status } = await axiosInstance.post("/discount/add-new-discount", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editDiscount = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/discount/edit-discount/${payload.id}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteDiscount = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/discount/delete-discount/${payload.id}`, {
    data: payload
  });
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.error}`);
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

export const downloadDiscountTemplate = async () => {
  return downloadBlob("/discount/template", `template-diskon.xlsx`);
};

export const downloadDiscountExcel = async () => {
  return downloadBlob("/discount/download", `${Date.now()}-discounts.xlsx`);
};

export const uploadDiscountExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/discount/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getDiscountById = async (id) => {
  const { data, status } = await axiosInstance.get(`/discount/get-discount/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const lookupDiscountByCode = async (code, store) => {
  const { data, status } = await axiosInstance.get(`/discount/lookup-by-code/${code}`, {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
