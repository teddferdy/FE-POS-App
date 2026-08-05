import { axiosInstance } from "@/services";

// ─── Waiter Request ──────────────────────────────────────────────

export const getWaiterRequestList = ({ store, page = 1, limit = 20, status } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store && store !== "all") params.set("store", store);
  if (status && status !== "all") params.set("status", status);
  return axiosInstance.get(`/waiter-request?${params.toString()}`).then((r) => r.data);
};

export const getPendingWaiterRequests = ({ store, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store && store !== "all") params.set("store", store);
  return axiosInstance.get(`/waiter-request/pending?${params.toString()}`).then((r) => r.data);
};

export const updateWaiterRequestStatus = (id, { status, notes }) =>
  axiosInstance.put(`/waiter-request/${id}/status`, { status, notes }).then((r) => r.data);
