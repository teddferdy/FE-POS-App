import { axiosInstance } from ".";

export const login = async (payload) => {
  const { data, status } = await axiosInstance.post("/auth/login", payload);

  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const register = async (payload) => {
  const { data, status } = await axiosInstance.post("/auth/register", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
  return data;
};

export const requestResetPassword = async (payload) => {
  const { data, status } = await axiosInstance.post("/auth/reset-password/request", payload);
  if (status !== 200 && status !== 201) throw Error(data?.error);
  return data;
};

export const resetPassword = async (payload) => {
  const { data, status } = await axiosInstance.post("/auth/reset-password", payload);
  if (status !== 200 && status !== 201) throw Error(data?.error);
  return data;
};

export const logOut = async (payload) => {
  const { data, status } = await axiosInstance.post("/auth/logout", payload);
  if (status !== 200 && status !== 201) throw Error(data?.error);
  return data;
};

export const editProfile = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof Blob ? value : String(value));
    }
  });
  const { data, status } = await axiosInstance.put("/auth/edit-user", formData);
  if (status !== 200 && status !== 201) throw Error(data?.error || data?.message);
  return data;
};
