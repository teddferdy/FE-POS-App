import { axiosInstance } from ".";

export const getUserByLocation = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/auth/get-user?location=${payload.location}`,
    payload
  );

  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const changeRoleUser = async (payload) => {
  const { data, status } = await axiosInstance.put("/auth/change-profile-user", payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

// export const resetPassword = async (payload) => {
//   const { data, status } = await axiosInstance.post("/auth/reset-password", payload);
//   if (status !== 200) throw Error(data?.error);
//   return data;
// };

// export const logOut = async (payload) => {
//   const { data, status } = await axiosInstance.post("/auth/logout", payload);
//   if (status !== 200) throw Error(data?.error);
//   return data;
// };
