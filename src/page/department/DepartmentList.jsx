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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/organism/modal";
import UploadDepartmentModal from "@/page/department/components/UploadDepartmentModal";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
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
  const MENU_KEY = "/department-list";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const { data, isLoading } = useQuery(
    ["departments", page, limit, search],
    () => getAllDepartmentTable({ page, limit, statusRole: "all", search }),
    { keepPreviousData: true }
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
  const total = pagination?.totalItems || 0;
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
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
          }`}>
          {department.status === "active" ? t("common.active") : t("common.inactive")}
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
      header: t("page.department.table.actions"),
      align: "center",
      render: (department) => (
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.adminConsole") },
          { label: t("breadcrumb.department") }
        ]}
        title={t("page.department.list.title")}
        description={t("page.department.list.description")}>
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
        {canAccess(user, MENU_KEY, "import") && <span className="w-px h-7 bg-border mx-1" />}
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
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          data-tour="department-stat-total"
          className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.department.list.statsTotal")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {stats?.totalDepartemen ?? total}
            </h3>
            <p className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">domain</span>
              {t("page.department.list.statsAll")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">domain</span>
          </div>
        </div>
        <div
          data-tour="department-stat-active"
          className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.department.list.statsActive")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {stats?.totalDepartemenAktif ?? 0}
            </h3>
            <p className="text-xs font-semibold text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {stats?.totalDepartemen
                ? Math.round((stats.totalDepartemenAktif / stats.totalDepartemen) * 100)
                : 0}
              {t("page.department.list.statsActivePercent")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
        </div>
        <div
          data-tour="department-stat-inactive"
          className="bg-red-600 dark:bg-red-900 p-6 rounded-xl shadow-sm flex justify-between items-center group hover:bg-red-700 dark:hover:bg-red-800 transition-colors hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-red-100 uppercase tracking-wider mb-1">
              {t("page.department.list.statsInactive")}
            </p>
            <h3 className="text-3xl font-bold text-white">
              {stats?.totalDepartemenNonActive ?? 0}
            </h3>
            <p className="text-xs font-semibold text-red-100 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">cancel</span>
              {t("page.department.list.statsAttention")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-700 dark:bg-red-950 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">cancel</span>
          </div>
        </div>
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
              <span className="material-symbols-outlined text-sm">warning</span>
              {stats?.totalDepartemen
                ? Math.round((stats.totalTanpaDeskripsi / stats.totalDepartemen) * 100)
                : 0}
              {t("page.department.list.statsNoDescPercent")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-destructive-container flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
        </div>
      </div>

      <div data-tour="department-table">
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
          pagination={{ page, totalPages, total, onPageChange: setPage }}
          rowClassName={() => "group"}
        />
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground">
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

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.department.modal.deleteTitle", { name: deleteTarget?.name || "" })}
        confirmText={t("page.department.modal.confirmDelete")}
        onConfirm={confirmDelete}
      />
      <UploadDepartmentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["departments"])}
      />
    </div>
  );
};

export default DepartmentList;
