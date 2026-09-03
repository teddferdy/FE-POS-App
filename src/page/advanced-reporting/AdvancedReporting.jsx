import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";
import {
  getReportingSalesSummary,
  getReportingProductSales,
  getReportingCategorySales,
  getReportingKasirPerformance
} from "@/services/report";
import { getAllLocation } from "@/services/location";
import { formatCurrency, formatNumber } from "@/utils/reportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "@/components/ui/DataTable";
import ExportButtons from "@/components/organism/ExportButtons";
import NoStore from "@/components/ui/NoStore";
import AbortController from "@/components/organism/abort-controller";
import PageHeader from "@/components/ui/PageHeader";

const FILTERS = [
  { key: "daily", labelKey: "page.advancedReporting.period.daily" },
  { key: "weekly", labelKey: "page.advancedReporting.period.weekly" },
  { key: "monthly", labelKey: "page.advancedReporting.period.monthly" }
];

const TAB_KEY = {
  sales: "sales",
  product: "productSales",
  category: "categorySales",
  kasir: "kasirPerformance"
};

const AdvancedReporting = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [period, setPeriod] = useState("daily");
  const [store, setStore] = useState(cookie?.activeStore || "");
  const [activeTab, setActiveTab] = useState("sales");

  const { data: locData } = useQuery(["locations-report"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const locations = locData?.data || [];
  const storeId = store || cookie?.activeStore;

  useEffect(() => {
    const activeStore = cookie?.activeStore;
    const hasStoredStore = activeStore && activeStore !== "undefined" && String(activeStore) !== "";
    if (isSuperAdmin && locations.length > 0 && !hasStoredStore) {
      setStore(String(locations[0].id));
    }
  }, [isSuperAdmin, locations, cookie]);

  const {
    data: salesData,
    isLoading: salesLoading,
    isError: salesError,
    refetch: salesRefetch
  } = useQuery(
    ["advanced-sales-summary", period, storeId],
    () => getReportingSalesSummary({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
    refetch: productRefetch
  } = useQuery(
    ["advanced-product-sales", period, storeId],
    () => getReportingProductSales({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
    refetch: categoryRefetch
  } = useQuery(
    ["advanced-category-sales", period, storeId],
    () => getReportingCategorySales({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const {
    data: kasirData,
    isLoading: kasirLoading,
    isError: kasirError,
    refetch: kasirRefetch
  } = useQuery(
    ["advanced-kasir-performance", period, storeId],
    () => getReportingKasirPerformance({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const salesColumns = [
    { key: "tanggal", label: t("page.advancedReporting.column.date") },
    { key: "totalTransaksi", label: t("page.advancedReporting.column.transactions") },
    { key: "totalPenjualan", label: t("page.advancedReporting.column.totalSales") },
    { key: "totalDiscount", label: t("page.advancedReporting.column.totalDiscount") },
    { key: "totalQty", label: t("page.advancedReporting.column.totalQty") },
    { key: "totalCovers", label: t("page.advancedReporting.column.totalCovers") }
  ];

  const productColumns = [
    { key: "product", label: t("page.advancedReporting.column.product") },
    { key: "quantitySold", label: t("page.advancedReporting.column.quantitySold") },
    { key: "revenue", label: t("page.advancedReporting.column.revenue") },
    { key: "cost", label: t("page.advancedReporting.column.cost") },
    { key: "profit", label: t("page.advancedReporting.column.profit") }
  ];

  const categoryColumns = [
    { key: "category", label: t("page.advancedReporting.column.category") },
    { key: "quantitySold", label: t("page.advancedReporting.column.quantitySold") },
    { key: "revenue", label: t("page.advancedReporting.column.revenue") },
    { key: "cost", label: t("page.advancedReporting.column.cost") },
    { key: "profit", label: t("page.advancedReporting.column.profit") }
  ];

  const kasirColumns = [
    { key: "cashier", label: t("page.advancedReporting.column.cashier") },
    { key: "totalSales", label: t("page.advancedReporting.column.totalSales") },
    { key: "transactions", label: t("page.advancedReporting.column.transactions") },
    { key: "avgTransaction", label: t("page.advancedReporting.column.avgTransaction") },
    { key: "itemsSold", label: t("page.advancedReporting.column.itemsSold") },
    { key: "accuracyRate", label: t("page.advancedReporting.column.accuracyRate") }
  ];

  const StatCard = ({ icon: Icon, label, value }) => (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          { i18nKey: "page.advancedReporting.breadcrumb" }
        ]}
        title={t("page.advancedReporting.title")}
        description={t("page.advancedReporting.description")}>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.key} value={f.key}>
                {t(f.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isSuperAdmin && (
          <Select value={store} onValueChange={setStore}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("page.advancedReporting.store.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <ExportButtons reportKey={TAB_KEY[activeTab]} buildParams={() => ({ store: storeId })} />
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">{t("page.advancedReporting.tabs.sales")}</TabsTrigger>
          <TabsTrigger value="product">{t("page.advancedReporting.tabs.product")}</TabsTrigger>
          <TabsTrigger value="category">{t("page.advancedReporting.tabs.category")}</TabsTrigger>
          <TabsTrigger value="kasir">{t("page.advancedReporting.tabs.kasir")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          {salesError ? (
            <AbortController refetch={salesRefetch} />
          ) : salesLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : salesData?.success ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon={DollarSign}
                  label={t("page.advancedReporting.kpi.totalSales")}
                  value={formatCurrency(salesData.data.totalSales)}
                />
                <StatCard
                  icon={Package}
                  label={t("page.advancedReporting.kpi.totalTransactions")}
                  value={formatNumber(salesData.data.totalTransactions)}
                />
                <StatCard
                  icon={Users}
                  label={t("page.advancedReporting.kpi.totalCustomers")}
                  value={formatNumber(salesData.data.totalCustomers)}
                />
                <StatCard
                  icon={TrendingUp}
                  label={t("page.advancedReporting.kpi.totalItems")}
                  value={formatNumber(salesData.data.totalItems)}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("page.advancedReporting.table.salesTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable columns={salesColumns} data={salesData.data} />
                </CardContent>
              </Card>
            </>
          ) : (
            <NoStore />
          )}
        </TabsContent>

        <TabsContent value="product">
          {productError ? (
            <AbortController refetch={productRefetch} />
          ) : productLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : productData?.success ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("page.advancedReporting.table.productTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={productColumns} data={productData.data} />
              </CardContent>
            </Card>
          ) : (
            <NoStore />
          )}
        </TabsContent>

        <TabsContent value="category">
          {categoryError ? (
            <AbortController refetch={categoryRefetch} />
          ) : categoryLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : categoryData?.success ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("page.advancedReporting.table.categoryTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={categoryColumns} data={categoryData.data} />
              </CardContent>
            </Card>
          ) : (
            <NoStore />
          )}
        </TabsContent>

        <TabsContent value="kasir">
          {kasirError ? (
            <AbortController refetch={kasirRefetch} />
          ) : kasirLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : kasirData?.success ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("page.advancedReporting.table.kasirTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={kasirColumns} data={kasirData.data} />
              </CardContent>
            </Card>
          ) : (
            <NoStore />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReporting;
