import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Search, Eye, CheckCircle, XCircle, ClipboardList, Hourglass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import {
  getAllPurchaseReturn,
  approvePurchaseReturn,
  rejectPurchaseReturn
} from "@/services/purchase-return";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoStore from "@/components/ui/NoStore";
import StatCard from "@/components/ui/StatCard";
import { getAllLocation } from "@/services/location";
import StoreFilter from "@/components/ui/StoreFilter";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";
import { Skeleton } from "@/components/ui/skeleton";

const statusCfg = {
  pending: {
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  approved: {
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  rejected: {
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const PurchaseReturnList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/purchase-return";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);

  const { data: locData } = useQuery(["locations-purchase-return"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const locationParam = storeFilter !== "all" ? storeFilter : undefined;

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["purchase-returns", page, limit, search, storeFilter, statusFilter],
    () =>
      getAllPurchaseReturn({
        page,
        limit,
        search: search || undefined,
        store: locationParam,
        status: statusFilter !== "all" ? statusFilter : undefined
      })
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const approveMut = useMutation(approvePurchaseReturn, {
    onSuccess: () => {
      toast.success(t("page.purchaseReturn.list.toast.success"), {
        description: t("page.purchaseReturn.list.toast.approveDesc")
      });
      queryClient.invalidateQueries(["purchase-returns"]);
      setActionTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.purchaseReturn.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const rejectMut = useMutation(rejectPurchaseReturn, {
    onSuccess: () => {
      toast.success(t("page.purchaseReturn.list.toast.success"), {
        description: t("page.purchaseReturn.list.toast.rejectDesc")
      });
      queryClient.invalidateQueries(["purchase-returns"]);
      setActionTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.purchaseReturn.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const columns = [
    {
      header: t("page.purchaseReturn.list.header.returnNo"),
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">{item.returnNumber}</span>
      )
    },
    {
      header: t("page.purchaseReturn.list.header.store"),
      render: (item) => <span className="text-sm">{item.storeData?.name || "-"}</span>
    },
    {
      header: t("page.purchaseReturn.list.header.items"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.items?.length || 0}</span>
    },
    {
      header: t("page.purchaseReturn.list.header.reason"),
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
          {item.reason || "-"}
        </span>
      )
    },
    {
      header: t("page.purchaseReturn.list.header.returnedBy"),
      render: (item) => <span className="text-sm">{item.returnedBy?.name || "-"}</span>
    },
    {
      header: t("page.purchaseReturn.list.header.status"),
      align: "center",
      render: (item) => {
        const sc = statusCfg[item.status] || statusCfg.pending;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {t(`page.purchaseReturn.status.${item.status}`)}
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
      header: t("page.purchaseReturn.list.header.aksi"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/purchase-return/detail?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
          {item.status === "pending" && canAccess(user, MENU_KEY, "edit") && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-500"
                onClick={() => {
                  setActionTarget(item.id);
                  setActionType("approve");
                }}>
                <CheckCircle size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={() => {
                  setActionTarget(item.id);
                  setActionType("reject");
                }}>
                <XCircle size={15} />
              </Button>
            </>
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
            {t("page.purchaseReturn.list.breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.purchaseReturn.list.title")}</span>
        </nav>
      </div>
      <div>
        <div>
          <h1 className="text-2xl font-bold">{t("page.purchaseReturn.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.purchaseReturn.list.subtitle")}
          </p>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isFetching || isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label={t("page.purchaseReturn.list.title")}
                value={total}
                icon={ClipboardList}
                variant="default"
              />
              <StatCard
                label={t("page.purchaseReturn.status.approved")}
                value={data?.stats?.approved ?? 0}
                icon={CheckCircle}
                variant="active"
              />
              <StatCard
                label={t("page.purchaseReturn.status.pending")}
                value={data?.stats?.pending ?? 0}
                icon={Hourglass}
                variant="draft"
              />
              <StatCard
                label={t("page.purchaseReturn.status.rejected")}
                value={data?.stats?.rejected ?? 0}
                icon={XCircle}
                variant="inactive"
              />
            </div>
          )}

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div>
              <DataTable
                columns={columns}
                data={items}
                isLoading={isLoading || isFetching}
                emptyMessage={t("page.purchaseReturn.list.emptyMessage")}
                toolbar={
                  <div className="flex flex-wrap items-center gap-2">
                    {isSuperAdmin && (
                      <StoreFilter
                        locations={locData?.data || []}
                        value={storeFilter}
                        onChange={(v) => {
                          setGlobalStoreFilter(v);
                          setPage(1);
                        }}
                        isSuperAdmin={isSuperAdmin}
                        t={t}
                      />
                    )}
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="all">{t("page.purchaseReturn.list.filter.allStatus")}</option>
                      {Object.keys(statusCfg).map((k) => (
                        <option key={k} value={k}>
                          {t(`page.purchaseReturn.status.${k}`)}
                        </option>
                      ))}
                    </select>
                    <div className="relative w-full sm:w-64">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder={t("page.purchaseReturn.list.placeholder.search")}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
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
          )}

          <Modal
            type="confirm"
            open={!!actionTarget}
            onOpenChange={(o) => !o && setActionTarget(null)}
            title={
              actionType === "approve"
                ? t("page.purchaseReturn.list.modal.approveTitle")
                : t("page.purchaseReturn.list.modal.rejectTitle")
            }
            description={
              actionType === "approve"
                ? t("page.purchaseReturn.list.modal.approveDesc")
                : t("page.purchaseReturn.list.modal.rejectDesc")
            }
            confirmText={
              actionType === "approve"
                ? t("page.purchaseReturn.list.modal.approveConfirm")
                : t("page.purchaseReturn.list.modal.rejectConfirm")
            }
            confirmVariant={actionType === "approve" ? "default" : "destructive"}
            onConfirm={() => {
              if (actionType === "approve") approveMut.mutate(actionTarget);
              else rejectMut.mutate(actionTarget);
            }}
          />
        </>
      )}
    </div>
  );
};

export default PurchaseReturnList;
