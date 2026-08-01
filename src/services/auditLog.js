import { axiosInstance } from "@/services";

export const getAuditLogs = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const response = await axiosInstance.get(`/audit-log?${query.toString()}`);
  return response.data;
};

export const getAuditLogsByEntity = async (entity, entityId, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const response = await axiosInstance.get(`/audit-log/${entity}/${entityId}?${query.toString()}`);
  return response.data;
};
