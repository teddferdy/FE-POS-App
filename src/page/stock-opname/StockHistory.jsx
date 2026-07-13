import React, { useState } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { Calendar } from "lucide-react";
import { getAllStockHistory } from "@/services/stock";
import { getAllProductTable } from "@/services/product";
import { Combobox } from "@/components/ui/combobox";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import { useTranslation } from "react-i18next";
import NoStore from "@/components/ui/NoStore";
import StoreFilter from "@/components/ui/StoreFilter";
import { DatePicker } from "@/components/ui/date-picker";
import { useNavigate } from "react-router-dom";
import { getAllLocation } from "@/services/location";
import { format } from "date-fns";
import AbortController from "@/components/organism/abort-controller";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  } catch {
    return "-";
  }
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString("id-ID");
};

const StockHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const role = user?.roleType || "";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productFilter, setProductFilter] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [searchProduct] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-stock-history"], () => getAllLocation(), {
    enabled: true
  });

  const store = isSuperAdmin ? (storeFilter && storeFilter !== "all" ? storeFilter : "") : user?.store || "";
  const { data, isLoading, isError, refetch } = useQuery(
    ["stock-history", page, pageSize, productFilter, referenceFilter, startDate, endDate, store],
    () =>
      getAllStockHistory({
        page,
        limit: pageSize,
        store,
        product: productFilter || undefined,
        referenceType: referenceFilter || undefined,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
      })
  );

  const { data: productsData } = useQuery(["products-dropdown", searchProduct], () =>
    getAllProductTable({ location: "", limit: 100, page: 1, statusProduct: "all" })
  );

  const histories = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const total = pagination.total || 0;
  const products = productsData?.data || productsData?.products || [];

  const referenceTypeOptions = [
    { value: "", label: t("page.stockHistory.filter.allTypes") },
    { value: "purchase", label: t("page.stockHistory.reference.purchase") },
    { value: "sale", label: t("page.stockHistory.reference.sale") },
    { value: "adjustment", label: t("page.stockHistory.reference.adjustment") },
    { value: "opname", label: t("page.stockHistory.reference.opname") },
    { value: "purchase_return", label: t("page.stockHistory.reference.purchaseReturn") },
    { value: "sale_return", label: t("page.stockHistory.reference.saleReturn") },
    { value: "transfer", label: t("page.stockHistory.reference.transfer") },
    { value: "production", label: t("page.stockHistory.reference.production") },
    { value: "sale_return_reversal", label: t("page.stockHistory.reference.saleReturnReversal") },
    { value: "sale_reversal", label: t("page.stockHistory.reference.saleReversal") },
    { value: "production_reversal", label: t("page.stockHistory.reference.productionReversal") }
  ];

  const getChangeDisplay = (change) => {
    const num = Number(change);
    const cls = num >= 0 ? "text-green-600" : "text-red-600";
    const prefix = num >= 0 ? "+" : "";
    return (
      <span className={`font-semibold ${cls}`}>
        {prefix}
        {formatNumber(num)}
      </span>
    );
  };

  const getReferenceBadge = (type) => {
    const map = {
      purchase: "bg-blue-100 text-blue-700",
      sale: "bg-purple-100 text-purple-700",
      adjustment: "bg-amber-100 text-amber-700",
      opname: "bg-cyan-100 text-cyan-700",
      purchase_return: "bg-rose-100 text-rose-700",
      sale_return: "bg-pink-100 text-pink-700",
      transfer: "bg-teal-100 text-teal-700",
      production: "bg-green-100 text-green-700",
      sale_return_reversal: "bg-orange-100 text-orange-700",
      sale_reversal: "bg-red-100 text-red-700",
      production_reversal: "bg-yellow-100 text-yellow-700"
    };
    const labels = {
      purchase: t("page.stockHistory.reference.purchase"),
      sale: t("page.stockHistory.reference.sale"),
      adjustment: t("page.stockHistory.reference.adjustment"),
      opname: t("page.stockHistory.reference.opname"),
      purchase_return: t("page.stockHistory.reference.purchaseReturn"),
      sale_return: t("page.stockHistory.reference.saleReturn"),
      transfer: t("page.stockHistory.reference.transfer"),
      production: t("page.stockHistory.reference.production"),
      sale_return_reversal: t("page.stockHistory.reference.saleReturnReversal"),
      sale_reversal: t("page.stockHistory.reference.saleReversal"),
      production_reversal: t("page.stockHistory.reference.productionReversal")
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${map[type] || "bg-gray-100 text-gray-700"}`}>
        {labels[type] || type}
      </span>
    );
  };

  const columns = [
    {
      header: t("page.stockHistory.table.time"),
      render: (h) => <span className="text-xs whitespace-nowrap">{formatDate(h.createdAt)}</span>
    },
    {
      header: t("page.stockHistory.table.product"),
      render: (h) => (
        <span className="font-medium text-sm">
          {h.productData?.nameProduct || h.ingredientName || "-"}
        </span>
      )
    },
    {
      header: t("page.stockHistory.table.before"),
      align: "right",
      render: (h) => <span className="text-sm">{formatNumber(h.quantityBefore)}</span>
    },
    {
      header: t("page.stockHistory.table.change"),
      align: "right",
      render: (h) => getChangeDisplay(h.quantityChange)
    },
    {
      header: t("page.stockHistory.table.after"),
      align: "right",
      render: (h) => <span className="text-sm font-semibold">{formatNumber(h.quantityAfter)}</span>
    },
    {
      header: t("page.stockHistory.table.type"),
      render: (h) => getReferenceBadge(h.referenceType)
    },
    {
      header: t("page.stockHistory.table.notes"),
      render: (h) => (
        <span className="text-xs text-muted-foreground max-w-[200px] block truncate">
          {h.notes || "-"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() =>
              navigate(
                role === "super_admin"
                  ? "/dashboard-super-admin"
                  : role === "admin"
                    ? "/dashboard-admin"
                    : "/home"
              )
            }
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-muted-foreground">{t("breadcrumb.inventory")}</span>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.stockHistory")}</span>
        </nav>
      </div>

      <div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.stockHistory.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.stockHistory.description")}</p>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <DataTable
              columns={columns}
              data={histories}
              isLoading={isLoading}
              emptyMessage={t("page.stockHistory.empty")}
              emptyIcon={Calendar}
              toolbar={
                <Card className="p-4 border-0 shadow-none bg-transparent">
                  {isLoadingLocations ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <Skeleton className="h-9 rounded-md" />
                      <Skeleton className="h-9 rounded-md" />
                      <Skeleton className="h-9 rounded-md" />
                      <Skeleton className="h-9 rounded-md" />
                      <Skeleton className="h-9 rounded-md" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {isSuperAdmin && (
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                            {t("header.selectStore") || "Store"}
                          </label>
                          <StoreFilter
                            locations={locData?.data || []}
                            value={storeFilter}
                            onChange={(v) => {
                              setStoreFilter(v);
                              setPage(1);
                            }}
                            isSuperAdmin={isSuperAdmin}
                            t={t}
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          {t("page.stockHistory.filter.product")}
                        </label>
                        <Combobox
                          options={[
                            { value: "", label: t("page.stockHistory.filter.allProducts") },
                            ...products.map((p) => ({
                              value: String(p.id || p._id),
                              label: p.name || p.nameProduct
                            }))
                          ]}
                          value={productFilter}
                          onChange={(v) => {
                            setProductFilter(v);
                            setPage(1);
                          }}
                          placeholder={t("page.stockHistory.filter.allProducts")}
                          searchPlaceholder={t("common.search")}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          {t("page.stockHistory.filter.referenceType")}
                        </label>
                        <Combobox
                          options={referenceTypeOptions}
                          value={referenceFilter}
                          onChange={(v) => {
                            setReferenceFilter(v);
                            setPage(1);
                          }}
                          placeholder={t("page.stockHistory.filter.allTypes")}
                          searchPlaceholder={t("common.search")}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          {t("page.stockHistory.filter.startDate")}
                        </label>
                        <DatePicker
                          date={startDate}
                          setDate={(date) => {
                            setStartDate(date);
                            setPage(1);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          {t("page.stockHistory.filter.endDate")}
                        </label>
                        <DatePicker
                          date={endDate}
                          setDate={(date) => {
                            setEndDate(date);
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              }
              pagination={{
                page,
                pageSize,
                totalPages,
                total,
                onPageChange: setPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setPage(1);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StockHistory;
