import { axiosInstance } from ".";

export const getDailyReport = async (params) => {
  const res = await axiosInstance.get("/report/daily", { params })
  return res.data
}

export const getProfitLoss = async (params) => {
  const res = await axiosInstance.get("/report/profit-loss", { params })
  return res.data
}

export const getCashFlow = async (params) => {
  const res = await axiosInstance.get("/report/cash-flow", { params })
  return res.data
}
