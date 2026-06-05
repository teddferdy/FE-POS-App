/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSalesReport, getDailySummary } from "@/services/report";
import { getListTableBestSellingList } from "@/services/overview";
import { getDataCurrentYear } from "@/services/chart";
import { Loading } from "@/components/ui/loading";

const tabs = [
  { key: "sales", icon: "analytics" },
  { key: "best-seller", icon: "inventory" },
  { key: "export", icon: "download" }
];

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

const today = new Date().toISOString().slice(0, 10);
const pastMonth = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

const barHeights = [40, 55, 45, 70, 65, 85, 60, 50, 40, 55, 75, 90];

const bestSellerBarData = [
  { label: "Artisan Coffee Blend 1kg", value: "24,500 unit", pct: 100 },
  { label: "Premium Arabica Beans", value: "21,200 unit", pct: 86 },
  { label: "Oat Milk Barista Edition", value: "18,900 unit", pct: 77 },
  { label: "Matcha Ceremonial Grade", value: "15,400 unit", pct: 62 },
  { label: "Caramel Syrup 500ml", value: "12,100 unit", pct: 49 }
];

const bestSellerRows = [
  {
    rank: 1,
    name: "Artisan Coffee Blend 1kg",
    sku: "K-CFF-001",
    icon: "coffee",
    sold: "24,500 unit",
    revenue: "Rp 857.5M",
    trend: "up",
    trendVal: "14%",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary"
  },
  {
    rank: 2,
    name: "Premium Arabica Beans",
    sku: "K-CFF-004",
    icon: "local_cafe",
    sold: "21,200 unit",
    revenue: "Rp 742.0M",
    trend: "up",
    trendVal: "8%",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary"
  },
  {
    rank: 3,
    name: "Oat Milk Barista Edition",
    sku: "K-MILK-102",
    icon: "water_drop",
    sold: "18,900 unit",
    revenue: "Rp 661.5M",
    trend: "down",
    trendVal: "2%",
    iconBg: "bg-secondary-container/20",
    iconColor: "text-secondary"
  },
  {
    rank: 4,
    name: "Matcha Ceremonial Grade",
    sku: "K-TEA-005",
    icon: "energy_savings_leaf",
    sold: "15,400 unit",
    revenue: "Rp 539.0M",
    trend: "up",
    trendVal: "19%",
    iconBg: "bg-tertiary-container/20",
    iconColor: "text-tertiary"
  }
];

const storeRows = [
  {
    initial: "KL",
    name: "Kinetic Sudirman",
    desc: "Flagship Store",
    bg: "bg-primary-fixed",
    color: "text-primary",
    location: "Jakarta Pusat",
    sales: "Rp 842.2M",
    trx: "2,412",
    status: "Exceeded",
    statusBg: "bg-secondary-container/20",
    statusColor: "text-on-secondary-container",
    dot: "bg-secondary"
  },
  {
    initial: "KB",
    name: "Kinetic Bandung",
    desc: "Regional Center",
    bg: "bg-tertiary-fixed",
    color: "text-tertiary",
    location: "Bandung City",
    sales: "Rp 612.5M",
    trx: "1,890",
    status: "On Track",
    statusBg: "bg-primary-fixed/20",
    statusColor: "text-on-primary-fixed-variant",
    dot: "bg-primary"
  },
  {
    initial: "KS",
    name: "Kinetic Surabaya",
    desc: "Mall Branch",
    bg: "bg-surface-container",
    color: "text-outline",
    location: "Surabaya Timur",
    sales: "Rp 428.1M",
    trx: "1,204",
    status: "At Risk",
    statusBg: "bg-error-container/20",
    statusColor: "text-on-error-container",
    dot: "bg-error"
  },
  {
    initial: "KM",
    name: "Kinetic Medan",
    desc: "Satellite Store",
    bg: "bg-primary-fixed-dim",
    color: "text-on-primary-fixed-variant",
    location: "Medan Baru",
    sales: "Rp 388.9M",
    trx: "988",
    status: "On Track",
    statusBg: "bg-primary-fixed/20",
    statusColor: "text-on-primary-fixed-variant",
    dot: "bg-primary"
  }
];

