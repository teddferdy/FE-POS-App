export const buildDashboardQueryParams = ({ storeFilter, dateRange }) => {
  const params = {};
  if (storeFilter) params.store = storeFilter;
  if (dateRange?.startDate) params.startDate = dateRange.startDate;
  if (dateRange?.endDate) params.endDate = dateRange.endDate;
  return params;
};
