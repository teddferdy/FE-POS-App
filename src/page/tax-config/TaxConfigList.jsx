import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Percent,
  Loader2,
  Receipt,
  CheckCircle,
  FileEdit,
  XCircle
} from "lucide-react";
import {
  getAllTaxConfig,
  deleteTaxConfig,
  downloadTaxConfigTemplate,
  downloadTaxConfigExcel
} from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/StatCard";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import { uploadTaxConfigExcel } from "@/services/tax-config";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";

const typeColors = {
  PPN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PPh: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Non-Pajak": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
};

const getTaxType = (name) => {
  if (!name) return "Non-Pajak";
  if (name.startsWith("PPN")) return "PPN";
  if (name.startsWith("PPh")) return "PPh";
  return "Non-Pajak";
};

const TaxConfigList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/tax-list";
  const locationParam = user?.store || "";

  const { data: locData } = useQuery(["locations-tax"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["tax-configs", page, limit, search],
    () => getAllTaxConfig({ location: locationParam, page, limit, search })
  );

  const deleteMutation = useMutation(deleteTaxConfig, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.taxConfig.toast.deleteSuccess") });
      queryClient.invalidateQueries(["tax-configs"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const items = data?.data || [];
  const stats = data?.stats || {};
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;
  const activeCount = stats.active ?? 0;
  const draftCount = stats.draft ?? 0;
  const inactiveCount = stats.inactive ?? 0;

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    { header: t("page.taxConfig.table.name"), accessor: "name" },
    {
      header: t("page.taxConfig.table.type"),
      render: (item) => {
        const taxType = getTaxType(item.name);
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[taxType] || typeColors["Non-Pajak"]}`}>
            {taxType}
          </span>
        );
      }
    },
    {
      header: t("page.taxConfig.table.rate"),
      render: (item) => <span className="font-semibold text-foreground">{item.rate ?? 0}%</span>
    },
    {
      header: t("page.taxConfig.table.description"),
      render: (item) => (
        <span className="text-muted-foreground max-w-[250px] block truncate">
          {item.description || "-"}
        </span>
      )
    },
    {
      header: t("common.status"),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : item.status === "draft"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {item.status === "active"
            ? t("common.active")
            : item.status === "draft"
              ? t("common.draft")
              : t("common.inactive")}
        </span>
      )
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
      header: t("common.actions"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-tax?id=${item.id || item._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(item)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.taxConfig.list.title")}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{t("page.taxConfig.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.taxConfig.list.description")}
          </p>
        </div>
        <div
          className="overflow-x-auto shrink-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex items-center gap-2 flex-nowrap">
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                variant="outline"
                disabled={isDownloadingTemplate}
                onClick={async () => {
                  setIsDownloadingTemplate(true);
                  try {
                    await downloadTaxConfigTemplate();
                    toast.success(t("common.success"), {
                      description: t("page.taxConfig.toast.templateSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.taxConfig.toast.templateError")
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
                {t("page.taxConfig.button.downloadTemplate")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                variant="outline"
                disabled={isDownloadingData}
                onClick={async () => {
                  setIsDownloadingData(true);
                  try {
                    await downloadTaxConfigExcel();
                    toast.success(t("common.success"), {
                      description: t("page.taxConfig.toast.dataSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.taxConfig.toast.dataError")
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
                {t("page.taxConfig.button.downloadData")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "import") && (
              <Button variant="default" onClick={() => setUploadModalOpen(true)}>
                <span className="material-symbols-outlined text-lg mr-1">upload</span>
                {t("page.taxConfig.button.upload")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="tax-add"
                onClick={() => navigate("/add-tax")}
                className="gap-2 shadow-md">
                <Plus size={18} />
                {t("page.taxConfig.button.add")}
              </Button>
            )}
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label={t("page.taxConfig.stats.total")}
                    value={stats.total ?? total}
                    icon={Receipt}
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

              <div data-tour="tax-table">
                <DataTable
                  columns={columns}
                  data={items}
                  isLoading={isLoading || isFetching}
                  emptyMessage={t("page.taxConfig.list.empty")}
                  emptyIcon={Percent}
                  toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                      <h4 className="text-base font-semibold text-foreground">
                        {t("page.taxConfig.list.title")}
                      </h4>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            data-tour="tax-search"
                            placeholder={t("page.taxConfig.list.search")}
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
                    pageSize: limit,
                    totalPages,
                    total,
                    onPageChange: setPage,
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
        title={t("modal.deleteTitle")}
        description={t("page.taxConfig.deleteConfirmDescription", {
          name: deleteTarget?.name || ""
        })}
        confirmText={t("modal.yesDelete")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}

      <UploadExcelModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadService={uploadTaxConfigExcel}
        queryKey={["tax-configs"]}
        title={t("page.taxConfig.upload.title")}
      />
    </div>
  );
};

export default TaxConfigList;
