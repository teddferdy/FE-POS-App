import React from "react";
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

const fallbackChart = [
  { day: "Sen", value: 0 },
  { day: "Sel", value: 0 },
  { day: "Rab", value: 0 },
  { day: "Kam", value: 0 },
  { day: "Jum", value: 0 },
  { day: "Sab", value: 0 },
  { day: "Min", value: 0 }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const store = cookie?.store;
  // const user = cookie?.user;
  // const role = user?.role || user?.type || "";
  const { t } = useTranslation();

  const { data: dashData, isLoading } = useQuery(
    ["dashboard-summary", store],
    () => getDashboardSummary({ store }),
    { enabled: true }
  );

  const d = dashData?.data || dashData || {};

  const revenue = d.revenue || {};
  const orders = d.orders || {};
  const members = d.members || {};
  const summaryCards = [
    {
      label: t("page.dashboard.revenue"),
      value: formatCurrencyRupiah(revenue.total || 0),
      trend: revenue.trend || t("page.dashboard.trendVsYesterday"),
      trendUp: (revenue.trend || "").includes("+"),
      icon: DollarSign,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.orderCount"),
      value: String(orders.total || d.totalOrders || 0),
      trend: orders.trend || t("page.dashboard.trendWeekly"),
      trendUp: (orders.trend || "").includes("+"),
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.activeProducts"),
      value: String(d.activeProducts || d.totalProducts || 0),
      trend: d.productTrend || `${d.activeProducts || 0} ${t("page.dashboard.items")}`,
      trendUp: true,
      icon: Package,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.memberCount"),
      value: String(members.total || d.totalMembers || 0),
      trend: members.trend || t("page.dashboard.trendLoyalty"),
      trendUp: (members.trend || "").includes("+"),
      icon: Users,
      color: "text-primary"
    },
    {
      label: t("page.dashboard.lowStock"),
      value: String(d.lowStock || d.lowStockCount || 0),
      trend: d.lowStock ? t("page.dashboard.restockNow") : t("page.dashboard.safe"),
      trendUp: !d.lowStock,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20"
    }
  ];

  const chartData = d.weeklyRevenue || d.chartData || fallbackChart;
  const bestSelling = d.bestSelling || d.topProducts || [];
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
            <div className="lg:col-span-4 bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-44" />
              </div>
              <div className="divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <Skeleton className="h-5 w-36 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="p-5">
              <div className="flex gap-4 pb-3 border-b border-border mb-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 py-3 border-b border-border">
                  {[...Array(7)].map((_, j) => (
                    <Skeleton
                      key={j}
                      className={`h-4 ${j === 0 ? "w-24" : j === 6 ? "w-16" : "flex-1"}`}
                    />
                  ))}
                </div>
              ))}
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
              return (
                <div
                  key={card.label}
                  onClick={isLowStock ? () => navigate("/low-stock-all") : undefined}
                  className={`bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow ${
                    card.bg || ""
                  } ${isLowStock ? "cursor-pointer hover:ring-2 hover:ring-destructive/30" : ""}`}>
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
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("page.dashboard.chartTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("page.dashboard.chartSubtitle")}
                  </p>
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
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
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
              <button className="text-sm font-semibold text-primary hover:underline">
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
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
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
