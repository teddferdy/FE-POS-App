import { axiosInstance } from ".";

export const getAllSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/social-media/get-social-media?store=${payload.location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.post("/social-media/add-social-media", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/social-media/edit-social-media/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/social-media/delete-social-media/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
