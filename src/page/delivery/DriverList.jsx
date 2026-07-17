import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import {
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Truck,
  Bike,
  Car,
  FileEdit
} from "lucide-react";
import { toast } from "sonner";
import { getDrivers, deleteDriver } from "@/services/delivery";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import StoreFilter from "@/components/ui/StoreFilter";
import Modal from "@/components/organism/modal";
import { canAccess } from "@/utils/permission";

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

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "busy", label: "Busy" },
  { value: "offline", label: "Offline" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" }
];

const statusBadge = (status) => {
  const map = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    busy: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
    offline: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800",
    inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const vehicleIcon = (type) => {
  if (!type) return <Truck size={14} />;
  const lower = type.toLowerCase();
  if (lower.includes("motor") || lower.includes("bike")) return <Bike size={14} />;
  if (lower.includes("mobil") || lower.includes("car")) return <Car size={14} />;
  return <Truck size={14} />;
};

const DriverList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();

  const user = cookie?.user;
  const MENU_KEY = "/driver-list";

  const { data, isLoading, isFetching } = useQuery(
    ["drivers", page, limit, storeFilter, search, statusFilter],
    () =>
      getDrivers({
        store: storeFilter === "all" ? "" : storeFilter,
        page,
        limit,
        search,
        status: statusFilter
      }),
    { retry: 1 }
  );

  const deleteMutation = useMutation(deleteDriver, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.delivery.driver.toast.deleteSuccess")
      });
      queryClient.invalidateQueries(["drivers"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || t("page.delivery.driver.toast.deleteFailed")
      });
    }
  });

  const drivers = data?.data || [];
  const stats = data?.stats || { total: 0, active: 0, busy: 0, offline: 0, inactive: 0, draft: 0 };

  const columns = [
    {
      header: t("page.delivery.driver.detail.name"),
      render: (driver) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {driver.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{driver.name}</p>
            <p className="text-xs text-muted-foreground">{driver.phone || "-"}</p>
          </div>
        </div>
      )
    },
    {
      header: t("page.delivery.driver.detail.vehicleType"),
      render: (driver) => (
        <div className="flex items-center gap-2">
          {vehicleIcon(driver.vehicleType)}
          <span className="text-sm text-foreground">{driver.vehicleType || "-"}</span>
        </div>
      )
    },
    {
      header: t("page.delivery.driver.detail.vehiclePlate"),
      render: (driver) => (
        <span className="text-sm font-mono text-foreground">{driver.vehiclePlate || "-"}</span>
      )
    },
    {
      header: t("page.delivery.driver.detail.status"),
      render: (driver) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusBadge(driver.status)}`}>
          {t(`page.delivery.driver.status.${driver.status}`)}
        </span>
      )
    },
    {
      header: t("common.createdBy"),
      render: (driver) => (
        <span className="text-sm text-muted-foreground">
          {driver.createdByUser?.fullName ||
            driver.createdByUser?.userName ||
            driver.createdBy ||
            "-"}
        </span>
      )
    },
    {
      header: t("page.department.table.createdDate"),
      render: (driver) => (
        <span className="text-sm font-mono text-muted-foreground">
          {formatDate(driver.createdAt)}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (driver) => (
        <span className="text-sm text-muted-foreground">
          {driver.modifiedByUser?.fullName ||
            driver.modifiedByUser?.userName ||
            driver.modifiedBy ||
            "-"}
        </span>
      )
    },
    {
      header: t("page.department.table.updatedDate"),
      render: (driver) => (
        <span className="text-sm font-mono text-muted-foreground">
          {formatDate(driver.updatedAt)}
        </span>
      )
    },
    {
      header: "",
      align: "right",
      stickyRight: true,
      render: (driver) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/detail-driver?id=${driver.id}`)}>
              <Eye size={18} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-driver?id=${driver.id}`)}>
              <Edit size={18} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(driver)}>
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          { i18nKey: "sidebar.driver" }
        ]}
        title={t("page.delivery.driver.list.title")}
        description={t("page.delivery.driver.list.description")}>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-driver")}>
            <Plus size={16} className="mr-1" />
            {t("page.delivery.driver.add.title")}
          </Button>
        )}
      </PageHeader>

      {isFetching || isLoading ? (
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={t("page.delivery.driver.stats.total")}
            value={stats.total}
            icon={Users}
            variant="default"
          />
          <StatCard
            label={t("page.delivery.driver.stats.active")}
            value={stats.active}
            icon={Truck}
            variant="active"
          />
          <StatCard
            label={t("page.delivery.driver.stats.busy")}
            value={stats.busy}
            icon={Bike}
            variant="draft"
          />
          <StatCard
            label={t("page.delivery.driver.stats.draft")}
            value={stats.draft || 0}
            icon={FileEdit}
            variant="draft"
          />
          <StatCard
            label={t("page.delivery.driver.stats.offline")}
            value={stats.offline + stats.inactive}
            icon={Car}
            variant="inactive"
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={drivers}
        isLoading={isLoading || isFetching}
        emptyMessage={t("page.delivery.driver.list.empty")}
        emptyIcon={Users}
        toolbar={
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full">
            {isLoading || isFetching ? (
              <>
                <Skeleton className="h-6 w-32" />
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-9 w-48 rounded-md" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </>
            ) : (
              <>
                <h4 className="text-base font-semibold text-foreground shrink-0">
                  {t("page.delivery.driver.list.title")}
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <StoreFilter
                    locations={[]}
                    value={storeFilter}
                    onChange={(v) => {
                      setGlobalStoreFilter(v);
                      setPage(1);
                    }}
                    isSuperAdmin={user?.roleType === "super_admin"}
                    t={t}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1); }}
                    placeholder={t("page.delivery.driver.list.search")}
                    isLoading={isFetching}
                  />
                </div>
              </>
            )}
          </div>
        }
        pagination={{
          page,
          totalPages: data?.pagination?.totalPages || 1,
          total: data?.pagination?.total || 0,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: (v) => {
            setLimit(v);
            setPage(1);
          }
        }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.delivery.driver.modal.deleteTitle")}
        description={t("page.delivery.driver.modal.deleteDescription")}
        confirmText={t("page.delivery.driver.modal.deleteConfirm")}
        loading={deleteMutation?.isLoading}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </div>
  );
};

export default DriverList;
