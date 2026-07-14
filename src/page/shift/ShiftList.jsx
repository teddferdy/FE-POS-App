import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Clock3,
  CheckCircle,
  FileEdit,
  XCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAllShift, deleteShift } from "@/services/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/StatCard";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";

const ShiftList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/shift-list";
  const locationParam = user?.store || "";

  const { data: locData } = useQuery(["locations-shift"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["shifts", page, limit, search, statusFilter],
    () => getAllShift({ store: locationParam, page, limit, statusShift: statusFilter })
  );

  const deleteMutation = useMutation(deleteShift, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.shift.toast.deleteSuccess") });
      queryClient.invalidateQueries(["shifts"]);
    },
    onError: (err) => {
      toast.error(t("common.failed"), { description: err?.response?.data?.message || err.message });
    }
  });

  const shifts = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;
  const stats = data?.stats || {};
  const statsTotal = stats.total ?? total;
  const activeCount =
    stats.active ??
    shifts.filter(
      (s) => s.status === "Aktif" || s.status === "active" || s.status === 1 || s.status === true
    ).length;
  const draftCount = stats.draft ?? shifts.filter((s) => s.status === "draft").length;
  const inactiveCount =
    stats.inactive ??
    shifts.filter((s) => s.status === "inactive" || s.status === 0 || s.status === false).length;

  const handleDelete = (shift) => {
    setDeleteTarget(shift);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.shift.table.name"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {row.nama_shift?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <span className="font-medium text-foreground">{row.nama_shift || "-"}</span>
        </div>
      )
    },
    { header: t("page.shift.table.startTime"), accessor: "jam_mulai" },
    { header: t("page.shift.table.endTime"), accessor: "jam_selesai" },
    {
      header: t("page.shift.table.status"),
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === "Aktif" ||
            row.status === "active" ||
            row.status === 1 ||
            row.status === true
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : row.status === "inactive" || row.status === 0 || row.status === false
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}>
          {row.status === "Aktif" ||
          row.status === "active" ||
          row.status === 1 ||
          row.status === true
            ? t("common.active")
            : row.status === "inactive" || row.status === 0 || row.status === false
              ? t("common.inactive")
              : t("common.draft")}
        </span>
      )
    },
    {
      header: t("common.createdBy"),
      render: (row) => (
        <span className="text-sm">
          {row.createdByUser?.fullName || row.createdByUser?.userName || row.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (row) => (
        <span className="text-sm">
          {row.modifiedByUser?.fullName || row.modifiedByUser?.userName || row.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("common.createdAt"),
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("common.updatedAt"),
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("common.actions"),
      align: "center",
      stickyRight: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-shift?id=${row.id || row._id}`)}>
              <Edit size={18} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(row)}>
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
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.shift.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.shift.list.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("page.shift.list.description")}</p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-shift")} className="gap-2" data-tour="shift-add">
              <Plus size={18} />
              {t("breadcrumb.add")}
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          {locData && (locData?.data || []).length === 0 ? (
            <NoStore />
          ) : (
            <>
              {isFetching || isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <StatCard
                    label={t("page.shift.table.name")}
                    value={statsTotal}
                    icon={Clock3}
                    variant="default"
                  />
                  <StatCard
                    label={t("common.active")}
                    value={activeCount}
                    icon={CheckCircle}
                    variant="active"
                  />
                  <StatCard
                    label={t("common.draft")}
                    value={draftCount}
                    icon={FileEdit}
                    variant="draft"
                  />
                  <StatCard
                    label={t("common.inactive")}
                    value={inactiveCount}
                    icon={XCircle}
                    variant="inactive"
                  />
                </div>
              )}

              <div data-tour="shift-table">
                <DataTable
                  columns={columns}
                  data={shifts}
                  isLoading={isLoading || isFetching}
                  emptyIcon={Clock}
                  emptyMessage={t("page.shift.list.empty")}
                  toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                      <h4 className="text-base font-semibold text-foreground">
                        {t("page.shift.list.title")}
                      </h4>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                          value={statusFilter}
                          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                          className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                          <option value="all">{t("common.all")}</option>
                          <option value="active">{t("common.active")}</option>
                          <option value="inactive">{t("common.inactive")}</option>
                          <option value="draft">{t("common.draft")}</option>
                        </select>
                        <div className="relative flex-1 md:w-64">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            placeholder={t("page.shift.list.search")}
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                            }}
                            className="pl-9 h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  }
                  pagination={{
                    page,
                    totalPages,
                    total,
                    onPageChange: (p) => setPage(p),
                    pageSize: limit,
                    onPageSizeChange: (v) => {
                      setLimit(v);
                      setPage(1);
                    }
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.shift.modal.deleteTitle")}
        description={t("page.shift.modal.deleteDesc", { name: deleteTarget?.nama_shift || "" })}
        confirmText={t("page.shift.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
    </div>
  );
};

export default ShiftList;
