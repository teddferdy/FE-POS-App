import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package } from "lucide-react";
import { getIngredientById } from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

const statusBadge = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const fmtDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "-";

const DetailIngredient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(["ingredient", id], () => getIngredientById(id), {
    enabled: !!id
  });

  if (isLoading)
    return <Loading fullscreen size="lg" label={t("page.ingredient.detail.loadingLabel")} />;

  const item = data?.data;
  if (!item)
    return (
      <p className="text-center text-muted-foreground py-12">
        {t("page.ingredient.detail.dataNotFound")}
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/dashboard-super-admin")}
              className="hover:text-primary transition-colors">
              {t("page.ingredient.detail.breadcrumbDashboard")}
            </button>
            <span>/</span>
            <button
              onClick={() => navigate("/ingredient")}
              className="hover:text-primary transition-colors">
              {t("page.ingredient.detail.breadcrumbIngredient")}
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">
              {t("page.ingredient.detail.breadcrumbDetail")}
            </span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{item.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.ingredient.detail.subtitle")}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/ingredient")} className="gap-2">
          <ArrowLeft size={16} /> {t("page.ingredient.detail.backButton")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">
              {t("page.ingredient.detail.informasiUmum")}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.nama")}
                </p>
                <p className="text-sm font-medium">{item.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.status")}
                </p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || statusBadge.active}`}>
                  {item.status === "active"
                    ? t("page.ingredient.detail.active")
                    : t("page.ingredient.detail.inactive")}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.kategori")}
                </p>
                <p className="text-sm">{item.categoryData?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.supplier")}
                </p>
                <p className="text-sm">{item.supplierData?.name || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">
              {t("page.ingredient.detail.konversiSatuan")}
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.unitPembelian")}
                </p>
                <p className="text-sm font-medium capitalize">{item.unit || "pcs"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.baseUnit")}
                </p>
                <p className="text-sm font-medium capitalize">
                  {item.baseUnit || item.unit || "pcs"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.faktorKonversi")}
                </p>
                <p className="text-sm font-medium">
                  1 {item.unit} = {item.conversionFactor ?? 1} {item.baseUnit || item.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">
              {t("page.ingredient.detail.stokHarga")}
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.stokSaatIni")}
                </p>
                <p
                  className={`text-sm font-mono font-medium ${item.stock <= item.minStock ? "text-destructive" : ""}`}>
                  {item.stock}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.minimalStok")}
                </p>
                <p className="text-sm font-mono">{item.minStock}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.hargaBeli")}
                </p>
                <p className="text-sm font-medium">
                  Rp {Number(item.costPrice || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              {t("page.ingredient.detail.infoWaktu")}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.dibuat")}
                </p>
                <p className="text-sm">{fmtDate(item.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("page.ingredient.detail.diubah")}
                </p>
                <p className="text-sm">{fmtDate(item.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              {t("page.ingredient.detail.aksi")}
            </h3>
            <div className="space-y-3">
              <Button
                className="w-full"
                variant="default"
                onClick={() => navigate(`/edit-ingredient?id=${item.id}`)}>
                {t("page.ingredient.detail.editButton")}
              </Button>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-primary" />
              <span className="text-sm font-semibold text-primary">
                {t("page.ingredient.detail.tips")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("page.ingredient.detail.tipsDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailIngredient;
