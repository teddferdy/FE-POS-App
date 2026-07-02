import React, { useState } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllStockHistory } from "@/services/stock";
import { getAllProductTable } from "@/services/product";
import { Combobox } from "@/components/ui/combobox";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import AbortController from "@/components/organism/abort-controller";

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
  const [cookie] = useCookies();
  const user = cookie?.user;
  const role = user?.roleType || "";

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [productFilter, setProductFilter] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [searchProduct] = useState("");

  const { data, isLoading, isError, refetch } = useQuery(
    ["stock-history", page, limit, productFilter, referenceFilter, startDate, endDate],
    () =>
      getAllStockHistory({
        page,
        limit,
        product: productFilter || undefined,
        referenceType: referenceFilter || undefined,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined
      }),
    { keepPreviousData: true }
  );

  const { data: productsData } = useQuery(
    ["products-dropdown", searchProduct],
    () => getAllProductTable({ location: "", limit: 100, page: 1, statusProduct: "all" }),
    { keepPreviousData: true }
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
    { value: "return", label: t("page.stockHistory.reference.return") }
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
      return: "bg-rose-100 text-rose-700"
    };
    const labels = {
      purchase: t("page.stockHistory.reference.purchase"),
      sale: t("page.stockHistory.reference.sale"),
      adjustment: t("page.stockHistory.reference.adjustment"),
      opname: t("page.stockHistory.reference.opname"),
      return: t("page.stockHistory.reference.return")
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${map[type] || "bg-gray-100 text-gray-700"}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              {
                label: t("breadcrumb.home"),
                href:
                  role === "super_admin"
                    ? "/dashboard-super-admin"
                    : role === "admin"
                      ? "/dashboard-admin"
                      : "/home"
              },
              { label: t("breadcrumb.inventory") },
              { label: t("breadcrumb.stockHistory") }
            ]}
            title={t("page.stockHistory.title")}
            description={t("page.stockHistory.description")}
          />
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div>
          <div>
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            </Card>

            {isLoading ? (
              <Card className="overflow-hidden mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Skeleton className="h-3 w-24" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-3 w-20" />
                        </TableHead>
                        <TableHead className="text-right">
                          <Skeleton className="h-3 w-12 ml-auto" />
                        </TableHead>
                        <TableHead className="text-right">
                          <Skeleton className="h-3 w-16 ml-auto" />
                        </TableHead>
                        <TableHead className="text-right">
                          <Skeleton className="h-3 w-12 ml-auto" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-3 w-14" />
                        </TableHead>
                        <TableHead>
                          <Skeleton className="h-3 w-16" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(8)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-12 ml-auto" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-12 ml-auto" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-12 ml-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20 rounded" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ) : histories.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground mt-6">
                <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">{t("page.stockHistory.empty")}</p>
                <p className="text-sm mt-1">{t("page.stockHistory.emptyDetail")}</p>
              </Card>
            ) : (
              <Card className="overflow-hidden mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("page.stockHistory.table.time")}</TableHead>
                        <TableHead>{t("page.stockHistory.table.product")}</TableHead>
                        <TableHead className="text-right">
                          {t("page.stockHistory.table.before")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("page.stockHistory.table.change")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("page.stockHistory.table.after")}
                        </TableHead>
                        <TableHead>{t("page.stockHistory.table.type")}</TableHead>
                        <TableHead>{t("page.stockHistory.table.notes")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {histories.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(h.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {h.productData?.nameProduct || h.ingredientName || "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatNumber(h.quantityBefore)}
                          </TableCell>
                          <TableCell className="text-right">
                            {getChangeDisplay(h.quantityChange)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatNumber(h.quantityAfter)}
                          </TableCell>
                          <TableCell>{getReferenceBadge(h.referenceType)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {h.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {t("page.stockHistory.showing", {
                    count: Math.min(limit, histories.length),
                    total
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                          page === pageNum
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}>
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistory;
