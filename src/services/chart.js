import { axiosInstance } from ".";

export const getDataCurrentYear = async ({ year }) => {
  const { data, status } = await axiosInstance.get(`/best-selling/get-chart-by-year?year=${year}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDataCurrentNowAndSevenDayBefore = async () => {
  const { data, status } = await axiosInstance.get(
    "/best-selling/get-chart-current-and-seven-days-before"
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDataCurrentNowAndTwoDayBefore = async () => {
  const { data, status } = await axiosInstance.get(
    "/best-selling/get-chart-current-and-two-days-before"
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDataChartByMonth = async () => {
  const { data, status } = await axiosInstance.get("/best-selling/get-chart-by-month");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
