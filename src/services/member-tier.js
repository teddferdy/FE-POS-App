import { axiosInstance } from ".";

export const getAllMemberTier = async () => {
  const { data, status } = await axiosInstance.get("/member-tier/get-all");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addMemberTier = async (payload) => {
  const { data, status } = await axiosInstance.post("/member-tier/add", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editMemberTier = async (payload) => {
  const { data, status } = await axiosInstance.put(`/member-tier/edit/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteMemberTier = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/member-tier/delete/${payload.id}`);
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getMemberTierByPoints = async (points) => {
  const { data, status } = await axiosInstance.get("/member-tier/get-by-points", {
    params: { points }
  });
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const updateAllMemberTiers = async () => {
  const { data, status } = await axiosInstance.post("/member-tier/update-members");
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
