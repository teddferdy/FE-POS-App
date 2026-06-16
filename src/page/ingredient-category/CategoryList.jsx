import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Package } from "lucide-react";
import { getAllIngredientCategory, deleteIngredientCategory } from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) +
      " " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return "-";
  }
};

const CategoryList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["ingredient-categories"],
    () => getAllIngredientCategory(),
    {}
  );

  const deleteMutation = useMutation(deleteIngredientCategory, {
    onSuccess: () => {
      toast.success(t("page.ingredientCategory.list.toastSuccess"), {
        description: t("page.ingredientCategory.list.toastSuccessDesc")
      });
      queryClient.invalidateQueries(["ingredient-categories"]);
    },
    onError: (err) => {
      toast.error(t("page.ingredientCategory.list.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const categories = data?.data || [];

  const statsTotal = categories.length;
  const activeCount = categories.filter((c) => c.status === "active").length;
  const inactiveCount = categories.filter((c) => c.status === "inactive").length;

  const filtered = categories.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (cat.name || "").toLowerCase().includes(q);
  });

  const stats = [
    {
      icon: Package,
      label: t("page.ingredientCategory.list.statTotal"),
      value: statsTotal,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Package,
      label: t("page.ingredientCategory.list.statActive"),
      value: activeCount,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-700 dark:text-green-300"
    },
    {
      icon: Package,
      label: t("page.ingredientCategory.list.statInactive"),
      value: inactiveCount,
      iconBg: "bg-red-100 dark:bg-red-900/40",
      iconColor: "text-red-700 dark:text-red-300"
    }
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>{t("page.ingredientCategory.list.breadcrumbSettings")}</span>
            <span>/</span>
            <span className="text-primary font-semibold">
              {t("page.ingredientCategory.list.breadcrumbCategory")}
            </span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.ingredientCategory.list.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.ingredientCategory.list.subtitle")}
          </p>
        </div>
        <Button onClick={() => navigate("/add-ingredient-category")} className="shadow-md">
          <Plus size={16} className="mr-1" />
          {t("page.ingredientCategory.list.addButton")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center ${stat.iconColor}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("page.ingredientCategory.list.searchPlaceholder")}
            className="max-w-xs h-10"
          />
        </div>

        {isLoading ? (
          <Loading fullscreen size="lg" label={t("page.ingredientCategory.list.loadingLabel")} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>{t("page.ingredientCategory.list.emptyText")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.ingredientCategory.list.tableKode")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.ingredientCategory.list.tableNama")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.ingredientCategory.list.tableStatus")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.ingredientCategory.list.tableDibuat")}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.ingredientCategory.list.tableAksi")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-foreground">
                        {`#ICAT-${String(cat.id).padStart(3, "0")}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          cat.status === "active"
                            ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        }`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.status === "active"
                              ? "bg-green-500 dark:bg-green-400"
                              : "bg-red-500 dark:bg-red-400"
                          }`}
                        />
                        {cat.status === "active"
                          ? t("page.ingredientCategory.list.active")
                          : t("page.ingredientCategory.list.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        {formatDate(cat.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/edit-ingredient-category?id=${cat.id}`)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title={t("page.ingredientCategory.list.editTitle")}>
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          title={t("page.ingredientCategory.list.deleteTitle")}>
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("page.ingredientCategory.list.modalDeleteTitle")}
        description={t("page.ingredientCategory.list.modalDeleteDesc")}
        confirmText={t("page.ingredientCategory.list.modalDeleteConfirm")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default CategoryList;
