const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(value || 0);
};

const periods = [
  { label: "Today", value: "today", dateLabel: "page.report.sales.today" },
  { label: "Weekly", value: "weekly", dateLabel: "page.report.sales.weekly" },
  { label: "Monthly", value: "monthly", dateLabel: "page.report.sales.monthly" }
];

const getDateRangeForPeriod = (period) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "today") {
    return {
      startDate: todayStart.toISOString(),
      endDate: new Date(todayStart.getTime() + 86400000 - 1).toISOString()
    };
  }
  if (period === "monthly") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate: monthStart.toISOString(), endDate: monthEnd.toISOString() };
  }
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const monday = new Date(todayStart);
  monday.setDate(todayStart.getDate() - daysSinceMonday);
  return {
    startDate: monday.toISOString(),
    endDate: new Date(monday.getTime() + 7 * 86400000 - 1).toISOString()
  };
};

export { formatCurrency, formatNumber, periods, getDateRangeForPeriod };
