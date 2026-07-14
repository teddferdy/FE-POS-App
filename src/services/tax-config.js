import { axiosInstance } from ".";

export const getAllTaxConfig = async (payload) => {
  const statusParam = payload?.status && payload.status !== "all" ? `&status=${payload.status}` : "";
  const { data, status } = await axiosInstance.get(
    `/tax-config?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}${statusParam}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.post("/tax-config/add-new-tax-config", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/tax-config/edit-tax-config/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/tax-config/delete-tax-config/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getTaxConfigById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/tax-config/get-tax-config/${payload.id}`);
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

export const downloadTaxConfigTemplate = async () => {
  return downloadBlob("/tax-config/template", "tax-config-template.xlsx");
};

export const downloadTaxConfigExcel = async () => {
  return downloadBlob("/tax-config/download", `${Date.now()}-tax-configs.xlsx`);
};

export const uploadTaxConfigExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/tax-config/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
