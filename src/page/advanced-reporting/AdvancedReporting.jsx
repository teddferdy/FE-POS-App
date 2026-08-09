/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import * as XLSX from "xlsx";
import { TrendingUp, Package, Users, DollarSign, Download } from "lucide-react";
import {
  getReportingSalesSummary,
  getReportingProductSales,
  getReportingCategorySales,
  getReportingKasirPerformance
} from "@/services/report";
import { getAllLocation } from "@/services/location";
import { formatCurrency, formatNumber } from "@/utils/reportUtils";
import { Button } from "@/components/ui/button";
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
import NoStore from "@/components/ui/NoStore";
import AbortController from "@/components/organism/abort-controller";

const FILTERS = [
  { key: "daily", label: "Harian" },
  { key: "weekly", label: "Mingguan" },
  { key: "monthly", label: "Bulanan" }
];

const AdvancedReporting = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [period, setPeriod] = useState("daily");
  const [store, setStore] = useState("");
  const [activeTab, setActiveTab] = useState("sales");

  const { data: locData } = useQuery(["locations-report"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const locations = locData?.data || [];
  const storeId = store || cookie?.activeStore;

  const { data: salesData, isLoading: salesLoading } = useQuery(
    ["advanced-sales-summary", period, storeId],
    () => getReportingSalesSummary({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const { data: productData, isLoading: productLoading } = useQuery(
    ["advanced-product-sales", period, storeId],
    () => getReportingProductSales({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const { data: categoryData, isLoading: categoryLoading } = useQuery(
    ["advanced-category-sales", period, storeId],
    () => getReportingCategorySales({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const { data: kasirData, isLoading: kasirLoading } = useQuery(
    ["advanced-kasir-performance", period, storeId],
    () => getReportingKasirPerformance({ store: storeId, period }),
    { enabled: !!storeId }
  );

  const salesColumns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "totalTransaksi", label: "Total Transaksi" },
    { key: "totalPenjualan", label: "Total Penjualan" },
    { key: "totalDiscount", label: "Total Discount" },
    { key: "totalQty", label: "Total Qty" },
    { key: "totalCovers", label: "Total Covers" }
  ];

  const productColumns = [
    { key: "product", label: "Produk" },
    { key: "quantitySold", label: "Qty Terjual" },
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost" },
    { key: "profit", label: "Profit" }
  ];

  const categoryColumns = [
    { key: "category", label: "Kategori" },
    { key: "quantitySold", label: "Qty Terjual" },
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost" },
    { key: "profit", label: "Profit" }
  ];

  const kasirColumns = [
    { key: "cashier", label: "Kasir" },
    { key: "totalSales", label: "Total Sales" },
    { key: "transactions", label: "Transaksi" },
    { key: "avgTransaction", label: "Avg Transaction" },
    { key: "itemsSold", label: "Items Sold" },
    { key: "accuracyRate", label: "Accuracy Rate" }
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

  // const getData = () => {
  //   const map = {
  //     sales: salesData,
  //     product: productData,
  //     category: categoryData,
  //     kasir: kasirData
  //   };
  //   return map[activeTab];
  // };

  // const getColumns = () => {
  //   const map = {
  //     sales: salesColumns,
  //     product: productColumns,
  //     category: categoryColumns,
  //     kasir: kasirColumns
  //   };
  //   return map[activeTab];
  // };

  const handleExport = (type) => {
    const dataMap = {
      sales: salesData,
      product: productData,
      category: categoryData,
      kasir: kasirData
    };
    const data = dataMap[type]?.data;
    if (!data) return;
    const rows = [["Laporan", type, "Periode", period, "Toko", storeId || "Semua"]];
    rows.push([]);
    if (Array.isArray(data)) {
      data.forEach((item) => {
        rows.push(Object.values(item));
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `laporan-${type}-${period}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("page.advancedReporting.title")}</h1>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSuperAdmin && (
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih toko" />
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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">{t("page.advancedReporting.tabs.sales")}</TabsTrigger>
          <TabsTrigger value="product">{t("page.advancedReporting.tabs.product")}</TabsTrigger>
          <TabsTrigger value="category">{t("page.advancedReporting.tabs.category")}</TabsTrigger>
          <TabsTrigger value="kasir">{t("page.advancedReporting.tabs.kasir")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <AbortController />
          {salesLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : salesData?.success ? (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon={DollarSign}
                  label="Total Penjualan"
                  value={formatCurrency(salesData.data.totalSales)}
                />
                <StatCard
                  icon={Package}
                  label="Total Transaksi"
                  value={formatNumber(salesData.data.totalTransactions)}
                />
                <StatCard
                  icon={Users}
                  label="Total Pelanggan"
                  value={formatNumber(salesData.data.totalCustomers)}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Total Item Terjual"
                  value={formatNumber(salesData.data.totalItems)}
                />
              </div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Ringkasan Penjualan</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExport("sales")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
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
          <AbortController />
          {productLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : productData?.success ? (
            <Card>
              <CardHeader>
                <CardTitle>Penjualan per Produk</CardTitle>
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
          <AbortController />
          {categoryLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : categoryData?.success ? (
            <Card>
              <CardHeader>
                <CardTitle>Penjualan per Kategori</CardTitle>
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
          <AbortController />
          {kasirLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : kasirData?.success ? (
            <Card>
              <CardHeader>
                <CardTitle>Kinerja Kasir</CardTitle>
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
