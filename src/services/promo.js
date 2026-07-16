import { axiosInstance } from "@/services";

// ─── Promo Campaigns ───────────────────────────────────────────────

export const getCampaigns = ({ store, page = 1, limit = 10, search, status, type } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (store) params.set("store", store);
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (type && type !== "all") params.set("type", type);
  return axiosInstance.get(`/promo/campaigns?${params.toString()}`).then((r) => r.data);
};

export const getCampaignById = (id) =>
  axiosInstance.get(`/promo/campaigns/${id}`).then((r) => r.data);

export const getCampaignStats = ({ store } = {}) => {
  const params = new URLSearchParams();
  if (store) params.set("store", store);
  return axiosInstance.get(`/promo/campaigns/stats?${params.toString()}`).then((r) => r.data);
};

export const createCampaign = (payload) =>
  axiosInstance.post("/promo/campaigns", payload).then((r) => r.data);

export const updateCampaign = (id, payload) =>
  axiosInstance.put(`/promo/campaigns/${id}`, payload).then((r) => r.data);

export const updateCampaignStatus = (id, { status }) =>
  axiosInstance.put(`/promo/campaigns/${id}/status`, { status }).then((r) => r.data);

export const deleteCampaign = (id) =>
  axiosInstance.delete(`/promo/campaigns/${id}`).then((r) => r.data);

export const applyPromo = (payload) =>
  axiosInstance.post("/promo/apply", payload).then((r) => r.data);

export const recordPromoUsage = (payload) =>
  axiosInstance.post("/promo/usage", payload).then((r) => r.data);

export const autoActivateCampaigns = () =>
  axiosInstance.post("/promo/auto-activate").then((r) => r.data);
