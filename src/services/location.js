import { axiosInstance } from ".";

export const getAllLocation = async () => {
  const { data, status } = await axiosInstance.get("/location/get-location");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllLocationTable = async ({ page = 1, limit = 10, statusLocation = "all" }) => {
  const { data, status } = await axiosInstance.get(
    `/location/get-location-all?page=${page}&limit=${limit}&status=${statusLocation}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addLocation = async (payload) => {
  const { data, status } = await axiosInstance.post("/location/add-new-location", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editLocation = async (payload) => {
  console.log("PAYLOAD =>", payload);

  const { data, status } = await axiosInstance({
    method: "put", // or 'post' if you change to POST
    url: `/location/edit-location`,
    data: payload,
    headers: {
      "Content-Type": "application/json" // Explicitly set headers for PUT requests
    }
  });
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteLocation = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/location/delete-location/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};
