import { axiosInstance } from ".";

export const getReportConfigs = async () => {
  const { data, status } = await axiosInstance.get("/report-config");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getReportConfig = async (key) => {
  const { data, status } = await axiosInstance.get(`/report-config/${key}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const saveReportConfig = async (key, config) => {
  const { data, status } = await axiosInstance.put(`/report-config/${key}`, { config });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getReportConfigMeta = async () => {
  const { data, status } = await axiosInstance.get("/report-config/meta");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
