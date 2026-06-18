import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { getCategoryById } from "@/services/category";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";
import AbortController from "@/components/organism/abort-controller";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const DetailCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("id");

  const {
    data: categoryData,
    isLoading,
    isError,
    refetch
  } = useQuery(["category-detail", categoryId], () => getCategoryById({ id: categoryId }), {
    enabled: !!categoryId
  });

  const cat = categoryData?.data || categoryData?.category || {};

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">category</span>
        <p>{t("page.category.detail.idNotFound")}</p>
        <Button variant="outline" onClick={() => navigate("/category-list")}>
          {t("page.category.detail.back")}
        </Button>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-2xl shrink-0" />
              <div className="text-center md:text-left space-y-3 flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-72 mx-auto md:mx-0" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-6 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!cat || !cat.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">category</span>
        <p>{t("page.category.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/category-list")}>
          {t("page.category.detail.back")}
        </Button>
      </div>
    );
  }

  const isActive = cat.status === "active" || cat.isActive === true;

  return (
    <div className="space-y-6">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <PageHeader
            breadcrumbs={[
              {
                label: t("breadcrumb.home"),
                href: "/dashboard-super-admin",
                i18nKey: "breadcrumb.home"
              },
              {
                label: t("breadcrumb.category"),
                href: "/category-list",
                i18nKey: "breadcrumb.category"
              },
              { label: cat.name, i18nKey: "page.category.detail.title" }
            ]}
            title={t("page.category.detail.title")}
            description={t("page.category.detail.description")}>
            <Button
              onClick={() => navigate(`/edit-category?id=${cat.id}`)}
              className="gap-2 shadow-md">
              <span className="material-symbols-outlined text-lg">edit</span>
              {t("page.category.button.edit")}
            </Button>
          </PageHeader>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {cat.image && !cat.image.startsWith("http") ? (
                    <span className="material-symbols-outlined text-6xl">{cat.image}</span>
                  ) : cat.image && cat.image.startsWith("http") ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl">category</span>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{cat.name}</h1>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                      />
                      {isActive ? t("common.active") : t("common.inactive")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {cat.description || t("page.category.detail.noDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">tag</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.category.detail.id")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">
                    {cat.code || cat.idCategory || `#CAT-${String(cat.id).padStart(3, "0")}`}
                  </p>
                </div>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.category.detail.productCount")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {cat.productCount || cat.totalProduct || 0} Item
                  </p>
                </div>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.category.detail.created")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(cat.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.category.detail.systemInfo")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.category.detail.createdAt")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(cat.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{cat.createdBy || "System"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">update</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.category.detail.updatedAt")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(cat.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{cat.modifiedBy || "System"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DetailCategory;
