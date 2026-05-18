import { axiosInstance } from ".";

export const getUserByLocation = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/auth/get-user?location=${payload.location}`,
    payload
  );

  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllUsers = async ({ page = 1, limit = 10, search = "" }) => {
  const { data, status } = await axiosInstance.get(
    `/auth/get-all-users?page=${page}&limit=${limit}&search=${search}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const createUser = async (payload) => {
  const { data, status } = await axiosInstance.post("/auth/register", payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const changeRoleUser = async (payload) => {
  const { data, status } = await axiosInstance.put("/auth/change-profile-user", payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};
