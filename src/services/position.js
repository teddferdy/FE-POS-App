import { axiosInstance } from ".";

export const getAllPosition = async () => {
  const { data, status } = await axiosInstance.get("/position/get-position");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllPositionTable = async ({
  page = 1,
  limit = 10,
  statusRole = "all",
  search = ""
}) => {
  const { data, status } = await axiosInstance.get(
    `/position/get-position-all?page=${page}&limit=${limit}&status=${statusRole}&search=${search}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addPosition = async (payload) => {
  const { data, status } = await axiosInstance.post("/position/add-new-position", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editPosition = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/position/edit-position/${payload.id}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deletePosition = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/position/delete-position/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const downloadPositionTemplate = async () => {
  const { data, status } = await axiosInstance.get("/position/download-template", {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Gagal download template");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "template-position.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadPositionExcel = async () => {
  const { data, status } = await axiosInstance.get("/position/download", {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Gagal download data");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data-position.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const uploadPositionExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/position/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
