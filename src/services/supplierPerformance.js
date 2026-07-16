import { axiosInstance } from "@/services";

// ─── Supplier Performance ──────────────────────────────────────────

export const getSupplierScores = ({ store, page = 1, limit = 10, search, period, grade } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store) params.set("store", store);
  if (search) params.set("search", search);
  if (period && period !== "all") params.set("period", period);
  if (grade && grade !== "all") params.set("grade", grade);
  return axiosInstance.get(`/supplier-performance/scores?${params.toString()}`).then((r) => r.data);
};

export const getTopSuppliers = ({ store, period = "all_time", limit = 5 } = {}) => {
  const params = new URLSearchParams({ period, limit });
  if (store) params.set("store", store);
  return axiosInstance.get(`/supplier-performance/scores/top?${params.toString()}`).then((r) => r.data);
};

export const getSupplierScoreById = (id) =>
  axiosInstance.get(`/supplier-performance/scores/${id}`).then((r) => r.data);

export const getSupplierPerformanceSummary = (supplierId, { store } = {}) => {
  const params = new URLSearchParams();
  if (store) params.set("store", store);
  return axiosInstance.get(`/supplier-performance/performance/${supplierId}?${params.toString()}`).then((r) => r.data);
};

export const calculateSupplierScore = (payload) =>
  axiosInstance.post("/supplier-performance/scores/calculate", payload).then((r) => r.data);

export const updateSupplierScoreNote = (id, { notes }) =>
  axiosInstance.put(`/supplier-performance/scores/${id}/notes`, { notes }).then((r) => r.data);
