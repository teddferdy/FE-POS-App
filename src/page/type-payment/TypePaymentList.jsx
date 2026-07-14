import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Eye, Edit, Trash2, CreditCard, Loader2, CheckCircle, FileEdit, XCircle } from "lucide-react";
import {
  getAllTypePaymentListActive,
  getAllTypePayment,
  deleteTypePayment,
  downloadTypePaymentTemplate,
  downloadTypePaymentExcel
} from "@/services/type-payment";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/StatCard";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import { uploadTypePaymentExcel } from "@/services/type-payment";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const TypePaymentList = () => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      const locale = i18n.language === "id" ? "id-ID" : "en-US";
      return (
        d.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) +
        " " +
        d.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit"
        })
      );
    } catch {
      return "-";
    }
  };
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
  const MENU_KEY = "/type-payment-list";

  const { data: locData } = useQuery(["locations-type-payment"], () => getAllLocation(), {
    
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["type-payments", page, limit, search],
    () => getAllTypePaymentListActive({ page, limit, statusPayment: "all" }),
    { }
  );

  const { data: allData } = useQuery(["type-payments-all"], () => getAllTypePayment({}));

  const deleteMutation = useMutation(deleteTypePayment, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.typePayment.toast.deleteSuccess")
      });
      queryClient.invalidateQueries(["type-payments"]);
      queryClient.invalidateQueries(["type-payments-all"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const payments = data?.data || [];
  const allPayments = allData?.data || [];
  const stats = data?.stats || {};
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;
  const activeCount =
    stats.active ??
    allPayments.filter(
      (item) =>
        item.status === "Aktif" ||
        item.status === true ||
        item.status === "active" ||
        item.isActive === true
    ).length;
  const draftCount = stats.draft ?? allPayments.filter((item) => item.status === "draft").length;
  const inactiveCount = stats.inactive ?? allPayments.length - activeCount - draftCount;

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (item) => {
    const isActive =
      item.status === "Aktif" ||
      item.status === true ||
      item.status === "active" ||
      item.isActive === true;
    const isDraft = item.status === "draft";
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : isDraft
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
        {isActive ? t("common.active") : isDraft ? t("common.draft") : t("common.inactive")}
      </span>
    );
  };

  const columns = [
    {
      header: t("common.status"),
      render: (row) => getStatusBadge(row)
    },
    {
      header: t("common.createdBy"),
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.createdByUser?.fullName || row.createdByUser?.userName || row.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("page.typePayment.table.createdDate"),
      render: (row) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(row.createdAt)}</span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.modifiedByUser?.fullName || row.modifiedByUser?.userName || row.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("page.typePayment.table.updatedDate"),
      render: (row) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(row.updatedAt)}</span>
      )
    },
    {
      header: t("common.actions"),
      align: "right",
      stickyRight: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "detail") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              title={t("common.view")}
              onClick={() => navigate(`/detail-type-payment?id=${row.id || row._id}`)}>
              <Eye size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "edit") && !row.isSystem && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              title={t("common.edit")}
              onClick={() => navigate(`/edit-type-payment?id=${row.id || row._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && !row.isSystem && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              title={t("common.delete")}
              onClick={() => handleDelete(row)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.typePayment.list.title")}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{t("page.typePayment.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.typePayment.list.description")}
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
                    await downloadTypePaymentTemplate();
                    toast.success(t("common.success"), {
                      description: t("page.typePayment.toast.templateSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.typePayment.toast.templateError")
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
                {t("page.typePayment.button.downloadTemplate")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                variant="outline"
                disabled={isDownloadingData}
                onClick={async () => {
                  setIsDownloadingData(true);
                  try {
                    await downloadTypePaymentExcel();
                    toast.success(t("common.success"), {
                      description: t("page.typePayment.toast.dataSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.typePayment.toast.dataError")
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
                {t("page.typePayment.button.downloadData")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "import") && (
              <Button variant="default" onClick={() => setUploadModalOpen(true)}>
                <span className="material-symbols-outlined text-lg mr-1">upload</span>
                {t("page.typePayment.button.upload")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "add") && (
              <Button onClick={() => navigate("/add-type-payment")} className="gap-2 shadow-md">
                <Plus size={18} />
                {t("page.typePayment.button.add")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
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
                    label={t("page.typePayment.stats.total")}
                    value={stats.total ?? total}
                    icon={CreditCard}
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

              <div data-tour="type-payment-table">
                <DataTable
                  columns={columns}
                  data={payments}
                  isLoading={isLoading || isFetching}
                  emptyIcon={CreditCard}
                  emptyMessage={t("page.typePayment.list.empty")}
                  toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                      <h4 className="text-base font-semibold text-foreground">
                        {t("page.typePayment.list.title")}
                      </h4>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            placeholder={t("page.typePayment.list.search")}
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
        description={t("page.typePayment.deleteConfirmDescription", {
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
        uploadService={uploadTypePaymentExcel}
        title={t("page.typePayment.upload.title")}
        onSuccess={() => {
          queryClient.invalidateQueries(["type-payments"]);
          queryClient.invalidateQueries(["type-payments-all"]);
        }}
      />
    </div>
  );
};

export default TypePaymentList;
