import { axiosInstance } from ".";

export const getAllMember = async ({
  page = 1,
  limit = 10,
  nameMember = "",
  phoneNumber = "",
  store
} = {}) => {
  const { data, status } = await axiosInstance.get("/member/get-member", {
    params: { page, limit, nameMember, phoneNumber, store }
  });
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getMemberById = async (id, store) => {
  const { data, status } = await axiosInstance.get(`/member/get-member/${id}`, {
    params: { store }
  });
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addMember = async (payload) => {
  const { data, status } = await axiosInstance.post("/member/add-new-member", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editMember = async (payload) => {
  const { data, status } = await axiosInstance.put(`/member/edit-member/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteMember = async (id, store) => {
  const { data, status } = await axiosInstance.delete(`/member/delete-member/${id}`, {
    params: { store }
  });
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};

export const addMemberPoints = async (id, payload) => {
  const { data, status } = await axiosInstance.post(`/pos/member/${id}/add-points`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getMemberPointHistory = async ({ id, page = 1, limit = 10 }) => {
  const { data, status } = await axiosInstance.get(
    `/pos/member/${id}/point-history?page=${page}&limit=${limit}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