const exportHistory = [
  {
    icon: "table_chart",
    iconColor: "text-green-600",
    name: "sales_global_q3_2023.xlsx",
    type: "Penjualan",
    typeKey: "sales",
    date: "Oct 24, 2023",
    time: "14:20",
    size: "2.4 MB",
    status: "Ready",
    statusKey: "ready",
    statusBg: "bg-secondary-container/20",
    statusColor: "text-on-secondary-container"
  },
  {
    icon: "picture_as_pdf",
    iconColor: "text-red-600",
    name: "stock_audit_jakarta_sept.pdf",
    type: "Stok",
    typeKey: "stock",
    date: "Oct 23, 2023",
    time: "09:15",
    size: "15.8 MB",
    status: "Ready",
    statusKey: "ready",
    statusBg: "bg-secondary-container/20",
    statusColor: "text-on-secondary-container"
  },
  {
    icon: "csv",
    iconColor: "text-on-surface-variant",
    name: "customer_loyalty_dump.csv",
    type: "Pelanggan",
    typeKey: "customer",
    date: "Oct 21, 2023",
    time: "18:45",
    size: "840 KB",
    status: "Expired",
    statusKey: "expired",
    statusBg: "bg-surface-container-high",
    statusColor: "text-on-surface-variant",
    expired: true
  },
  {
    icon: "table_chart",
    iconColor: "text-amber-600",
    name: "employee_performance_h2.xlsx",
    type: "Karyawan",
    typeKey: "employee",
    date: "Oct 20, 2023",
    time: "11:30",
    size: "1.1 MB",
    status: "Processing",
    statusKey: "processing",
    statusBg: "",
    statusColor: "text-primary",
    processing: true
  }
];

const reportTypes = [
  { icon: "payments", label: "Penjualan", key: "sales" },
  { icon: "inventory_2", label: "Stok", key: "stock" },
  { icon: "group", label: "Pelanggan", key: "customer" },
  { icon: "badge", label: "Karyawan", key: "employee" }
];

const periods = [
  { label: "Today", dateLabel: "page.report.sales.today" },
  { label: "Weekly", dateLabel: "page.report.sales.weekly" },
  { label: "Monthly", dateLabel: "page.report.sales.monthly" }
];

const GlobalReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isBestSeller = location.pathname === "/best-selling";
  const [activeTab, setActiveTab] = useState(isBestSeller ? "best-seller" : "sales");
  const [salesPeriod, setSalesPeriod] = useState("Today");

  return (
    <div data-tour="page-reports" className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.report.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("page.report.description")}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}>
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {t(`page.report.tab.${tab.key}`)}
          </button>
        ))}
      </div>

      {activeTab === "sales" && (
        <GlobalSalesTab t={t} period={salesPeriod} setPeriod={setSalesPeriod} />
      )}
      {activeTab === "best-seller" && <BestSellerTab t={t} />}
      {activeTab === "export" && <ExportTab t={t} />}
    </div>
  );
};

