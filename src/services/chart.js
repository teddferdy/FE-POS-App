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
  const params = new URLSearchParams();
  if (payload?.location) params.append("store", payload.location);
  if (payload?.year) params.append("year", payload.year);
  if (payload?.month) params.append("month", payload.month);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/best-selling/get-chart-by-month${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
