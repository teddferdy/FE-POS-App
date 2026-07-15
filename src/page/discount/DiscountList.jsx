import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Tags, Gift, Eye, Percent, CheckCircle, XCircle, FileEdit } from "lucide-react";
import { getAllDiscount, deleteDiscount } from "@/services/discount";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import StoreFilter from "@/components/ui/StoreFilter";
import { SearchInput } from "@/components/ui/SearchInput";
import StatCard from "@/components/ui/StatCard";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";
import NoStore from "@/components/ui/NoStore";
import { canAccess } from "@/utils/permission";

const PROMO_TYPE_LABELS = {
  bogo: "BOGO",
  bundling: "Bundling",
  happyHour: "Happy Hour",
  category: "Kategori"
};

const getPromoLabel = (item) => {
  const promoType = item.conditions?.promoType;
  if (promoType && PROMO_TYPE_LABELS[promoType]) return PROMO_TYPE_LABELS[promoType];
  return item.type === "percent"
    ? "Persentase"
    : item.type === "nominal"
      ? "Nominal"
      : item.type || "-";
};

const DiscountList = () => {
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
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/discount";
  const locationParam = isSuperAdmin
    ? storeFilter && storeFilter !== "all"
      ? storeFilter
      : ""
    : user?.store;

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-discounts"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const { data, isLoading, isFetching } = useQuery(
    ["discounts", page, limit, search, storeFilter, statusFilter],
    () => getAllDiscount({ location: locationParam, page, limit, status: statusFilter }),
    { }
  );

  const deleteMutation = useMutation(deleteDiscount, {
    onSuccess: () => {
      toast.success(t("page.discount.list.toast.success"), {
        description: t("page.discount.list.toast.successDescription")
      });
      queryClient.invalidateQueries(["discounts"]);
    },
    onError: (err) => {
      toast.error(t("page.discount.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const discounts = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const statsFromBE = data?.stats || {};
  const statsTotal = statsFromBE.total || total;
  const activeCount = statsFromBE.active ?? discounts.filter((d) => d.status === "active").length;
  const draftCount = statsFromBE.draft ?? discounts.filter((d) => d.status === "draft").length;
  const inactiveCount =
    statsFromBE.inactive ??
    discounts.filter((d) => d.status !== "active" && d.status !== "draft").length;

  const handleDelete = (discount) => {
    setDeleteTarget(discount);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const columns = [
    {
      header: t("page.discount.table.name"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            <Tags size={14} />
          </div>
          <span className="font-medium text-foreground">{item.name || "-"}</span>
        </div>
      )
    },
    { header: t("page.discount.table.type"), render: (item) => getPromoLabel(item) },
    {
      header: t("page.discount.table.value"),
      render: (item) => {
        const cond = item.conditions || {};
        if (cond.promoType === "category" || cond.promoType === "happyHour")
          return `${cond.discountPercent || item.value}%`;
        if (item.type === "percent") return `${item.value}%`;
        return `Rp${item.value?.toLocaleString("id-ID") || item.value}`;
      }
    },
    {
      header: "Code",
      render: (item) => <span className="font-mono text-xs">{item.code || "-"}</span>
    },
    {
      header: t("page.discount.table.store"),
      render: (item) => {
        const store = item.store;
        if (!store || Array.isArray(store))
          return <span className="text-xs text-foreground">Semua Toko</span>;
        return <span className="text-xs">{store.name || `Store #${store.id}`}</span>;
      }
    },
    {
      header: t("page.discount.table.validity"),
      render: (item) => `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
    },
    {
      header: t("page.discount.table.status"),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : item.status === "draft"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {item.status === "active"
            ? t("page.discount.list.active")
            : item.status === "draft"
              ? t("page.discount.list.draft")
              : t("page.discount.list.inactive")}
        </span>
      )
    },
    {
      header: t("page.discount.table.createdBy"),
      render: (item) => item.createdByUser?.fullName || item.createdBy || "-"
    },
    {
      header: t("page.discount.table.createdDate"),
      render: (item) => formatDate(item.createdAt)
    },
    {
      header: t("page.discount.table.modifiedBy"),
      render: (item) => item.modifiedByUser?.fullName || item.modifiedBy || "-"
    },
    {
      header: t("page.discount.table.modifiedDate"),
      render: (item) => formatDate(item.updatedAt)
    },
    {
      header: t("page.discount.table.actions"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground"
            onClick={() => navigate(`/detail-discount?id=${item.id || item._id}`)}>
            <Eye size={18} />
          </Button>
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-discount?id=${item.id || item._id}`)}>
              <Edit size={18} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(item)}>
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
          <span className="text-primary font-semibold">{t("page.discount.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.discount.list.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.discount.list.description")}
            </p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-discount")} className="gap-2">
              <Plus size={18} />
              {t("page.discount.button.add")}
            </Button>
          )}
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isFetching || isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label={t("page.discount.list.total")}
                value={statsTotal}
                icon={Tags}
                variant="default"
                subtitle={t("page.discount.list.totalBadge", { count: discounts.length })}
              />
              <StatCard
                label={t("page.discount.list.active")}
                value={activeCount}
                icon={CheckCircle}
                variant="active"
                subtitle={`${statsTotal > 0 ? Math.round((activeCount / statsTotal) * 100) : 0}%`}
              />
              <StatCard
                label={t("common.draft")}
                value={draftCount}
                icon={FileEdit}
                variant="draft"
                subtitle={`${statsTotal > 0 ? Math.round((draftCount / statsTotal) * 100) : 0}%`}
              />
              <StatCard
                label={t("page.discount.list.inactive")}
                value={inactiveCount}
                icon={XCircle}
                variant="inactive"
                subtitle={`${statsTotal > 0 ? Math.round((inactiveCount / statsTotal) * 100) : 0}%`}
              />
            </div>
          )}

          <div data-tour="discount-table" className="mt-6">
            <DataTable
              columns={columns}
              data={discounts}
              isLoading={isLoading || isFetching}
              emptyMessage={t("page.discount.list.empty")}
              emptyIcon={Gift}
              toolbar={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                  {isLoadingLocations || isLoading || isFetching ? (
                    <>
                      <Skeleton className="h-6 w-32" />
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Skeleton className="h-9 w-48 rounded-md" />
                        <Skeleton className="h-9 w-64 rounded-md" />
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="text-base font-semibold text-foreground">
                        {t("page.discount.list.title")}
                      </h4>
                      <div className="flex items-center gap-3 w-full md:w-auto">
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
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                          }}
                          className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                          <option value="all">{t("common.all")}</option>
                          <option value="active">{t("common.active")}</option>
                          <option value="inactive">{t("common.inactive")}</option>
                          <option value="draft">{t("common.draft")}</option>
                        </select>
                        <SearchInput
                          value={search}
                          onChange={(val) => { setSearch(val); setPage(1); }}
                          placeholder={t("page.discount.list.search")}
                          isLoading={isFetching}
                          resultCount={data?.pagination?.total || data?.total}
                        />
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
        </>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.discount.modal.deleteTitle")}
        description={t("page.discount.modal.deleteDesc", { name: deleteTarget?.name || "" })}
        confirmText={t("page.discount.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
    </div>
  );
};

export default DiscountList;
