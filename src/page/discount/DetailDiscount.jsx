import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Tags, Edit3, Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { getDiscountById } from "@/services/discount";

const statusBadge = (status, t) => {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
        {t("page.discount.list.active")}
      </span>
    );
  if (status === "draft")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        {t("page.discount.list.draft")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
      {t("page.discount.list.inactive")}
    </span>
  );
};

const DetailDiscount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["discount", id],
    () => getDiscountById(id),
    { enabled: !!id }
  );

  const discount = data?.data || data;

  if (!id)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Discount ID not found</p>
      </div>
    );

  if (isLoading) return <Loading fullscreen size="lg" label={t("common.loading")} />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Discount not found</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/discount-list")}>
          {t("common.back")}
        </Button>
      </div>
    );

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/discount-list")}
          className="hover:text-foreground transition-colors">
          {t("page.discount.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{discount.name || "Detail"}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/discount-list")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Tags size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{discount.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">Detail discount</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/edit-discount?id=${id}`)}>
          <Edit3 size={14} className="mr-1.5" />
          {t("common.edit")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">
            <Tags size={16} />
            Discount Info
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.discount.form.name")}</p>
              <p className="font-medium">{discount.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.discount.form.type")}</p>
              <p className="font-medium">
                {discount.type === "percent"
                  ? "Persentase"
                  : discount.type === "nominal"
                    ? "Nominal"
                    : discount.type || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.discount.form.value")}</p>
              <p className="font-medium">
                {discount.value}
                {discount.type === "percent" ? "%" : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.discount.table.status")}
              </p>
              {statusBadge(discount.status, t)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.discount.form.code")}</p>
              <p className="font-mono text-sm">{discount.code || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.discount.form.minPurchase")}
              </p>
              <p className="font-medium">
                {discount.minimumOrder ? `Rp${discount.minimumOrder.toLocaleString("id-ID")}` : "0"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.discount.form.maxDiscount")}
              </p>
              <p className="font-medium">
                {discount.maximumDiscount
                  ? `Rp${discount.maximumDiscount.toLocaleString("id-ID")}`
                  : "0"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.discount.table.validity")}
              </p>
              <p className="font-medium">
                {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="font-medium">{discount.description || "-"}</p>
            </div>
          </div>
          <div className="border-t border-border/50 mt-5 pt-4 grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("page.discount.table.createdBy")}:{" "}
                {discount.createdByUser?.fullName || discount.createdBy || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("page.discount.table.modifiedBy")}:{" "}
                {discount.modifiedByUser?.fullName || discount.modifiedBy || "-"}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Tags size={20} />
            </div>
            <p className="text-2xl font-bold">{discount.usageCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Transaksi</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Calendar size={14} />
              Created
            </div>
            <p className="text-sm font-medium">{formatDate(discount.createdAt)}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Calendar size={14} />
              Modified
            </div>
            <p className="text-sm font-medium">{formatDate(discount.updatedAt)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailDiscount;
