import { axiosInstance } from ".";

export const getYearList = async () => {
  const { data, status } = await axiosInstance.get("/other/get-years-list");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
