import { axiosInstance } from "@/services";

// ─── Queue / Waitlist ──────────────────────────────────────────────

export const getQueueList = ({ store, page = 1, limit = 20, search, status, priority } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store) params.set("store", store);
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (priority && priority !== "all") params.set("priority", priority);
  return axiosInstance.get(`/queue?${params.toString()}`).then((r) => r.data);
};

export const getQueueById = (id) =>
  axiosInstance.get(`/queue/${id}`).then((r) => r.data);

export const getQueueStats = ({ store } = {}) => {
  const params = new URLSearchParams();
  if (store) params.set("store", store);
  return axiosInstance.get(`/queue/stats?${params.toString()}`).then((r) => r.data);
};

export const createQueue = (payload) =>
  axiosInstance.post("/queue", payload).then((r) => r.data);

export const updateQueue = (id, payload) =>
  axiosInstance.put(`/queue/${id}`, payload).then((r) => r.data);

export const updateQueueStatus = (id, { status, tableId, notes }) =>
  axiosInstance.put(`/queue/${id}/status`, { status, tableId, notes }).then((r) => r.data);

export const deleteQueue = (id) =>
  axiosInstance.delete(`/queue/${id}`).then((r) => r.data);
