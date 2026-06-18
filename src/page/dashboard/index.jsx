import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import {
  TrendingUp,
  TrendingDown,
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
import AbortController from "@/components/organism/abort-controller";

const FILTERS = [
  { key: "daily", label: "Harian" },
  { key: "weekly", label: "Mingguan" },
  { key: "monthly", label: "Bulanan" }
];

const Dashboard = () => {
  const [cookie] = useCookies();
  const store = cookie?.store;
  const { t } = useTranslation();
  const [chartFilter, setChartFilter] = useState("weekly");

  const {
    data: dashData,
    isLoading,
    isError,
    refetch
  } = useQuery(
    ["dashboard-summary", store, chartFilter],
    () => getDashboardSummary({ store, filter: chartFilter }),
    { enabled: true }
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

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-primary font-semibold">
          {t("page.dashboard.title") || "Dashboard"}
        </span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("page.dashboard.title") || "Dashboard"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.dashboard.subtitle") || "Ringkasan bisnis Anda"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5 border border-border/60">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setChartFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                chartFilter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className={`bg-card p-5 rounded-xl border border-border ${card.bg || ""}`}>
            <div className="flex items-center justify-between mb-3">
              <card.icon size={20} className={card.color} />
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  card.trendUp ? "text-green-600" : "text-red-600"
                }`}>
                {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border">
          <h3 className="text-sm font-semibold mb-4">
            {t("page.dashboard.salesChart") || "Grafik Penjualan"}
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="day"
                  fontSize={12}
                  className="text-muted-foreground"
                  tickLine={false}
                />
                <YAxis fontSize={12} className="text-muted-foreground" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))"
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
              {t("page.dashboard.noData") || "Belum ada data"}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card p-5 rounded-xl border border-border">
            <h3 className="text-sm font-semibold mb-3">
              {t("page.dashboard.bestSelling") || "Produk Terlaris"}
            </h3>
            {bestSelling.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("page.dashboard.noData") || "Belum ada data"}
              </p>
            ) : (
              <div className="space-y-3">
                {bestSelling.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono w-4 shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{item.name || item.nameProduct || "-"}</span>
                    </div>
                    <span className="font-medium ml-2 shrink-0">{item.total || item.qty || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card p-5 rounded-xl border border-border">
            <h3 className="text-sm font-semibold mb-3">
              {t("page.dashboard.recentOrders") || "Pesanan Terbaru"}
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("page.dashboard.noData") || "Belum ada data"}
              </p>
            ) : (
              <div className="space-y-2">
                {recentOrders.slice(0, 5).map((order, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{order.orderNumber || "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.cashierName || order.createdBy || ""}
                      </p>
                    </div>
                    <span className="font-medium ml-2 shrink-0">
                      {formatCurrencyRupiah(order.totalPrice || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
