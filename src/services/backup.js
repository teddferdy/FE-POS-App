import { axiosInstance } from ".";

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

export const downloadMasterDataBackup = async () => {
  return downloadBlob("/export/master-data", `backup-master-data-${Date.now()}.xlsx`);
};

export const createDatabaseBackup = async () => {
  const { data, status } = await axiosInstance.post("/backup/create");
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getDatabaseBackups = async (params) => {
  const query = new URLSearchParams();
  if (params?.limit) query.append("limit", params.limit);
  if (params?.offset) query.append("offset", params.offset);
  const { data, status } = await axiosInstance.get(`/backup/list?${query}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const downloadDatabaseBackup = async (id, filename) => {
  const { data, status } = await axiosInstance.get(`/backup/download/${id}`, {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw Error("Download failed");
  const blob = new Blob([data], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename || `backup-${id}.dump`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const restoreDatabaseBackup = async (id) => {
  const { data, status } = await axiosInstance.post(`/backup/restore/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteDatabaseBackup = async (id) => {
  const { data, status } = await axiosInstance.delete(`/backup/delete/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getBackupSchedule = async () => {
  const { data, status } = await axiosInstance.get("/backup/schedule");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const setBackupSchedule = async (payload) => {
  const { data, status } = await axiosInstance.put("/backup/schedule", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
