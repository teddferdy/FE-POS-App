import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  Package,
  ArrowLeftRight,
  Tag,
  FolderTree,
  Building2,
  DollarSign,
  AlertTriangle,
  Ruler,
  ShoppingCart,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Info,
  ShieldCheck,
  History
} from "lucide-react";
import { getIngredientById } from "@/services/ingredient";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value ?? "-"}</p>
    </div>
  </div>
);

DetailRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any
};

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-3 border-b border-border">
    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
      <Icon size={18} />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
  </div>
);

SectionHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired
};

const DetailIngredient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError } = useQuery(["ingredient", id], () => getIngredientById(id), {
    enabled: !!id
  });

  const ingredient = data?.data || data;

  const statusConfig = {
    active: {
      label: t("page.ingredient.detail.active"),
      icon: CheckCircle2,
      bg: "bg-green-600 dark:bg-green-700 text-white",
      badge:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
    },
    draft: {
      label: t("common.draft"),
      icon: Clock,
      bg: "bg-yellow-500 dark:bg-yellow-600 text-white",
      badge:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
    },
    inactive: {
      label: t("page.ingredient.detail.inactive"),
      icon: XCircle,
      bg: "bg-red-600 dark:bg-red-900 text-white",
      badge:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
    }
  }[ingredient?.status] || {
    label: ingredient?.status || "-",
    icon: XCircle,
    bg: "bg-gray-500 text-white",
    badge: "bg-gray-100 text-gray-800 border border-gray-200"
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {[...Array(3)].map((_, s) => (
                  <div key={s} className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                    {[...Array(s === 1 ? 3 : s === 2 ? 3 : 4)].map((_, r) => (
                      <div key={r} className="flex items-start gap-3 py-3 border-b border-border">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, r) => (
                      <div
                        key={r}
                        className="flex items-center justify-between py-2 border-b border-border">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                    <Skeleton className="h-5 w-5 shrink-0 mt-0.5 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !ingredient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Package size={40} />
        <p>{t("page.ingredient.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/ingredient")}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const categoryName = ingredient.categoryData?.name || "-";
  const supplierName = ingredient.supplierData?.name || "-";
  const supplierPhone = ingredient.supplierData?.phone || null;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          {
            label: t("page.ingredient.list.title"),
            href: "/ingredient",
            i18nKey: "page.ingredient.list.title"
          },
          {
            label: t("page.ingredient.detail.breadcrumbDetail"),
            i18nKey: "page.ingredient.detail.breadcrumbDetail"
          }
        ]}
        title={ingredient.name}
        description={t("page.ingredient.detail.subtitle")}>
        <Button onClick={() => navigate(`/ingredient/edit/${id}`)} className="gap-2 shrink-0">
          <Edit3 size={16} />
          {t("common.edit")}
        </Button>
      </PageHeader>

      <div className="bg-card rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              {/* General Information */}
              <div className="space-y-4">
                <SectionHeader
                  icon={ClipboardList}
                  title={t("page.ingredient.detail.informasiUmum")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailRow
                    icon={Tag}
                    label={t("page.ingredient.detail.nama")}
                    value={ingredient.name}
                  />
                  <DetailRow
                    icon={FolderTree}
                    label={t("page.ingredient.detail.kategori")}
                    value={categoryName}
                  />
                  <DetailRow
                    icon={Building2}
                    label={t("page.ingredient.detail.supplier")}
                    value={supplierName}
                  />
                </div>
              </div>

              {/* Stock & Price */}
              <div className="space-y-4">
                <SectionHeader icon={Package} title={t("page.ingredient.detail.stokHarga")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailRow
                    icon={Package}
                    label={t("page.ingredient.detail.stokSaatIni")}
                    value={ingredient.stock}
                  />
                  <DetailRow
                    icon={AlertTriangle}
                    label={t("page.ingredient.detail.minimalStok")}
                    value={ingredient.minStock}
                  />
                  <DetailRow
                    icon={DollarSign}
                    label={t("page.ingredient.detail.hargaBeli")}
                    value={
                      ingredient.costPrice != null
                        ? `Rp ${Number(ingredient.costPrice).toLocaleString("id-ID")}`
                        : "-"
                    }
                  />
                </div>
              </div>

              {/* Unit Conversion */}
              <div className="space-y-4">
                <SectionHeader
                  icon={ArrowLeftRight}
                  title={t("page.ingredient.detail.konversiSatuan")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <DetailRow
                    icon={Ruler}
                    label={t("page.ingredient.detail.baseUnit")}
                    value={ingredient.baseUnit}
                  />
                  <DetailRow
                    icon={ShoppingCart}
                    label={t("page.ingredient.detail.unitPembelian")}
                    value={ingredient.unit}
                  />
                  <DetailRow
                    icon={Hash}
                    label={t("page.ingredient.detail.faktorKonversi")}
                    value={ingredient.conversionFactor}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg}`}>
                    <statusConfig.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{statusConfig.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("page.ingredient.detail.status")}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${statusConfig.badge}`}>
                  <statusConfig.icon size={12} />
                  {statusConfig.label}
                </span>
              </div>

              {/* Supplier Info */}
              {supplierName && (
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.ingredient.detail.supplier")}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("page.ingredient.detail.nama")}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{supplierName}</span>
                    </div>
                    {supplierPhone && (
                      <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                        <span className="text-xs font-medium text-muted-foreground">Phone</span>
                        <span className="text-xs font-semibold text-foreground">
                          {supplierPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("page.ingredient.detail.infoWaktu")}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("common.createdAt")}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {ingredient.createdAt
                        ? new Date(ingredient.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("common.updatedAt")}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {ingredient.updatedAt
                        ? new Date(ingredient.updatedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("common.createdBy")}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {ingredient.createdByUser?.fullName || ingredient.createdBy || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("common.modifiedBy")}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {ingredient.modifiedBy || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Help Cards */}
              <div className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                  <Info size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      {t("page.ingredient.detail.tips")}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("page.ingredient.detail.tipsDesc")}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                  <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      {t("page.ingredient.detail.tips")}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("page.ingredient.detail.tipsDesc")}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border">
                  <History size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      {t("page.ingredient.detail.tips")}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("page.ingredient.detail.tipsDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailIngredient;
