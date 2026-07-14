import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
  FileDown,
  ClipboardList,
  X,
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { getStockOpname, deleteStockOpname, exportStockOpnameByIds } from "@/services/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";

const StockOpnameList = () => {
  const { t } = useTranslation();

  const statusColors = {
    completed: {
      bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
      dot: "bg-green-500",
      label: t("page.stockOpname.status.completed")
    },
    draft: {
      bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
      dot: "bg-yellow-500",
      label: t("page.stockOpname.status.draft")
    },
    cancelled: {
      bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
      dot: "bg-red-500",
      label: t("page.stockOpname.status.cancelled")
    }
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/stock-opname";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noDataModal, setNoDataModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: locData, isLoading: isLoadingLocations } = useQuery(
    ["locations-stock-opname"],
    () => getAllLocation("active"),
    { enabled: isSuperAdmin }
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["stockOpname", page, limit, search, warehouseFilter, statusFilter],
    () =>
      getStockOpname({
        page,
        limit,
        search: search || undefined,
        location: warehouseFilter !== "all" ? warehouseFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      })
  );

  const items = data?.data || data?.stockOpname || [];
  const total = data?.pagination?.total || data?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  useEffect(() => {
    setSelectedItems([]);
  }, [page, search, warehouseFilter, statusFilter]);

  // Remove completed items from selection
  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => {
        const item = items.find((it) => (it.id || it._id) === id);
        return item && item.status !== "completed";
      })
    );
  }, [items]);

  const handleExportSelected = useCallback(() => {
    exportStockOpnameByIds(selectedItems)
      .then(() => {
        toast.success(t("common.success"), {
          description: t("page.stockOpname.list.exportSuccess", { count: selectedItems.length })
        });
        setSelectedItems([]);
      })
      .catch((err) => {
        toast.error(t("common.failed"), {
          description:
            err?.response?.data?.message || err.message || t("page.stockOpname.list.exportFailed")
        });
      });
  }, [selectedItems]);

  const deleteMutation = useMutation(deleteStockOpname, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.stockOpname.list.deleteSuccess") });
      queryClient.invalidateQueries(["stockOpname"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const toastIdRef = React.useRef(null);

  useEffect(() => {
    if (selectedItems.length > 0) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast(
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {t("page.stockOpname.list.exportTitle")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("page.stockOpname.list.exportSelected", { count: selectedItems.length })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canAccess(user, MENU_KEY, "export") && (
              <button
                onClick={handleExportSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <FileDown size={14} />
                {t("page.stockOpname.list.export")}
              </button>
            )}
            <button
              onClick={() => {
                setSelectedItems([]);
                if (toastIdRef.current) {
                  toast.dismiss(toastIdRef.current);
                  toastIdRef.current = null;
                }
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>,
        { duration: Infinity, position: "bottom-center" }
      );
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [selectedItems, handleExportSelected]);

  const columns = [
    {
      header: t("page.stockOpname.list.columns.auditDate"),
      align: "center",
      render: (item) => (
        <span className="font-mono text-xs text-foreground">{item.auditDate || "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.auditId"),
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-primary">{item.opnameNumber || "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.warehouse"),
      align: "center",
      render: (item) => (
        <span className="text-sm font-medium text-foreground">{item.store?.name || "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.auditor"),
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px] font-bold">
            {item.auditor
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2) || "NA"}
          </div>
          <span className="text-sm text-foreground">{item.auditor || "-"}</span>
        </div>
      )
    },
    {
      header: t("page.stockOpname.list.columns.totalItems"),
      align: "center",
      render: (item) => (
        <span className="text-sm font-mono text-foreground">{item.stats?.totalItems ?? "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.status"),
      align: "center",
      render: (item) => {
        const status = item.status || "draft";
        const statusStyle = statusColors[status] || statusColors.draft;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`} />
            {statusStyle.label}
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
      header: t("page.stockOpname.list.columns.actions"),
      align: "right",
      render: (item) => {
        const isDraft = item.status === "draft";
        return (
          <div className="flex items-center justify-end gap-1">
            {canAccess(user, MENU_KEY, "view") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => navigate(`/stock-opname/detail?id=${item.id || item._id}`)}>
                <Eye size={15} />
              </Button>
            )}
            {isDraft && (
              <>
                {canAccess(user, MENU_KEY, "edit") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => navigate(`/add-stock-opname?id=${item.id || item._id}`)}>
                    <Edit size={15} />
                  </Button>
                )}
                {canAccess(user, MENU_KEY, "delete") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget(item.id || item._id)}>
                    <Trash2 size={15} />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.stockOpname.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.stockOpname.list.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.stockOpname.list.description")}
            </p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-stock-opname")} className="shrink-0 gap-2">
              <Plus size={16} />
              {t("page.stockOpname.list.addButton")}
            </Button>
          )}
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isFetching || isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={t("page.stockOpname.stats.totalAudit")}
                value={data?.stats?.total ?? total ?? 0}
                icon={ClipboardCheck}
                variant="default"
                subtitle={t("page.stockOpname.stats.trend")}
              />
              <StatCard
                label={t("page.stockOpname.status.completed")}
                value={data?.stats?.completed ?? 0}
                icon={CheckCircle}
                variant="active"
                subtitle={t("page.stockOpname.stats.completedSub")}
              />
              <StatCard
                label={t("page.stockOpname.status.draft")}
                value={data?.stats?.draft ?? 0}
                icon={AlertTriangle}
                variant="draft"
                subtitle={t("page.stockOpname.stats.draftSub")}
              />
              <StatCard
                label={t("page.stockOpname.status.cancelled")}
                value={data?.stats?.cancelled ?? 0}
                icon={XCircle}
                variant="inactive"
                subtitle={t("page.stockOpname.stats.cancelledSub")}
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
                emptyMessage={t("page.stockOpname.list.empty")}
                emptyIcon={ClipboardList}
                selectable
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
                isSelectable={(row) => row.status !== "completed"}
                rowClassName={(row) => {
                  const status = row.status || "draft";
                  const classes = [];
                  if (selectedItems.includes(row.id || row._id)) classes.push("bg-primary/5");
                  if (status === "completed") classes.push("bg-green-50/50 dark:bg-green-950/10");
                  if (status === "cancelled") classes.push("bg-red-50/50 dark:bg-red-950/10");
                  return classes.join(" ");
                }}
                toolbar={
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full">
                    {isLoadingLocations ? (
                      <>
                        <Skeleton className="h-6 w-32" />
                        <div className="flex flex-wrap items-center gap-2">
                          <Skeleton className="h-9 w-48 rounded-md" />
                          <Skeleton className="h-9 w-36 rounded-md" />
                          <Skeleton className="h-9 w-64 rounded-md" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                          <h4 className="text-base font-semibold text-foreground shrink-0">
                            {t("page.stockOpname.list.title")}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-9 lg:hidden"
                            onClick={() => setShowFilters(!showFilters)}>
                            <span className="material-symbols-outlined text-base">filter_list</span>
                            {showFilters ? "Tutup" : "Filter"}
                          </Button>
                        </div>
                        <div
                          className={`${showFilters ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            {isSuperAdmin && (
                              <div className="relative">
                                <select
                                  value={warehouseFilter}
                                  onChange={(e) => {
                                    setWarehouseFilter(e.target.value);
                                    setPage(1);
                                  }}
                                  className="h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                                  <option value="all">{t("page.stockOpname.list.allWarehouse")}</option>
                                  {(locData?.data || []).map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                      {loc.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronLeft
                                  size={14}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90"
                                />
                              </div>
                            )}
                            <div className="relative">
                              <select
                                value={statusFilter}
                                onChange={(e) => {
                                  setStatusFilter(e.target.value);
                                  setPage(1);
                                }}
                                className="h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                                <option value="all">{t("page.stockOpname.list.allStatus")}</option>
                                <option value="draft">{t("page.stockOpname.status.draft")}</option>
                                <option value="completed">
                                  {t("page.stockOpname.status.completed")}
                                </option>
                                <option value="cancelled">
                                  {t("page.stockOpname.status.cancelled")}
                                </option>
                              </select>
                              <ChevronLeft
                                size={14}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90"
                              />
                            </div>
                          </div>
                          <div className="relative flex-1 md:w-64">
                            <Search
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                              placeholder={t("page.stockOpname.list.searchPlaceholder")}
                              value={search}
                              onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                              }}
                              className="pl-9 h-9 text-sm"
                            />
                          </div>
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
          )}

          <Modal
            type="confirm"
            open={noDataModal}
            onOpenChange={setNoDataModal}
            title={t("page.stockOpname.list.noDataTitle")}
            description={t("page.stockOpname.list.noDataDesc")}
            confirmText={t("page.stockOpname.list.addButton")}
            onConfirm={() => navigate("/add-stock-opname")}
          />

          <Modal
            type="confirm"
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title={t("page.stockOpname.modal.deleteTitle")}
            description={t("page.stockOpname.modal.deleteDesc")}
            confirmText={t("page.stockOpname.modal.deleteConfirm")}
            loading={deleteMutation.isLoading}
            onConfirm={confirmDelete}
          />
          {deleteMutation.isLoading && (
            <Loading fullscreen size="lg" label={t("common.loadingData")} />
          )}
        </>
      )}
    </div>
  );
};

export default StockOpnameList;
