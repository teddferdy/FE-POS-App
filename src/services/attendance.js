import { axiosInstance } from ".";

export const clockAttendance = async (payload) => {
  const { data, status } = await axiosInstance.post("/attendance/clock", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getMyAttendance = async ({ date } = {}) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data, status } = await axiosInstance.get(`/attendance/my?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getTodayAttendance = async ({ date, store } = {}) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (store) params.append("store", store);
  const { data, status } = await axiosInstance.get(`/attendance/today?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAttendanceByShift = async (shiftId) => {
  const { data, status } = await axiosInstance.get(`/attendance/by-shift?shiftId=${shiftId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
