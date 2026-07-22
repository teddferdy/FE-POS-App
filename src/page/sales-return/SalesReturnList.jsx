import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import { getAllSalesReturn, approveSalesReturn, rejectSalesReturn } from "@/services/sales-return";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import NoStore from "@/components/ui/NoStore";
import DataTable from "@/components/ui/DataTable";
import { getAllLocation } from "@/services/location";
import StoreFilter from "@/components/ui/StoreFilter";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const statusCfg = {
  pending: {
    label: "Pending",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  approved: {
    label: "Approved",
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  rejected: {
    label: "Rejected",
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const SalesReturnList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/sales-return";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-sales-return"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const locationParam = storeFilter !== "all" ? storeFilter : undefined;

  const { data, isLoading, isError, refetch } = useQuery(
    ["sales-returns", page, limit, search, storeFilter, statusFilter],
    () =>
      getAllSalesReturn({
        page,
        limit,
        search: search || undefined,
        store: locationParam,
        status: statusFilter !== "all" ? statusFilter : undefined
      , { keepPreviousData: true }
      })
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const approveMut = useMutation(approveSalesReturn, {
    onSuccess: () => {
      toast.success(t("page.salesReturn.list.toast.success"), {
        description: t("page.salesReturn.list.toast.approveDesc")
      });
      queryClient.invalidateQueries(["sales-returns"]);
      setActionTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.salesReturn.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const rejectMut = useMutation(rejectSalesReturn, {
    onSuccess: () => {
      toast.success(t("page.salesReturn.list.toast.success"), {
        description: t("page.salesReturn.list.toast.rejectDesc")
      });
      queryClient.invalidateQueries(["sales-returns"]);
      setActionTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.salesReturn.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const columns = [
    {
      header: t("page.salesReturn.list.header.returnNo"),
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">{item.returnNumber}</span>
      )
    },
    {
      header: t("page.salesReturn.list.header.store"),
      render: (item) => <span className="text-sm">{item.storeData?.name || "-"}</span>
    },
    {
      header: t("page.salesReturn.list.header.items"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.items?.length || 0}</span>
    },
    {
      header: t("page.salesReturn.list.header.reason"),
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
          {item.reason || "-"}
        </span>
      )
    },
    {
      header: t("page.salesReturn.list.header.returnedBy"),
      render: (item) => (
        <span className="text-sm">{item.returnedBy || item.returnedByData?.name || "-"}</span>
      )
    },
    {
      header: t("page.salesReturn.list.header.status"),
      align: "center",
      render: (item) => {
        const sc = statusCfg[item.status] || statusCfg.pending;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {sc.label}
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
      header: t("page.salesReturn.list.header.aksi"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/sales-return/detail?id=${item.id}`)}>
            <Eye size={18} />
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
                <CheckCircle size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={() => {
                  setActionTarget(item.id);
                  setActionType("reject");
                }}>
                <XCircle size={18} />
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
            {t("page.salesReturn.list.breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.salesReturn.list.title")}</span>
        </nav>
      </div>
      <div>
        <div>
          <h1 className="text-2xl font-bold">{t("page.salesReturn.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.salesReturn.list.subtitle")}
          </p>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div>
              <DataTable
                columns={columns}
                data={items}
                isLoading={isLoading}
                emptyMessage={t("page.salesReturn.list.emptyMessage")}
                toolbar={
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    <>
                      <h4 className="text-base font-semibold text-foreground">
                        {t("page.salesReturn.list.title")}
                      </h4>
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
                          <option value="all">{t("page.salesReturn.list.filter.allStatus")}</option>
                          {Object.entries(statusCfg).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                        <SearchInput
                          value={search}
                          onChange={(val) => {
                            setSearch(val);
                            setPage(1);
                          }}
                          placeholder={t("page.salesReturn.list.placeholder.search")}
                          isLoading={isLoading}
                        />
                      </div>
                    </>
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
                ? t("page.salesReturn.list.modal.approveTitle")
                : t("page.salesReturn.list.modal.rejectTitle")
            }
            description={
              actionType === "approve"
                ? t("page.salesReturn.list.modal.approveDesc")
                : t("page.salesReturn.list.modal.rejectDesc")
            }
            confirmText={
              actionType === "approve"
                ? t("page.salesReturn.list.modal.approveConfirm")
                : t("page.salesReturn.list.modal.rejectConfirm")
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

export default SalesReturnList;
