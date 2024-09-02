import { axiosInstance } from ".";

export const getAllMember = async ({ nameMember, phoneNumber }) => {
  const { data, status } = await axiosInstance.get(
    `/Member/get-Member?nameMember=${nameMember}&phoneNumber=${phoneNumber}`
  );
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
