import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderTree,
  Edit3,
  Calendar,
  Tag,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  Beef,
  Lightbulb
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getIngredientCategoryById } from "@/services/ingredientCategory";

const statusConfig = {
  active: {
    icon: CheckCircle2,
    bg: "bg-green-600 dark:bg-green-700 text-white",
    badge:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
  },
  draft: {
    icon: Clock,
    bg: "bg-yellow-500 dark:bg-yellow-600 text-white",
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
  },
  inactive: {
    icon: XCircle,
    bg: "bg-red-600 dark:bg-red-900 text-white",
    badge:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
  }
};

const DetailIngredientCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["ingredient-category", id],
    () => getIngredientCategoryById(id),
    { enabled: !!id }
  );

  const category = data?.data || data;
  const st = category ? statusConfig[category.status] || statusConfig.draft : null;
  const StatusIcon = st?.icon;

  if (!id)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.ingredientCategory.detail.notFound")}</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("page.ingredientCategory.detail.notFound")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/ingredient-category")}>
          {t("common.back")}
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/ingredient-category")}
          className="hover:text-foreground transition-colors">
          {t("page.ingredientCategory.list.title")}
        </button>
        <span className="text-xs">/</span>
        {isLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <span className="text-primary font-semibold">{category?.name || "Detail"}</span>
        )}
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/ingredient-category")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FolderTree size={24} />
          </div>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{category?.name || "-"}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("page.ingredientCategory.detail.description")}
                </p>
              </>
            )}
          </div>
        </div>
        {!isLoading && (
          <Button variant="outline" onClick={() => navigate(`/edit-ingredient-category?id=${id}`)}>
            <Edit3 size={14} className="mr-1.5" />
            {t("common.edit")}
          </Button>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 col-span-1 md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 space-y-5">
            {/* Info Card */}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">
                <Tag size={16} />
                {t("page.ingredientCategory.detail.info")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Tag size={15} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("page.ingredientCategory.detail.name")}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5 break-words">
                      {category?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Hash size={15} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("page.ingredientCategory.detail.code")}
                    </p>
                    <p className="text-sm font-mono text-foreground mt-0.5">
                      #ICAT-{String(category?.id).padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${st?.bg || "bg-gray-500 text-white"}`}>
                    {StatusIcon && <StatusIcon size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t("page.ingredientCategory.detail.status")}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 ${st?.badge || ""}`}>
                      {StatusIcon && <StatusIcon size={12} />}
                      {t(`common.${category?.status || "draft"}`)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
            {/* Info Waktu */}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <Calendar size={14} />
                {t("page.ingredientCategory.detail.infoWaktu")}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <span className="text-xs text-muted-foreground">{t("common.createdBy")}</span>
                  <span className="text-xs font-medium">
                    {category?.createdByName || category?.createdBy || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <span className="text-xs text-muted-foreground">{t("common.createdAt")}</span>
                  <span className="text-xs font-medium">
                    {category?.createdAt
                      ? new Date(category.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <span className="text-xs text-muted-foreground">{t("common.modifiedBy")}</span>
                  <span className="text-xs font-medium">
                    {category?.modifiedByName || category?.modifiedBy || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <span className="text-xs text-muted-foreground">{t("common.updatedAt")}</span>
                  <span className="text-xs font-medium">
                    {category?.updatedAt
                      ? new Date(category.updatedAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stat Card */}
            <Card
              className="p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate("/ingredient")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Beef size={20} />
              </div>
              <p className="text-2xl font-bold">{category?.ingredientCount ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("page.ingredientCategory.detail.totalIngredient")}
              </p>
            </Card>

            {/* Tips */}
            <Card className="p-5 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb size={16} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    {t("page.ingredientCategory.detail.tips.title")}
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      {t("page.ingredientCategory.detail.tips.1")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      {t("page.ingredientCategory.detail.tips.2")}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailIngredientCategory;
