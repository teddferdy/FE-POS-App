import { axiosInstance } from "@/services";

export const printReceipt = async (data) => {
  const response = await axiosInstance.post("/thermal-printer/print", data);
  return response.data;
};

export const testPrint = async (config = {}) => {
  const response = await axiosInstance.post("/thermal-printer/test-print", config);
  return response.data;
};

export const getPrinterStatus = async () => {
  const response = await axiosInstance.get("/thermal-printer/status");
  return response.data;
};

export const configurePrinter = async (config) => {
  const response = await axiosInstance.post("/thermal-printer/configure", config);
  return response.data;
};

// Legacy endpoint (macOS Bluetooth only)
export const printThermalLegacy = async (data) => {
  const response = await axiosInstance.post("/print-thermal", { data });
  return response.data;
};
