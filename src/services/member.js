import { axiosInstance } from ".";

export const getAllMember = async ({ page, limit, nameMember = "", phoneNumber = "" } = {}) => {
  const { data, status } = await axiosInstance.get("/Member/get-Member", {
    params: { page, limit, nameMember, phoneNumber }
  });
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addMember = async (payload) => {
  const { data, status } = await axiosInstance.post("/Member/add-new-Member", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editMember = async (payload) => {
  const { data, status } = await axiosInstance.put(`/Member/edit-Member/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
  return data;
};

export const getMemberById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/Member/get-Member/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteMember = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/Member/delete-Member/${payload.id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};
