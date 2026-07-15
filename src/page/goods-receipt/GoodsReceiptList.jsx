import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Trash2, FileText, Download, Package, CheckCircle, FileEdit, XCircle } from "lucide-react";
import { canAccess } from "@/utils/permission";
import {
  getAllGoodsReceipt,
  deleteGoodsReceipt,
  exportGoodsReceipt
} from "@/services/goods-receipt";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import * as XLSX from "xlsx";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";

const statusMap = {
  draft: {
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  completed: {
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  cancelled: {
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const GoodsReceiptList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/goods-receipt";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-goods-receipt"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["goods-receipts", page, limit, search, statusFilter, storeFilter],
    () =>
      getAllGoodsReceipt({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        store: storeFilter !== "all" ? storeFilter : undefined
      }),
    { }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const stats = data?.stats || {};

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const result = await exportGoodsReceipt({
        status: statusFilter !== "all" ? statusFilter : undefined,
        store: storeFilter !== "all" ? storeFilter : undefined
      });
      const rows = result?.data || [];
      const xlsData = rows.map((r, i) => ({
        [t("page.goodsReceipt.list.export.no")]: i + 1,
        [t("page.goodsReceipt.list.export.receiptNumber")]: r.receiptNumber || "",
        [t("page.goodsReceipt.list.export.poReference")]: r.purchaseOrderData?.orderNumber || "",
        [t("page.goodsReceipt.list.export.receivedDate")]: r.receivedDate
          ? new Date(r.receivedDate).toLocaleDateString("id")
          : "",
        [t("page.goodsReceipt.list.export.store")]: r.storeData?.name || "",
        [t("page.goodsReceipt.list.export.status")]: r.status || "",
        [t("page.goodsReceipt.list.export.itemCount")]: r.items?.length || 0
      }));
      const ws = XLSX.utils.json_to_sheet(xlsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t("page.goodsReceipt.list.export.sheetName"));
      XLSX.writeFile(wb, `goods-receipt-${Date.now()}.xlsx`);
      toast.success(t("page.goodsReceipt.list.toast.exportSuccess"), {
        description: t("page.goodsReceipt.list.toast.exportSuccessDesc")
      });
    } catch (err) {
      toast.error(t("page.goodsReceipt.list.toast.exportError"), {
        description: err?.response?.data?.message || err.message
      });
    } finally {
      setExportLoading(false);
    }
  };

  const deleteMutation = useMutation(deleteGoodsReceipt, {
    onSuccess: () => {
      toast.success(t("page.goodsReceipt.list.toast.deleteSuccess"), {
        description: t("page.goodsReceipt.list.toast.deleteSuccessDesc")
      });
      queryClient.invalidateQueries(["goods-receipts"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.goodsReceipt.list.toast.deleteError"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const columns = [
    {
      header: t("page.goodsReceipt.list.table.receiptNumber"),
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">
          {item.receiptNumber || "-"}
        </span>
      )
    },
    {
      header: t("page.goodsReceipt.list.table.poReference"),
      render: (item) => (
        <span className="text-xs">{item.purchaseOrderData?.orderNumber || "-"}</span>
      )
    },
    {
      header: t("page.goodsReceipt.list.table.receivedDate"),
      align: "center",
      render: (item) => (
        <span className="text-xs">
          {item.receivedDate ? new Date(item.receivedDate).toLocaleDateString("id") : "-"}
        </span>
      )
    },
    {
      header: t("page.goodsReceipt.list.table.itemCount"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.items?.length || 0}</span>
    },
    {
      header: t("page.goodsReceipt.list.table.store"),
      render: (item) => <span className="text-sm">{item.storeData?.name || "-"}</span>
    },
    {
      header: t("page.goodsReceipt.list.table.status"),
      align: "center",
      render: (item) => {
        const sc = statusMap[item.status] || statusMap.draft;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {t(`page.goodsReceipt.list.status.${item.status || "draft"}`)}
          </span>
        );
      }
    },
    {
      header: t("common.createdBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdByUser?.fullName || item.createdByUser?.userName || item.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.createdAt"),
      render: (item) => {
        if (!item.createdAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(item.createdAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
    },
    {
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("common.updatedAt"),
      render: (item) => {
        if (!item.updatedAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(item.updatedAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
    },
    {
      header: t("page.goodsReceipt.list.table.actions"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/goods-receipt/detail?id=${item.id}`)}>
              <Eye size={18} />
            </Button>
          )}
          {item.status === "draft" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600"
              onClick={() => navigate(`/edit-goods-receipt?id=${item.id}`)}
              title={t("page.goodsReceipt.list.editTitle")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Button>
          )}
          {item.status === "draft" && canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item.id)}>
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.goodsReceipt")}</span>
        </nav>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.goodsReceipt.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.goodsReceipt.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-goods-receipt")} className="shrink-0 gap-2">
            <Plus size={16} /> {t("page.goodsReceipt.list.addButton")}
          </Button>
        )}
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isFetching || isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label={t("page.goodsReceipt.list.stats.total")}
                value={stats.total ?? total}
                icon={Package}
                variant="default"
              />
              <StatCard
                label={t("page.goodsReceipt.list.status.completed")}
                value={stats.completed ?? 0}
                icon={CheckCircle}
                variant="active"
              />
              <StatCard
                label={t("page.goodsReceipt.list.status.draft")}
                value={stats.draft ?? 0}
                icon={FileEdit}
                variant="draft"
              />
              <StatCard
                label={t("page.goodsReceipt.list.status.cancelled")}
                value={stats.cancelled ?? 0}
                icon={XCircle}
                variant="red"
              />
            </div>
          )}

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <>
              <div>
                <DataTable
                  columns={columns}
                  data={items}
                  isLoading={isLoading || isFetching}
                  emptyMessage={t("page.goodsReceipt.list.empty")}
                  emptyIcon={FileText}
                  toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                      {isLoadingLocations || isLoading || isFetching ? (
                        <>
                          <Skeleton className="h-6 w-32" />
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-48 rounded-md" />
                            <Skeleton className="h-9 w-32 rounded-md" />
                            <Skeleton className="h-9 w-64 rounded-md" />
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="text-base font-semibold text-foreground">
                            {t("page.goodsReceipt.list.title")}
                          </h4>
                          <div className="flex items-center gap-3">
                            {isSuperAdmin && (
                              <select
                                value={storeFilter}
                                onChange={(e) => {
                                  setGlobalStoreFilter(e.target.value);
                                  setPage(1);
                                }}
                                className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                                <option value="all">
                                  {t("page.goodsReceipt.list.filter.allStores")}
                                </option>
                                {(locData?.data || []).map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <select
                              value={statusFilter}
                              onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                              }}
                              className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                              <option value="all">
                                {t("page.goodsReceipt.list.filter.allStatuses")}
                              </option>
                              {Object.keys(statusMap).map((k) => (
                                <option key={k} value={k}>
                                  {t(`page.goodsReceipt.list.status.${k}`)}
                                </option>
                              ))}
                            </select>
                            <SearchInput
                              value={search}
                              onChange={(val) => {
                                setSearch(val);
                                setPage(1);
                              }}
                              placeholder={t("page.goodsReceipt.list.searchPlaceholder")}
                              isLoading={isFetching}
                              resultCount={total}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleExport}
                              disabled={exportLoading}
                              className="gap-1.5">
                              <Download size={14} />
                              {exportLoading ? "..." : t("common.export")}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  }
                  pagination={{
                    page,
                    totalPages,
                    total,
                    onPageChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (v) => {
                      setLimit(v);
                      setPage(1);
                    }
                  }}
                />
              </div>

              <Modal
                type="confirm"
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                title={t("page.goodsReceipt.list.modal.deleteTitle")}
                description={t("page.goodsReceipt.list.modal.deleteDescription")}
                confirmText={t("page.goodsReceipt.list.modal.confirmDelete")}
                loading={deleteMutation.isLoading}
                onConfirm={() => deleteMutation.mutate(deleteTarget)}
              />
              {deleteMutation.isLoading && (
                <Loading fullscreen size="lg" label={t("common.loadingData")} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GoodsReceiptList;
