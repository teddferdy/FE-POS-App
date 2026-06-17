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
