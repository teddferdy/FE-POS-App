import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Printer,
  UtensilsCrossed,
  Package,
  Users,
  AlertTriangle,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { getDashboardSummary } from "@/services/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS = [
  { key: "daily", label: "Harian" },
  { key: "weekly", label: "Mingguan" },
  { key: "monthly", label: "Bulanan" }
];

const statusBadge = (status) => {
  const s = (status || "Paid").toLowerCase();
  const styles = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };
  const dotColors = {
    paid: "bg-green-500",
    completed: "bg-green-500",
    pending: "bg-yellow-500",
    cancelled: "bg-red-500"
  };
  const key = Object.keys(styles).find((k) => s.includes(k)) || "paid";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[key]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[key]}`} />
      {status}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const store = cookie?.store;
  const { t } = useTranslation();
  const [chartFilter, setChartFilter] = useState("weekly");

  const { data: dashData, isLoading } = useQuery(
    ["dashboard-summary", store, chartFilter],
    () => getDashboardSummary({ store, filter: chartFilter }),
    { enabled: true, staleTime: 30_000 }
  );

  const d = dashData?.data || dashData || {};

  const totalSales = d.totalSales || 0;
  const totalOrders = d.totalOrders || 0;
  const totalProducts = d.totalProducts || 0;
  const totalMembers = d.totalMembers || 0;
  const summaryCards = [
    {
      label: t("page.dashboard.revenue"),
      value: formatCurrencyRupiah(totalSales),
      trend: t("page.dashboard.trendVsYesterday"),
      trendUp: totalSales > 0,
      icon: DollarSign,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.orderCount"),
      value: String(totalOrders),
      trend: t("page.dashboard.trendWeekly"),
      trendUp: totalOrders > 0,
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.activeProducts"),
      value: String(totalProducts),
      trend: `${totalProducts} ${t("page.dashboard.items")}`,
      trendUp: true,
      icon: Package,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.memberCount"),
      value: String(totalMembers),
      trend: t("page.dashboard.trendLoyalty"),
      trendUp: totalMembers > 0,
      icon: Users,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.lowStock"),
      value: String(d.lowStock || 0),
      trend: d.lowStock ? t("page.dashboard.restockNow") : t("page.dashboard.safe"),
      trendUp: !d.lowStock,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20"
    }
  ];

  const rawChart = d.salesChart || [];
  const buildChartData = () => {
    const map = {};
    rawChart.forEach((item) => {
      const dt = new Date(item.date);
      if (chartFilter === "daily") {
        map[dt.getHours()] = Number(item.sales) || 0;
      } else if (chartFilter === "monthly") {
        map[dt.getDate()] = Number(item.sales) || 0;
      } else {
        map[dt.getDay()] = Number(item.sales) || 0;
      }
    });

    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const result = [];

    if (chartFilter === "daily") {
      for (let h = 8; h <= 22; h++) {
        result.push({ day: `${String(h).padStart(2, "0")}:00`, value: map[h] || 0 });
      }
    } else if (chartFilter === "monthly") {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= lastDay; d++) {
        result.push({ day: String(d), value: map[d] || 0 });
      }
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        result.push({
          day: `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
          value: map[d.getDay()] || 0
        });
      }
    }
    return result;
  };
  const chartData = buildChartData();
  const bestSelling = d.bestSellers || [];
  const recentOrders = d.recentOrders || [];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-8 w-28 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="p-5">
                <Skeleton className="h-[220px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            data-tour="dashboard-stats"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const isLowStock = card.icon === AlertTriangle;
              const isMember = card.icon === Users;
              const isClickable = isLowStock || isMember;
              return (
                <div
                  key={card.label}
                  onClick={
                    isLowStock
                      ? () => navigate("/low-stock-all")
                      : isMember
                        ? () => navigate("/member-list")
                        : undefined
                  }
                  className={`bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow ${
                    card.bg || ""
                  } ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-primary/30" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.label}
                    </p>
                    <Icon size={18} className={card.color} />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{card.value}</h2>
                  <div
                    className={`flex items-center gap-1 mt-1.5 ${
                      card.trendUp ? "text-green-600 dark:text-green-400" : "text-destructive"
                    }`}>
                    {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-medium">{card.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div
              data-tour="dashboard-chart"
              className="lg:col-span-8 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.dashboard.chartTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        `page.dashboard.chartSubtitle${chartFilter === "daily" ? "Daily" : chartFilter === "monthly" ? "Monthly" : "Weekly"}`
                      )}
                    </p>
                  </div>
                  <div className="flex bg-muted rounded-lg p-0.5">
                    {FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setChartFilter(f.key)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          chartFilter === f.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                  <Download size={14} />
                  {t("page.dashboard.downloadReport")}
                </button>
              </div>
              <div className="p-5 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="20%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}Jt`;
                        if (val >= 1000) return `Rp${(val / 1000).toFixed(0)}K`;
                        return `Rp${val}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                      formatter={(value) => [
                        formatCurrencyRupiah(value),
                        t("page.dashboard.revenue")
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">
                  {t("page.dashboard.bestSelling")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("page.dashboard.bestSellingSubtitle")}
                </p>
              </div>
              <div className="divide-y divide-border">
                {bestSelling.length === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground text-center">
                    {t("page.dashboard.noData")}
                  </div>
                ) : (
                  bestSelling.map((item, i) => {
                    const Icon = item.icon || UtensilsCrossed;
                    return (
                      <div
                        key={item.name || i}
                        className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {item.name || item.productName || "-"}
                            </h4>
                            <p className="text-xs text-muted-foreground">{item.category || ""}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          {item.count || item.quantity || 0}x
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div
            data-tour="dashboard-orders"
            className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {t("page.dashboard.recentOrders")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("page.dashboard.recentOrdersSubtitle")}
                </p>
              </div>
              <button
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => navigate("/report/sales")}>
                {t("page.dashboard.viewAll")}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.orderId")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.table")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.customer")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.total")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.status")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.time")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">
                      {t("page.dashboard.table.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-sm text-muted-foreground">
                        {t("page.dashboard.noOrders")}
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, i) => (
                      <tr key={order.id || i} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                          {order.id || order.invoice || "-"}
                        </td>
                        <td className="px-5 py-3.5">{order.table || order.tableName || "-"}</td>
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          {order.customer || order.memberName || order.customerName || "-"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold">
                          {formatCurrencyRupiah(order.total || order.totalPrice || 0)}
                        </td>
                        <td className="px-5 py-3.5">{statusBadge(order.status)}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {order.time || order.createdAt || "-"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              onClick={() => navigate("/report/sales")}>
                              <Eye size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