const GlobalSalesTab = ({ t, period, setPeriod }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("page.report.sales.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("page.report.sales.description")}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-card border border-border rounded-lg p-1 flex">
          {periods.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.label)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                period === p.label
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {t(`page.report.sales.${p.label.toLowerCase()}`)}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-foreground bg-card hover:bg-muted transition-all">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          {t("page.report.sales.storeCategory")}
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          {period === "Today"
            ? t("page.report.sales.today")
            : t("page.report.sales.dateRangePlaceholder")}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          icon: "payments",
          iconBg: "bg-primary-fixed",
          iconColor: "text-primary",
          labelKey: "page.report.sales.kpi.totalSales",
          value: "Rp 4.28B",
          trend: "+12.4%",
          trendColor: "text-secondary",
          trendIcon: "trending_up"
        },
        {
          icon: "receipt_long",
          iconBg: "bg-secondary-container",
          iconColor: "text-on-secondary-container",
          labelKey: "page.report.sales.kpi.avgTransaction",
          value: "Rp 312.4K",
          trend: "+3.1%",
          trendColor: "text-secondary",
          trendIcon: "trending_up"
        },
        {
          icon: "group",
          iconBg: "bg-tertiary-fixed",
          iconColor: "text-tertiary",
          labelKey: "page.report.sales.kpi.totalCustomers",
          value: formatNumber(14208),
          trend: "-0.8%",
          trendColor: "text-error",
          trendIcon: "trending_down"
        },
        {
          icon: "storefront",
          iconBg: "bg-primary-container/10",
          iconColor: "text-primary",
          labelKey: "page.report.sales.kpi.totalOutlets",
          value: "42 / 45",
          trendKey: "common.active",
          trendColor: "text-on-secondary-container",
          trendIcon: ""
        }
      ].map((kpi) => (
        <div
          key={kpi.labelKey || kpi.label}
          className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2 ${kpi.iconBg} rounded-lg`}>
              <span className={`material-symbols-outlined ${kpi.iconColor}`}>{kpi.icon}</span>
            </div>
            {kpi.trendIcon && (
              <span className={`flex items-center gap-1 text-xs font-semibold ${kpi.trendColor}`}>
                <span className="material-symbols-outlined text-sm">{kpi.trendIcon}</span>
                {kpi.trendKey ? t(kpi.trendKey) : kpi.trend}
              </span>
            )}
            {!kpi.trendIcon && (
              <span className="px-2 py-0.5 bg-secondary-container/20 text-on-secondary-container rounded text-xs font-semibold">
                {kpi.trendKey ? t(kpi.trendKey) : kpi.trend}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {t(kpi.labelKey)}
          </p>
          <p className="text-xl font-bold text-foreground">{kpi.value}</p>
        </div>
      ))}
    </div>

    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t("page.report.sales.revenueTrend")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("page.report.sales.revenueTrendDesc")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">
              {t("page.report.sales.thisMonth")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground">
              {t("page.report.sales.lastMonth")}
            </span>
          </div>
        </div>
      </div>
      <div className="relative h-[300px] w-full bg-muted/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
          {barHeights.map((h, i) => (
            <div key={i} className="flex-1 relative group">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${
                  i === 5 ? "bg-primary shadow-lg" : "bg-primary/20"
                }`}
                style={{ height: `${h}%` }}>
                {i === 5 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Rp 214M
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="text-base font-semibold text-foreground">
          {t("page.report.sales.storePerformance")}
        </h3>
        <button className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
          {t("page.report.sales.viewDetailedReport")}
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.sales.table.storeName")}
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.sales.table.location")}
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                {t("page.report.sales.table.totalSales")}
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                {t("page.report.sales.table.transactions")}
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                {t("page.report.sales.table.targetStatus")}
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {storeRows.map((store) => (
              <tr key={store.name} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${store.bg} flex items-center justify-center ${store.color} text-sm font-bold`}>
                      {store.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{store.location}</td>
                <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground text-right">
                  {store.sales}
                </td>
                <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground text-right">
                  {store.trx}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 ${store.statusBg} ${store.statusColor} rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${store.dot}`} />
                    {store.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t("page.report.sales.showingStores")}</p>
        <div className="flex gap-1">
          <button
            className="p-1 border border-border rounded hover:bg-muted transition-all disabled:opacity-50"
            disabled>
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button className="p-1 border border-border rounded hover:bg-muted transition-all">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const BestSellerTab = ({ t }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t("page.report.bestSeller.title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("page.report.bestSeller.description")}</p>
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("page.report.bestSeller.selectBranch")}
          </label>
          <select className="bg-card border border-border rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-primary/20">
            <option>{t("page.report.bestSeller.allStores")}</option>
            <option>Jakarta Selatan</option>
            <option>Surabaya Hub</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("page.report.bestSeller.timeRange")}
          </label>
          <select className="bg-card border border-border rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-primary/20">
            <option>{t("page.report.bestSeller.last30Days")}</option>
            <option>{t("page.report.bestSeller.thisQuarter")}</option>
            <option>{t("page.report.bestSeller.thisYear")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("page.report.bestSeller.category")}
          </label>
          <select className="bg-card border border-border rounded-lg text-sm py-1.5 px-3 focus:ring-2 focus:ring-primary/20">
            <option>{t("page.report.bestSeller.allCategories")}</option>
            <option>Electronics</option>
            <option>F&B Essentials</option>
          </select>
        </div>
        <button className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          {t("page.report.bestSeller.apply")}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        {
          icon: "shopping_bag",
          iconColor: "text-primary",
          labelKey: "page.report.bestSeller.kpi.unitsSold",
          value: formatNumber(128492),
          trend: "+12.4% vs bln lalu",
          trendIcon: "trending_up",
          trendColor: "text-on-secondary-container"
        },
        {
          icon: "payments",
          iconColor: "text-secondary",
          labelKey: "page.report.bestSeller.kpi.productRevenue",
          value: "Rp 4.2B",
          trend: "+8.1% vs bln lalu",
          trendIcon: "trending_up",
          trendColor: "text-on-secondary-container"
        },
        {
          icon: "inventory_2",
          iconColor: "text-tertiary",
          labelKey: "page.report.bestSeller.kpi.activeProducts",
          value: formatNumber(1240),
          trend: "Stabilitas ketersediaan 98%",
          trendIcon: "",
          trendColor: "text-outline"
        },
        {
          icon: "assignment_return",
          iconColor: "text-error",
          labelKey: "page.report.bestSeller.kpi.returnRate",
          value: "0.82%",
          trend: "-0.1% penurunan",
          trendIcon: "trending_down",
          trendColor: "text-on-error-container"
        }
      ].map((kpi) => (
        <div key={kpi.labelKey} className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-muted-foreground">{t(kpi.labelKey)}</span>
            <span className={`material-symbols-outlined ${kpi.iconColor}`}>{kpi.icon}</span>
          </div>
          <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${kpi.trendColor}`}>
            {kpi.trendIcon && (
              <span className="material-symbols-outlined text-sm">{kpi.trendIcon}</span>
            )}
            {kpi.trend}
          </p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-foreground">
            {t("page.report.bestSeller.top10Visualization")}
          </h3>
          <button className="text-primary text-xs font-semibold hover:underline">
            {t("page.report.bestSeller.viewAll")}
          </button>
        </div>
        <div className="space-y-4">
          {bestSellerBarData.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground">{item.label}</span>
                <span className="font-mono text-muted-foreground">{item.value}</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${item.pct}%`, opacity: item.pct / 100 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-foreground text-background rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10">
          <span className="material-symbols-outlined text-[200px]">auto_awesome</span>
        </div>
        <div className="relative z-10">
          <span className="bg-secondary/20 text-secondary-fixed border border-secondary/30 px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
            {t("page.report.bestSeller.productSpotlight")}
          </span>
          <h4 className="text-lg font-semibold mb-2">Artisan Coffee Blend</h4>
          <p className="text-sm text-background/70 mb-6">
            Kontribusi pendapatan tertinggi selama 6 bulan berturut-turut di 12 cabang berbeda.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-[10px] text-background/60 uppercase tracking-widest">
                {t("page.report.bestSeller.share")}
              </p>
              <p className="text-lg font-bold">18%</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-[10px] text-background/60 uppercase tracking-widest">
                {t("common.status")}
              </p>
              <p className="text-lg font-bold">{t("page.report.bestSeller.lead")}</p>
            </div>
          </div>
        </div>
        <button className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all relative z-10">
          {t("page.report.bestSeller.viewDeepAnalysis")}
        </button>
      </div>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="text-base font-semibold text-foreground">
          {t("page.report.bestSeller.productPerformanceTable")}
        </h3>
        <div className="flex gap-2">
          <button className="p-1.5 border border-border rounded-lg hover:bg-muted transition-all">
            <span className="material-symbols-outlined text-lg">file_download</span>
          </button>
          <button className="p-1.5 border border-border rounded-lg hover:bg-muted transition-all">
            <span className="material-symbols-outlined text-lg">print</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.bestSeller.table.rank")}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.bestSeller.table.productName")}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.bestSeller.table.sku")}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.bestSeller.table.totalSold")}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.bestSeller.table.revenue")}
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.report.bestSeller.table.trend")}
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                {t("page.report.bestSeller.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bestSellerRows.map((row) => (
              <tr key={row.rank} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-sm font-mono font-bold text-primary">#{row.rank}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded ${row.iconBg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-lg ${row.iconColor}`}>
                        {row.icon}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-mono text-muted-foreground">{row.sku}</td>
                <td className="px-4 py-4 text-sm font-mono text-foreground">{row.sold}</td>
                <td className="px-4 py-4 text-sm font-mono text-foreground">{row.revenue}</td>
                <td className="px-4 py-4">
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold w-fit ${
                      row.trend === "up"
                        ? "bg-secondary-container/20 text-on-secondary-container"
                        : "bg-error-container/20 text-on-error-container"
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                      {row.trend === "up" ? "trending_up" : "trending_down"}
                    </span>
                    {row.trendVal}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{t("page.report.bestSeller.table.showing")}</p>
        <div className="flex gap-1">
          <button className="px-2 py-1 border border-border rounded hover:bg-muted transition-all">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-semibold">
            1
          </button>
          <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-all text-sm">
            2
          </button>
          <button className="px-3 py-1 border border-border rounded hover:bg-muted transition-all text-sm">
            3
          </button>
          <button className="px-2 py-1 border border-border rounded hover:bg-muted transition-all">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ExportTab = ({ t }) => {
  const [reportType, setReportType] = useState("Penjualan");
  const [fileFormat, setFileFormat] = useState("xlsx");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{t("page.report.export.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("page.report.export.description")}</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">tune</span>
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {t("page.report.export.exportConfiguration")}
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                {t("page.report.export.selectReportType")}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {reportTypes.map((rt) => (
                  <label
                    key={rt.label}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      reportType === rt.label
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary bg-card"
                    }`}>
                    <input
                      type="radio"
                      name="report_type"
                      value={rt.label}
                      checked={reportType === rt.label}
                      onChange={(e) => setReportType(e.target.value)}
                      className="hidden"
                    />
                    <span
                      className={`material-symbols-outlined text-3xl mb-2 ${
                        reportType === rt.label ? "text-primary" : "text-muted-foreground"
                      }`}>
                      {rt.icon}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {t(`page.report.export.reportType.${rt.key}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("page.report.export.dateRange")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    calendar_today
                  </span>
                  <select className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option>{t("page.report.export.last30Days")}</option>
                    <option>{t("page.report.export.customRange")}</option>
                    <option>{t("page.report.export.yearToDate")}</option>
                    <option>{t("page.report.export.lastQuarter")}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t("page.report.export.storeContext")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    storefront
                  </span>
                  <select className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option>{t("page.report.export.allStores")}</option>
                    <option>Jakarta Central Hub</option>
                    <option>Surabaya Distribution</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                {t("page.report.export.fileFormat")}
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "xlsx", icon: "description", labelKey: "page.report.export.format.xlsx" },
                  { key: "csv", icon: "csv", labelKey: "page.report.export.format.csv" },
                  { key: "pdf", icon: "picture_as_pdf", labelKey: "page.report.export.format.pdf" }
                ].map((fmt) => (
                  <button
                    key={fmt.key}
                    onClick={() => setFileFormat(fmt.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-semibold ${
                      fileFormat === fmt.key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}>
                    <span className="material-symbols-outlined">{fmt.icon}</span>
                    {t(fmt.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-xl text-base font-semibold flex items-center gap-3 transition-all shadow-md">
                <span className="material-symbols-outlined">cloud_download</span>
                {t("page.report.export.generateExport")}
              </button>
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="bg-foreground text-background p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-base font-semibold mb-2">
                {t("page.report.export.storageUsage")}
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-primary-fixed-dim">74%</span>
                <span className="text-sm text-background/60">
                  {t("page.report.export.ofQuota")}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mt-4">
                <div className="w-3/4 h-full bg-primary-fixed rounded-full shadow-[0_0_8px_rgba(216,226,255,0.5)]" />
              </div>
              <p className="mt-4 text-xs text-background/70 leading-relaxed">
                {t("page.report.export.storageTip")}
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <span className="material-symbols-outlined text-[120px]">database</span>
            </div>
          </div>

          {/* <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex-1">
            <h4 className="text-base font-semibold text-foreground mb-4">Scheduled Exports</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">update</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Weekly Sales Summary</p>
                  <p className="text-xs text-muted-foreground">Every Monday at 08:00 AM</p>
                </div>
                <span className="material-symbols-outlined text-muted-foreground cursor-pointer">
                  more_vert
                </span>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm font-semibold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>
                Create Schedule
              </button>
            </div>
          </div> */}
        </section>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-base font-semibold text-foreground">
            {t("page.report.export.recentExports")}
          </h3>
          <button className="text-primary text-xs font-semibold hover:underline">
            {t("page.report.export.viewAllActivities")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.export.table.fileName")}
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.export.table.type")}
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.export.table.dateGenerated")}
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.export.table.size")}
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.export.table.status")}
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.export.table.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exportHistory.map((file, i) => (
                <tr
                  key={i}
                  className={`hover:bg-muted/20 transition-all ${file.expired ? "opacity-70" : ""}`}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${file.iconColor}`}>
                        {file.icon}
                      </span>
                      <span className="text-sm font-medium text-foreground">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {t(`page.report.export.reportType.${file.typeKey}`)}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {file.date} &bull; {file.time}
                  </td>
                  <td className="px-6 py-3 text-sm font-mono text-muted-foreground">{file.size}</td>
                  <td className="px-6 py-3">
                    {file.processing ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${file.statusColor}`}>
                          {t(`page.report.export.status.${file.statusKey}`)}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full ${file.statusBg} ${file.statusColor} text-[10px] font-bold uppercase tracking-wider`}>
                        {t(`page.report.export.status.${file.statusKey}`)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {!file.expired && !file.processing && (
                      <button className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-all">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                    )}
                    {file.expired && (
                      <button className="p-1.5 text-muted-foreground opacity-30 cursor-not-allowed">
                        <span className="material-symbols-outlined">history</span>
                      </button>
                    )}
                    {file.processing && (
                      <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-all">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: "bar_chart",
            iconBg: "bg-white",
            iconColor: "text-primary",
            labelKey: "page.report.export.stats.exportsThisMonth",
            value: "128 Files"
          },
          {
            icon: "check_circle",
            iconBg: "bg-white",
            iconColor: "text-on-secondary-container",
            labelKey: "page.report.export.stats.successRate",
            value: "99.8%"
          },
          {
            icon: "schedule",
            iconBg: "bg-white",
            iconColor: "text-on-tertiary-container",
            labelKey: "page.report.export.stats.avgGenerationTime",
            value: "12.4s"
          }
        ].map((stat) => (
          <div
            key={stat.labelKey}
            className="bg-muted/50 p-4 rounded-xl border border-border flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center shadow-sm`}>
              <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{t(stat.labelKey)}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalReport;
