import { axiosInstance } from "@/services";

// ─── Delivery Orders ────────────────────────────────────────────────

export const getDeliveryOrders = ({ store, page = 1, limit = 10, search, status, source } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store) params.set("store", store);
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (source && source !== "all") params.set("source", source);
  return axiosInstance.get(`/delivery/orders?${params.toString()}`).then((r) => r.data);
};

export const getDeliveryOrderById = (id) =>
  axiosInstance.get(`/delivery/orders/${id}`).then((r) => r.data);

export const createDeliveryOrder = (payload) =>
  axiosInstance.post("/delivery/orders", payload).then((r) => r.data);

export const updateDeliveryStatus = ({ id, status, note, changedBy, changedByName }) =>
  axiosInstance
    .put("/delivery/orders/status", { id, status, note, changedBy, changedByName })
    .then((r) => r.data);

export const assignDriver = ({ orderId, driverId, driverName }) =>
  axiosInstance
    .put(`/delivery/orders/${orderId}/assign-driver`, { driverId, driverName })
    .then((r) => r.data);

export const cancelDeliveryOrder = (id, reason) =>
  axiosInstance.put(`/delivery/orders/${id}/cancel`, { reason }).then((r) => r.data);

// ─── Drivers ────────────────────────────────────────────────────────

export const getDrivers = ({ store, page = 1, limit = 10, search, status } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store) params.set("store", store);
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  return axiosInstance.get(`/delivery/drivers?${params.toString()}`).then((r) => r.data);
};

export const getDriverById = (id) =>
  axiosInstance.get(`/delivery/drivers/${id}`).then((r) => r.data);

export const createDriver = (payload) =>
  axiosInstance.post("/delivery/drivers", payload).then((r) => r.data);

export const updateDriver = (payload, id) =>
  axiosInstance.put(`/delivery/drivers/${id}`, payload).then((r) => r.data);

export const deleteDriver = (id) =>
  axiosInstance.delete(`/delivery/drivers/${id}`).then((r) => r.data);

export const updateDriverStatus = (id, status) =>
  axiosInstance.put(`/delivery/drivers/${id}/status`, { status }).then((r) => r.data);

// ─── Marketplace Config ─────────────────────────────────────────────

export const getMarketplaceConfig = (store) =>
  axiosInstance.get(`/delivery/marketplace-config?store=${store}`).then((r) => r.data);

export const saveMarketplaceConfig = (payload) =>
  axiosInstance.post("/delivery/marketplace-config", payload).then((r) => r.data);

export const getDeliveryStats = (store) => {
  const params = store ? `?store=${store}` : "";
  return axiosInstance.get(`/delivery/stats${params}`).then((r) => r.data);
};
