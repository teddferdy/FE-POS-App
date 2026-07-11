import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getAllDepartmentTable,
  deleteDepartment,
  downloadDepartmentTemplate,
  downloadDepartmentExcel
} from "@/services/department";
import { getAllLocation } from "@/services/location";
import { Loader2, Building, CheckCircle, FileEdit, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import { uploadDepartmentExcel } from "@/services/department";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import NoStore from "@/components/ui/NoStore";
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

const DepartmentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/department-list";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const { data: locData } = useQuery(["locations-departments"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading } = useQuery(
    ["departments", page, limit, search],
    () => getAllDepartmentTable({ page, limit, statusRole: "all", search }),
    { }
  );

  const deleteMutation = useMutation(deleteDepartment, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.department.toast.deleteSuccess") });
      queryClient.invalidateQueries(["departments"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const departments = data?.data || [];
  const pagination = data?.pagination || {};
  const stats = data?.stats || {};
  const total = pagination?.total ?? pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (department) => {
    setDeleteTarget(department);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.department.table.no"),
      render: (_, index) => (
        <span className="text-sm font-mono text-muted-foreground">
          {String(index + 1 + (page - 1) * limit).padStart(2, "0")}
        </span>
      )
    },
    {
      header: t("page.department.table.name"),
      render: (department) => (
        <span className="text-sm font-semibold text-primary">{department.name}</span>
      )
    },
    {
      header: t("page.department.table.description"),
      render: (department) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">
          {department.description || "-"}
        </p>
      )
    },
    {
      header: t("page.department.table.status"),
      align: "center",
      render: (department) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
            department.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              : department.status === "draft"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
          }`}>
          {department.status === "active"
            ? t("common.active")
            : department.status === "draft"
              ? t("common.draft")
              : t("common.inactive")}
        </span>
      )
    },
    {
      header: t("page.department.table.createdDate"),
      render: (department) => (
        <span className="text-sm font-mono text-muted-foreground">
          {formatDate(department.createdAt)}
        </span>
      )
    },
    {
      header: t("page.department.table.updatedDate"),
      render: (department) => (
        <span className="text-sm font-mono text-muted-foreground">
          {formatDate(department.updatedAt)}
        </span>
      )
    },
    {
      header: t("common.createdBy"),
      render: (department) => (
        <span className="text-sm text-muted-foreground">
          {department.createdByUser?.fullName ||
            department.createdByUser?.userName ||
            department.createdBy ||
            "-"}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (department) => (
        <span className="text-sm text-muted-foreground">
          {department.modifiedByUser?.fullName ||
            department.modifiedByUser?.userName ||
            department.modifiedBy ||
            "-"}
        </span>
      )
    },
    {
      header: t("page.department.table.actions"),
      align: "center",
      stickyRight: true,
      render: (department) => (
        <div className="flex items-center justify-center gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/detail-department?id=${department.id}`);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-fixed/20 transition-all"
              title={t("common.view")}>
              <span className="material-symbols-outlined text-lg">visibility</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-department?id=${department.id}`);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-fixed/20 transition-all"
              title={t("common.edit")}>
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(department);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-container/20 transition-all"
              title={t("common.delete")}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
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
          <span className="text-primary font-semibold">{t("page.department.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.department.list.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.department.list.description")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                data-tour="department-download-template"
                variant="outline"
                disabled={isDownloadingTemplate}
                onClick={async () => {
                  setIsDownloadingTemplate(true);
                  try {
                    await downloadDepartmentTemplate();
                    toast.success(t("common.success"), {
                      description: t("page.department.toast.templateSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.department.toast.templateError")
                    });
                  } finally {
                    setIsDownloadingTemplate(false);
                  }
                }}>
                {isDownloadingTemplate ? (
                  <Loader2 size={16} className="mr-1 animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg mr-1">table_rows</span>
                )}
                {isDownloadingTemplate
                  ? t("page.department.button.downloading")
                  : t("page.department.button.downloadTemplate")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                data-tour="department-download-data"
                variant="outline"
                disabled={isDownloadingData}
                onClick={async () => {
                  setIsDownloadingData(true);
                  try {
                    await downloadDepartmentExcel();
                    toast.success(t("common.success"), {
                      description: t("page.department.toast.dataSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.department.toast.dataError")
                    });
                  } finally {
                    setIsDownloadingData(false);
                  }
                }}>
                {isDownloadingData ? (
                  <Loader2 size={16} className="mr-1 animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg mr-1">download</span>
                )}
                {isDownloadingData
                  ? t("page.department.button.downloading")
                  : t("page.department.button.downloadData")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "import") && (
              <Button
                data-tour="department-upload"
                variant="default"
                onClick={() => setUploadModalOpen(true)}>
                <span className="material-symbols-outlined text-lg">upload</span>
                {t("page.department.button.upload")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="department-add"
                variant="default"
                onClick={() => navigate("/add-department")}
                className="shadow-md">
                <span className="material-symbols-outlined text-lg">add</span>
                {t("page.department.button.add")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div>
            <div>
              {isLoading ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {[...Array(3)].map((_, i) => (
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
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatCard
                      label={t("page.department.list.statsTotal")}
                      value={stats?.totalDepartemen ?? total}
                      icon={Building}
                      variant="default"
                      subtitle={t("page.department.list.statsAll")}
                    />
                    <StatCard
                      label={t("page.department.list.statsActive")}
                      value={stats?.totalDepartemenAktif ?? 0}
                      icon={CheckCircle}
                      variant="active"
                      subtitle={`${stats?.totalDepartemen ? Math.round((stats.totalDepartemenAktif / stats.totalDepartemen) * 100) : 0}${t("page.department.list.statsActivePercent")}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <StatCard
                      label={t("page.department.list.statsDraft")}
                      value={stats?.totalDepartemenDraft ?? 0}
                      icon={FileEdit}
                      variant="draft"
                      subtitle={
                        stats?.totalDepartemen
                          ? `${Math.round((stats.totalDepartemenDraft / stats.totalDepartemen) * 100)}%`
                          : "0%"
                      }
                    />
                    <StatCard
                      label={t("page.department.list.statsInactive")}
                      value={stats?.totalDepartemenNonActive ?? 0}
                      icon={XCircle}
                      variant="inactive"
                      subtitle={t("page.department.list.statsAttention")}
                    />
                    <div
                      data-tour="department-stat-nodesc"
                      className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          {t("page.department.list.statsNoDesc")}
                        </p>
                        <h3 className="text-3xl font-bold text-foreground">
                          {stats?.totalTanpaDeskripsi ?? 0}
                        </h3>
                        <p className="text-xs font-semibold text-destructive flex items-center gap-1 mt-1">
                          <AlertTriangle size={14} />
                          {stats?.totalDepartemen
                            ? Math.round((stats.totalTanpaDeskripsi / stats.totalDepartemen) * 100)
                            : 0}
                          {t("page.department.list.statsNoDescPercent")}
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-destructive-container flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                        <AlertTriangle size={28} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div data-tour="department-table" className="mt-6">
                <DataTable
                  columns={columns}
                  data={departments}
                  isLoading={isLoading}
                  emptyMessage={t("page.department.list.empty")}
                  toolbar={
                    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {t("page.department.list.showLabel")}
                        </span>
                        <select
                          value={limit}
                          className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:ring-primary focus:border-primary">
                          <option value={10}>{t("page.department.list.show10")}</option>
                          <option value={25}>{t("page.department.list.show25")}</option>
                          <option value={50}>{t("page.department.list.show50")}</option>
                        </select>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                          search
                        </span>
                        <input
                          data-tour="department-search"
                          placeholder={t("page.department.list.search")}
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                          className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                  rowClassName={() => "group"}
                />
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined opacity-80">lightbulb</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider opacity-80">
                    {t("page.department.tips.title")}
                  </h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.department.tips.1")}</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.department.tips.2")}</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.department.tips.3")}</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.department.tips.4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.department.modal.deleteTitle", { name: deleteTarget?.name || "" })}
        description={t("page.department.modal.deleteDesc", { name: deleteTarget?.name || "" })}
        confirmText={t("page.department.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
      <UploadExcelModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadService={uploadDepartmentExcel}
        queryKey={["departments"]}
        title={t("page.department.upload.title")}
        subtitle={t("page.department.upload.subtitle")}
      />
    </div>
  );
};

export default DepartmentList;
