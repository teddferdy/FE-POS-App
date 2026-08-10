import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  Check,
  Ban
} from "lucide-react";
import { canAccess } from "@/utils/permission";
import {
  getAllGoodsRequest,
  deleteGoodsRequest,
  changeGoodsRequestStatus
} from "@/services/goods-request";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import TableToolbar from "@/components/ui/TableToolbar";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import { Combobox } from "@/components/ui/combobox";
import * as XLSX from "xlsx";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";

const statusMap = {
  pending: {
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  approved: {
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  rejected: {
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  },
  cancelled: {
    class: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400"
  }
};

const GoodsRequestList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/goods-request";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const isFiltered = storeFilter !== "all" || statusFilter !== "all" || search !== "";

  const resetFilters = () => {
    setGlobalStoreFilter("all");
    setStatusFilter("all");
    setSearch("");
    setPage(1);
  };
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locData } = useQuery(["locations-goods-request"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["goods-requests", page, limit, search, statusFilter, storeFilter],
    () =>
      getAllGoodsRequest({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        store: storeFilter !== "all" ? storeFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const stats = data?.stats || {};

  const deleteMutation = useMutation(deleteGoodsRequest, {
    onSuccess: () => {
      toast.success(t("page.goodsRequest.list.toast.deleteSuccess"), {
        description: t("page.goodsRequest.list.toast.deleteSuccessDesc")
      });
      queryClient.invalidateQueries(["goods-requests"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.goodsRequest.list.toast.deleteError"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const statusMutation = useMutation(({ id, status }) => changeGoodsRequestStatus(id, status), {
    onSuccess: (res) => {
      const isApproved = res?.data?.status === "approved" || res?.data?.status === "approved";
      toast.success(
        t(
          isApproved
            ? "page.goodsRequest.list.toast.approveSuccess"
            : "page.goodsRequest.list.toast.rejectSuccess"
        ),
        {
          description: t(
            isApproved
              ? "page.goodsRequest.list.toast.approveSuccessDesc"
              : "page.goodsRequest.list.toast.rejectSuccessDesc"
          )
        }
      );
      queryClient.invalidateQueries(["goods-requests"]);
      queryClient.invalidateQueries(["purchase-orders"]);
      setApproveTarget(null);
      setRejectTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.goodsRequest.list.toast.statusError"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const columns = [
    {
      header: t("page.goodsRequest.list.table.requestNumber"),
      stickyLeft: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">
          {item.requestNumber || "-"}
        </span>
      )
    },
    {
      header: t("page.goodsRequest.list.table.requestedBy"),
      render: (item) => <span className="text-sm">{item.requestedBy || "-"}</span>
    },
    {
      header: t("page.goodsRequest.list.table.itemCount"),
      align: "center",
      render: (item) => (
        <span className="font-mono text-sm">
          {item.totalItems || item.items?.length || 0} items
        </span>
      )
    },
    {
      header: t("page.goodsRequest.list.table.totalQty"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.totalQty || 0}</span>
    },
    {
      header: t("page.goodsRequest.list.table.store"),
      render: (item) => <span className="text-sm">{item.store?.name || "-"}</span>
    },
    {
      header: t("page.goodsRequest.list.table.poReference"),
      render: (item) =>
        item.purchaseOrderData?.orderNumber ? (
          <button
            onClick={() => navigate(`/purchase-order/detail?id=${item.purchaseOrderData.id}`)}
            className="font-mono text-xs text-blue-600 hover:underline">
            {item.purchaseOrderData.orderNumber}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
    },
    {
      header: t("page.goodsRequest.list.table.status"),
      align: "center",
      render: (item) => {
        const sc = statusMap[item.status] || statusMap.pending;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {t(`page.goodsRequest.list.status.${item.status || "pending"}`)}
          </span>
        );
      }
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
      header: t("page.goodsRequest.list.table.actions"),
      align: "right",
      stickyRight: true,
      legend: [
        { icon: Eye, label: t("common.view") },
        { icon: Check, label: t("page.goodsRequest.list.approve") },
        { icon: Ban, label: t("page.goodsRequest.list.reject") },
        { icon: Edit, label: t("page.goodsRequest.list.editTitle") },
        { icon: Trash2, label: t("common.delete") }
      ],
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/goods-request/detail?id=${item.id}`)}>
              <Eye size={18} />
            </Button>
          )}
          {item.status === "pending" && (
            <>
              {canAccess(user, MENU_KEY, "update") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600"
                  onClick={() => setApproveTarget(item.id)}
                  title={t("page.goodsRequest.list.approve")}>
                  <Check size={18} />
                </Button>
              )}
              {canAccess(user, MENU_KEY, "delete") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600"
                  onClick={() => setRejectTarget(item.id)}
                  title={t("page.goodsRequest.list.reject")}>
                  <Ban size={18} />
                </Button>
              )}
              {canAccess(user, MENU_KEY, "update") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600"
                  onClick={() => navigate(`/edit-goods-request?id=${item.id}`)}
                  title={t("page.goodsRequest.list.editTitle")}>
                  <Edit size={18} />
                </Button>
              )}
              {canAccess(user, MENU_KEY, "delete") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteTarget(item.id)}>
                  <Trash2 size={18} />
                </Button>
              )}
            </>
          )}
          {item.status === "approved" && item.purchaseOrderData && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600"
              onClick={() => navigate(`/purchase-order/detail?id=${item.purchaseOrderData.id}`)}
              title={t("page.goodsRequest.list.viewPO")}>
              <ShoppingCart size={18} />
            </Button>
          )}
        </div>
      )
    }
  ];

  const exportData = () => {
    setExportLoading(true);
    try {
      const xlsData = items.map((r, i) => ({
        [t("page.goodsRequest.list.export.no")]: i + 1,
        [t("page.goodsRequest.list.export.requestNumber")]: r.requestNumber || "",
        [t("page.goodsRequest.list.export.requestedBy")]: r.requestedBy || "",
        [t("page.goodsRequest.list.export.store")]: r.store?.name || "",
        [t("page.goodsRequest.list.export.status")]: r.status || "",
        [t("page.goodsRequest.list.export.itemCount")]: r.totalItems || 0,
        [t("page.goodsRequest.list.export.totalQty")]: r.totalQty || 0,
        [t("page.goodsRequest.list.export.createdAt")]: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("id")
          : ""
      }));
      const ws = XLSX.utils.json_to_sheet(xlsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t("page.goodsRequest.list.export.sheetName"));
      XLSX.writeFile(wb, `goods-request-${Date.now()}.xlsx`);
      toast.success(t("page.goodsRequest.list.toast.exportSuccess"), {
        description: t("page.goodsRequest.list.toast.exportSuccessDesc")
      });
    } catch (err) {
      toast.error(t("page.goodsRequest.list.toast.exportError"), {
        description: err?.message
      });
    } finally {
      setExportLoading(false);
    }
  };

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
          <span className="text-primary font-semibold">{t("breadcrumb.goodsRequest")}</span>
        </nav>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.goodsRequest.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.goodsRequest.list.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canAccess(user, MENU_KEY, "export") && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={exportLoading}
              className="gap-1.5">
              <Download size={14} />
              {exportLoading ? "..." : t("common.export")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-goods-request")} className="shrink-0 gap-2">
              <Plus size={16} /> {t("page.goodsRequest.list.addButton")}
            </Button>
          )}
        </div>
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
                label={t("page.goodsRequest.list.stats.total")}
                value={stats.total ?? total}
                icon={ClipboardList}
                variant="default"
              />
              <StatCard
                label={t("page.goodsRequest.list.status.pending")}
                value={stats.pending ?? 0}
                icon={Clock}
                variant="draft"
              />
              <StatCard
                label={t("page.goodsRequest.list.status.approved")}
                value={stats.approved ?? 0}
                icon={CheckCircle}
                variant="active"
              />
              <StatCard
                label={t("page.goodsRequest.list.status.rejected")}
                value={stats.rejected ?? 0}
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
                  emptyMessage={t("page.goodsRequest.list.empty")}
                  emptyIcon={FileText}
                  toolbar={
                    <TableToolbar
                      title={t("page.goodsRequest.list.title")}
                      onReset={resetFilters}
                      isFiltered={isFiltered}>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Cari
                        </label>
                        <SearchInput
                          value={search}
                          onChange={(val) => {
                            setSearch(val);
                            setPage(1);
                          }}
                          placeholder={t("page.goodsRequest.list.searchPlaceholder")}
                          isLoading={isFetching}
                        />
                      </div>
                      {isSuperAdmin && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Store
                          </label>
                          <Combobox
                            options={[
                              {
                                value: "all",
                                label: t("page.goodsRequest.list.filter.allStores")
                              },
                              ...(locData?.data || []).map((loc) => ({
                                value: loc.id,
                                label: loc.name
                              }))
                            ]}
                            value={storeFilter}
                            onChange={(val) => {
                              setGlobalStoreFilter(val);
                              setPage(1);
                            }}
                            placeholder={t("page.goodsRequest.list.filter.allStores")}
                            searchPlaceholder={t("common.search")}
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("common.status")}
                        </label>
                        <Combobox
                          options={[
                            {
                              value: "all",
                              label: t("page.goodsRequest.list.filter.allStatuses")
                            },
                            ...Object.keys(statusMap).map((k) => ({
                              value: k,
                              label: t(`page.goodsRequest.list.status.${k}`)
                            }))
                          ]}
                          value={statusFilter}
                          onChange={(val) => {
                            setStatusFilter(val);
                            setPage(1);
                          }}
                          placeholder={t("page.goodsRequest.list.filter.allStatuses")}
                          searchPlaceholder={t("common.search")}
                        />
                      </div>
                    </TableToolbar>
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
                title={t("page.goodsRequest.list.modal.deleteTitle")}
                description={t("page.goodsRequest.list.modal.deleteDescription")}
                confirmText={t("page.goodsRequest.list.modal.confirmDelete")}
                loading={deleteMutation.isLoading}
                onConfirm={() => deleteMutation.mutate(deleteTarget)}
              />
              <Modal
                type="confirm"
                open={!!approveTarget}
                onOpenChange={(o) => !o && setApproveTarget(null)}
                title={t("page.goodsRequest.list.modal.approveTitle")}
                description={t("page.goodsRequest.list.modal.approveDescription")}
                confirmText={t("page.goodsRequest.list.modal.confirmApprove")}
                loading={statusMutation.isLoading}
                onConfirm={() => statusMutation.mutate({ id: approveTarget, status: "approved" })}
              />
              <Modal
                type="confirm"
                open={!!rejectTarget}
                onOpenChange={(o) => !o && setRejectTarget(null)}
                title={t("page.goodsRequest.list.modal.rejectTitle")}
                description={t("page.goodsRequest.list.modal.rejectDescription")}
                confirmText={t("page.goodsRequest.list.modal.confirmReject")}
                loading={statusMutation.isLoading}
                onConfirm={() => statusMutation.mutate({ id: rejectTarget, status: "rejected" })}
              />
              {(deleteMutation.isLoading || statusMutation.isLoading) && (
                <Loading fullscreen size="lg" label={t("common.loadingData")} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GoodsRequestList;
