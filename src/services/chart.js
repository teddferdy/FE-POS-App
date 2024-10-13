import { axiosInstance } from ".";

export const getDataCurrentYear = async ({ year, location }) => {
  const { data, status } = await axiosInstance.get(
    `/best-selling/get-chart-by-year?year=${year}&store=${location ? location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDataCurrentNowAndSevenDayBefore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/best-selling/get-chart-current-and-seven-days-before?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDataCurrentNowAndTwoDayBefore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/best-selling/get-chart-current-and-two-days-before?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDataChartByMonth = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/best-selling/get-chart-by-month?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
