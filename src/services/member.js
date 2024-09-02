import { axiosInstance } from ".";

export const getAllMember = async () => {
  const { data, status } = await axiosInstance.get("/Member/get-Member");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addMember = async (payload) => {
  const { data, status } = await axiosInstance.post("/Member/add-new-Member", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editMember = async (payload) => {
  const { data, status } = await axiosInstance.put(`/Member/edit-Member/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};
