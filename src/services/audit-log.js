import { axiosInstance } from ".";

export const getAuditLogs = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  if (payload.entity) params.append("entity", payload.entity);
  if (payload.action) params.append("action", payload.action);
  if (payload.userId) params.append("userId", payload.userId);
  if (payload.startDate) params.append("startDate", payload.startDate);
  if (payload.endDate) params.append("endDate", payload.endDate);
  if (payload.location) params.append("store", payload.location);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/audit-log${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAuditLogsByEntity = async (entity, entityId, payload = {}) => {
  const params = new URLSearchParams();
  if (payload.page) params.append("page", payload.page);
  if (payload.limit) params.append("limit", payload.limit);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/audit-log/${entity}/${entityId}${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
