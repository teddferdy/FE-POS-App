import { axiosInstance } from ".";

const MIME = {
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  csv: "text/csv"
};

const buildUrl = (key, format, params = {}) => {
  const qs = new URLSearchParams();
  qs.append("format", format);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  return `/report/export/${key}?${qs.toString()}`;
};

const downloadBlob = async (url, filename, type) => {
  const { data, status, headers } = await axiosInstance.get(url, {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Download failed");
  const blob = new Blob([data], { type: MIME[type] || "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const serverName = headers?.["content-disposition"]?.match(/filename="([^"]+)"/)?.[1];
  link.setAttribute("download", serverName || filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const exportReport = async (key, { format, params = {}, filename = `${key}-report` }) => {
  return downloadBlob(
    buildUrl(key, format, params),
    `${filename}.${format === "excel" ? "xlsx" : format}`,
    format
  );
};
