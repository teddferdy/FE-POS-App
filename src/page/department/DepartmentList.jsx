import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
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
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import UploadDepartmentModal from "@/page/department/components/UploadDepartmentModal";
import PageHeader from "@/components/ui/PageHeader";

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

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.adminConsole") },
          { label: t("breadcrumb.department") }
        ]}
        title={t("page.department.list.title")}
        description={t("page.department.list.description")}>
        <Button
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
        <Button
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
        <span className="w-px h-7 bg-border mx-1" />
        <Button variant="default" onClick={() => setUploadModalOpen(true)}>
          <span className="material-symbols-outlined text-lg">upload</span>
          {t("page.department.button.upload")}
        </Button>
        <Button variant="default" onClick={() => navigate("/add-department")} className="shadow-md">
          <span className="material-symbols-outlined text-lg">add</span>
          {t("page.department.button.add")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
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
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
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
        <div className="bg-red-600 dark:bg-red-900 p-6 rounded-xl shadow-sm flex justify-between items-center group hover:bg-red-700 dark:hover:bg-red-800 transition-colors hover:shadow-md">
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
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
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

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-border">
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                    {t("page.department.table.no")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.department.table.name")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.department.table.description")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                    {t("page.department.table.status")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.department.table.createdDate")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.department.table.updatedDate")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                    {t("page.department.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">domain</span>
                      {t("page.department.list.empty")}
                    </td>
                  </tr>
                ) : (
                  departments.map((department, index) => (
                    <tr key={department.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-5 py-3 text-sm font-mono text-muted-foreground">
                        {String(index + 1 + (page - 1) * limit).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold text-primary">
                          {department.name}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {department.description || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
                            department.status
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                          }`}>
                          {department.status ? t("common.active") : t("common.inactive")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-muted-foreground">
                        {formatDate(department.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-muted-foreground">
                        {formatDate(department.updatedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/detail-department?id=${department.id}`)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-fixed/20 transition-all"
                            title={t("common.view")}>
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button
                            onClick={() => navigate(`/edit-department?id=${department.id}`)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-fixed/20 transition-all"
                            title={t("common.edit")}>
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(department)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error-container/20 transition-all"
                            title={t("common.delete")}>
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("page.department.list.showing", { count: departments.length, total })}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-all text-muted-foreground disabled:opacity-30">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-muted text-muted-foreground"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-1 text-muted-foreground text-sm">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-all text-muted-foreground text-sm font-semibold">
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-all text-muted-foreground disabled:opacity-30">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
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
