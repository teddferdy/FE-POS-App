import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import {
  LayoutDashboard,
  RefreshCw,
  Store,
  CalendarDays,
  Building2,
  Info,
  BellRing,
  Calendar
} from "lucide-react";
import { getSuperAdminDashboard } from "@/services/dashboard";
import { getAllLocation } from "@/services/location";
import { getUpcomingPayments } from "@/services/expense";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AbortController from "@/components/organism/abort-controller";
import KpiCards from "@/components/dashboard-super-admin/KpiCards";
import SalesTrendChart from "@/components/dashboard-super-admin/SalesTrendChart";
import PaymentBreakdown from "@/components/dashboard-super-admin/PaymentBreakdown";
import StorePerformance from "@/components/dashboard-super-admin/StorePerformance";
import FinanceSection from "@/components/dashboard-super-admin/FinanceSection";
import OperationsSection from "@/components/dashboard-super-admin/OperationsSection";
import CustomersSection from "@/components/dashboard-super-admin/CustomersSection";
import ActivitySection from "@/components/dashboard-super-admin/ActivitySection";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { buildDashboardQueryParams } from "@/lib/dashboard-query";

const PRESETS = [
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "thisMonth", label: "Bulan Ini" },
  { key: "lastMonth", label: "Bulan Lalu" },
  { key: "all", label: "Semua" }
];

const getRange = (key) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === "7d") {
    return {
      startDate: new Date(todayStart.getTime() - 6 * 86400000).toISOString(),
      endDate: now.toISOString(),
      label: "7 hari terakhir"
    };
  }
  if (key === "30d") {
    return {
      startDate: new Date(todayStart.getTime() - 29 * 86400000).toISOString(),
      endDate: now.toISOString(),
      label: "30 hari terakhir"
    };
  }
  if (key === "thisMonth") {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      endDate: now.toISOString(),
      label: `bulan ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
    };
  }
  if (key === "lastMonth") {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString(),
      label: "bulan lalu"
    };
  }
  return { startDate: null, endDate: null, label: "seluruh periode" };
};

const DashboardSuperAdmin = () => {
  const { t } = useTranslation();
  const { activeStoreId, setActiveStore } = useStore();
  const navigate = useNavigate();
  const [preset, setPreset] = useState("thisMonth");
  const [dateRange, setDateRange] = useState(() => getRange("thisMonth"));

  const storeFilter = activeStoreId ? String(activeStoreId) : null;

  const { data: locationsData } = useQuery(
    ["location-all-active"],
    () => getAllLocation("active"),
    { staleTime: 5 * 60 * 1000 }
  );
  const locations = locationsData?.data || [];

  const { data: upcomingData } = useQuery(
    ["expense-upcoming", storeFilter],
    () => getUpcomingPayments({ location: storeFilter || undefined, days: 7 }),
    { staleTime: 60000 }
  );
  const upcoming = upcomingData?.data || [];
  const upcomingCount = upcoming.length;

  const queryParams = useMemo(
    () => buildDashboardQueryParams({ storeFilter, dateRange }),
    [storeFilter, dateRange]
  );

  const {
    data: dashData,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery(["dashboard-super-admin", queryParams], () => getSuperAdminDashboard(queryParams), {
    enabled: true,
    staleTime: 0
  });

  const d = dashData?.data || {};
  const summary = d.summary || {};
  const selectedStoreName = locations.find((l) => String(l.id) === String(storeFilter))?.name;

  useEffect(() => {
    document.title = "Dashboard Super Admin - POS";
  }, []);

  const handlePreset = (key) => {
    setPreset(key);
    setDateRange(getRange(key));
  };

  return (
    <div className="space-y-6">
      {/* Header + global filter */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard Super Admin</h1>
              <p className="text-sm text-muted-foreground">
                Ringkasan bisnis multi-store · pendapatan, pembayaran, keuangan, operasional, dan
                pelanggan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-muted rounded-lg p-0.5">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    preset === p.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Store size={16} className="text-muted-foreground shrink-0" />
              <Select
                value={storeFilter || "all"}
                onValueChange={(v) => {
                  if (v === "all") setActiveStore("", "");
                  else setActiveStore(v, "");
                }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Toko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Toko</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={String(loc.id)}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={15} />
              <span className="capitalize">{dateRange.label}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => refetch()}
              disabled={isFetching}>
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              Muat Ulang
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Building2 size={13} />
            {storeFilter ? selectedStoreName || `Store #${storeFilter}` : "Semua store"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} />
            Periode:{" "}
            {dateRange.startDate
              ? `${new Date(dateRange.startDate).toLocaleDateString("id-ID")} – ${new Date(
                  dateRange.endDate
                ).toLocaleDateString("id-ID")}`
              : "Semua waktu"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Info size={13} />
            {d.meta?.storeCount || 0} store aktif
          </span>
        </div>
      </div>

      {upcomingCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <BellRing size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {t("page.expense.upcoming.title")}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              {t("page.expense.list.upcomingDesc", { count: upcomingCount })}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {upcoming.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/detail-expense?id=${p.id}`)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-background border border-amber-300 dark:border-amber-700 text-xs font-medium text-amber-800 dark:text-amber-200 hover:border-amber-400 transition-colors">
                  <Calendar size={12} className="shrink-0" />
                  <span className="truncate max-w-[180px]">{p.description || "-"}</span>
                  <span className="text-amber-500 dark:text-amber-400 whitespace-nowrap">
                    · {t("page.expense.upcoming.dueIn")}{" "}
                    {Math.ceil((new Date(p.nextDueDate).getTime() - Date.now()) / 86400000)}{" "}
                    {t("page.expense.upcoming.days")}
                  </span>
                  {p.storeName && (
                    <span className="text-amber-500 dark:text-amber-400 whitespace-nowrap">
                      · {p.storeName}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          <KpiCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <SalesTrendChart kpiTrend={d.kpiTrend} filterLabel={dateRange.label} />
            <PaymentBreakdown paymentBreakdown={d.paymentBreakdown} />
          </div>

          <StorePerformance storePerformance={d.storePerformance} totalRevenue={summary.revenue} />

          <FinanceSection finance={d.finance} summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <OperationsSection operations={d.operations} />
            </div>
            <div className="lg:col-span-4">
              <CustomersSection customers={d.customers} />
            </div>
          </div>

          <ActivitySection activity={d.activity} />

          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
            <span>
              Total pendapatan:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrencyRupiah(summary.revenue)}
              </span>
            </span>
            <span>
              {summary.orders} order · {summary.itemsSold} item terjual · {summary.totalMembers}{" "}
              member
            </span>
          </div>
        </>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-card rounded-xl border border-border p-5">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-56 mb-4" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
      <div className="lg:col-span-4 bg-card rounded-xl border border-border p-5">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-56 mb-4" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-full mt-2" />
      </div>
    </div>
    <div className="bg-card rounded-xl border border-border p-5">
      <Skeleton className="h-5 w-56 mb-4" />
      <Skeleton className="h-[260px] w-full rounded-lg" />
    </div>
    <div className="bg-card rounded-xl border border-border p-5">
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  </div>
);

export default DashboardSuperAdmin;
