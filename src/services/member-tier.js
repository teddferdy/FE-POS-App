import { axiosInstance } from ".";

export const getAllMemberTier = async () => {
  const { data, status } = await axiosInstance.get("/member-tier/get-member-tier");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addMemberTier = async (payload) => {
  const { data, status } = await axiosInstance.post("/member-tier/add-new-member-tier", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editMemberTier = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/member-tier/edit-member-tier/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteMemberTier = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/member-tier/delete-member-tier/${payload.id}`
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
