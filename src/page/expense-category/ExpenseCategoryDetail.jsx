import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Tag, ArrowLeft, Clock, User, Edit } from "lucide-react";
import { getExpenseCategories } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import AbortController from "@/components/organism/abort-controller";

const ExpenseCategoryDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["expense-categories"],
    () => getExpenseCategories(),
    { enabled: !!id }
  );

  const category = useMemo(() => {
    if (!data) return null;
    const list = data?.data || data || [];
    return list.find((item) => String(item.id) === id || String(item._id) === id) || null;
  }, [data, id]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID not found</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) return <Loading fullscreen size="lg" label="Loading..." />;

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  const statusStyle =
    category.status === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : category.status === "draft"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  const statusLabel =
    category.status === "active"
      ? t("common.active")
      : category.status === "draft"
        ? t("common.draft")
        : t("common.inactive");

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/expense-category")} className="hover:text-foreground transition-colors">
          {t("page.expenseCategory.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{category.name}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Detail kategori biaya</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/expense-category")} className="gap-2">
            <ArrowLeft size={18} />
            Kembali
          </Button>
          <Button onClick={() => navigate(`/edit-expense-category?id=${id}`)} className="gap-2">
            <Edit size={18} />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Informasi Kategori</h3>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama</p>
                <p className="text-sm font-semibold text-foreground mt-1">{category.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusStyle}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deskripsi</p>
                <p className="text-sm text-foreground mt-1">{category.description || "-"}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Clock size={18} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Sistem Informasi</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-xs font-medium text-muted-foreground">Dibuat Pada</span>
                <span className="text-xs font-semibold text-foreground text-right">{formatDate(category.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-xs font-medium text-muted-foreground">Diperbarui Pada</span>
                <span className="text-xs font-semibold text-foreground text-right">{formatDate(category.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-xs font-medium text-muted-foreground">Dibuat Oleh</span>
                <span className="text-xs font-semibold text-foreground text-right">{category.createdByUser?.fullName || category.createdByUser?.userName || category.createdBy || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-xs font-medium text-muted-foreground">Diubah Oleh</span>
                <span className="text-xs font-semibold text-foreground text-right">{category.modifiedByUser?.fullName || category.modifiedByUser?.userName || category.modifiedBy || "-"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryDetail;
