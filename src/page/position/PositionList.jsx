import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getAllPositionTable,
  deletePosition,
  downloadPositionTemplate,
  downloadPositionExcel
} from "@/services/position";
import { getAllDepartment } from "@/services/department";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import UploadPositionModal from "@/page/position/components/UploadPositionModal";
import PageHeader from "@/components/ui/PageHeader";

const PositionList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [noDepartmentModal, setNoDepartmentModal] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const { data: departmentData } = useQuery(["departments-all"], getAllDepartment, {
    staleTime: 5 * 60 * 1000
  });

  const departments = departmentData?.data || departmentData?.departments || [];

  const { data, isLoading } = useQuery(
    ["positions", page, limit, search],
    () =>
      getAllPositionTable({
        page,
        limit,
        statusRole: "all",
        search
      }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deletePosition, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.position.toast.deleted") });
      queryClient.invalidateQueries(["positions"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const positions = data?.data || [];
  const pagination = data?.pagination || {};
  const stats = data?.stats || {};
  const total = stats.total ?? pagination?.totalItems ?? data?.total ?? 0;
  const activeCount = stats.active ?? 0;
  const inactiveCount = stats.inactive ?? 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (position) => {
    setDeleteTarget(position);
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
        breadcrumbs={[{ label: t("breadcrumb.adminConsole") }, { label: t("breadcrumb.position") }]}
        title={t("page.position.list.title")}
        description={t("page.position.list.description")}>
        <Button
          variant="outline"
          disabled={isDownloadingTemplate}
          onClick={async () => {
            if (departments.length === 0) {
              setNoDepartmentModal(true);
              return;
            }
            setIsDownloadingTemplate(true);
            try {
              await downloadPositionTemplate();
              toast.success(t("common.success"), {
                description: t("page.position.toast.templateDownloaded")
              });
            } catch (err) {
              toast.error(t("common.error"), {
                description:
                  err?.response?.data?.message ||
                  err.message ||
                  t("page.position.toast.templateDownloadFailed")
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
            ? t("common.downloading")
            : t("page.position.button.downloadTemplate")}
        </Button>
        <Button
          variant="outline"
          disabled={isDownloadingData}
          onClick={async () => {
            setIsDownloadingData(true);
            try {
              await downloadPositionExcel();
              toast.success(t("common.success"), {
                description: t("page.position.toast.dataDownloaded")
              });
            } catch (err) {
              toast.error(t("common.error"), {
                description:
                  err?.response?.data?.message ||
                  err.message ||
                  t("page.position.toast.dataDownloadFailed")
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
          {isDownloadingData ? t("common.downloading") : t("page.position.button.downloadData")}
        </Button>
        <span className="w-px h-7 bg-border mx-1" />
        <Button variant="default" onClick={() => setUploadModalOpen(true)}>
          <span className="material-symbols-outlined text-lg">upload</span>
          {t("page.position.button.uploadExcel")}
        </Button>
        <Button variant="default" onClick={() => navigate("/add-position")} className="shadow-md">
          <span className="material-symbols-outlined text-lg">add</span>
          {t("page.position.button.add")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.position.stats.total")}
            </p>
            <h3 className="text-2xl font-bold text-foreground">{total.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">work</span>
              {t("page.position.stats.totalSub")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              work
            </span>
          </div>
        </div>
        <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.position.stats.active")}
            </p>
            <h3 className="text-2xl font-bold text-foreground">{activeCount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {total > 0 ? Math.round((activeCount / total) * 100) : 0}%{" "}
              {t("page.position.stats.activeSub")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-fixed/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-secondary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
        </div>
        <div className="bg-red-600 dark:bg-red-900 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-100 uppercase tracking-wider mb-1">
              {t("page.position.stats.inactive")}
            </p>
            <h3 className="text-2xl font-bold text-white">{inactiveCount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-red-100 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">cancel</span>
              {t("page.position.stats.inactiveSub")}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-700 dark:bg-red-950 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              cancel
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {t("page.position.list.show")}:
            </span>
            <select
              value={limit}
              className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:ring-primary focus:border-primary">
              <option value={10}>{t("page.position.list.rows", { count: 10 })}</option>
              <option value={25}>{t("page.position.list.rows", { count: 25 })}</option>
              <option value={50}>{t("page.position.list.rows", { count: 50 })}</option>
            </select>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
              search
            </span>
            <input
              placeholder={t("page.position.list.search")}
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
                    {t("page.position.table.no")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.position.table.name")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.position.table.department")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.position.table.description")}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">badge</span>
                      {t("page.position.list.empty")}
                    </td>
                  </tr>
                ) : (
                  positions.map((position, index) => (
                    <tr
                      key={position.id}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/detail-position?positionID=${position.id}`)}>
                      <td className="px-5 py-3 text-sm font-mono text-muted-foreground">
                        {String(index + 1 + (page - 1) * limit).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold text-primary">{position.name}</span>
                      </td>
                      <td className="px-5 py-3">
                        {position.department ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-secondary-fixed/30 text-on-secondary-fixed-variant text-xs font-semibold">
                            {position.department}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {position.description || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/detail-position?positionID=${position.id}`)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-fixed/20 transition-all"
                            title={t("common.view")}>
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button
                            onClick={() => navigate(`/edit-position?id=${position.id}`)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-fixed/20 transition-all"
                            title={t("common.edit")}>
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(position)}
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
            {t("page.position.list.showing", { count: positions.length, total })}
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

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.confirmDeletePosition", { name: deleteTarget?.name || "" })}
        confirmText={t("common.confirmDelete")}
        onConfirm={confirmDelete}
      />
      <UploadPositionModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["positions"])}
      />
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined opacity-80">lightbulb</span>
          <h4 className="text-sm font-bold uppercase tracking-wider opacity-80">
            {t("page.position.list.tips")}
          </h4>
        </div>
        <ul className="space-y-2">
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>{t("page.position.list.tip1")}</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>{t("page.position.list.tip2")}</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>{t("page.position.list.tip3")}</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>{t("page.position.list.tip4")}</span>
          </li>
        </ul>
      </div>

      <Modal
        type="confirm"
        open={noDepartmentModal}
        onOpenChange={setNoDepartmentModal}
        title={t("page.position.modal.noDepartment.title")}
        description={t("page.position.modal.noDepartment.description")}
        confirmText={t("page.position.button.addDepartment")}
        onConfirm={() => navigate("/add-department")}
      />
    </div>
  );
};

export default PositionList;
