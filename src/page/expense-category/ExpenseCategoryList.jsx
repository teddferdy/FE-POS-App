import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Tag, Eye } from "lucide-react";
import { getExpenseCategories, deleteExpenseCategory } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

const ExpenseCategoryList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/expense-category";

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery(["expense-categories"], () =>
    getExpenseCategories()
  );

  const deleteMutation = useMutation(deleteExpenseCategory, {
    onSuccess: () => {
      toast.success(t("page.expenseCategory.list.toast.success"), {
        description: t("page.expenseCategory.list.toast.successDescription")
      });
      queryClient.invalidateQueries(["expense-categories"]);
    },
    onError: (err) => {
      toast.error(t("page.expenseCategory.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const categories = data?.data || data || [];
  const stats = data?.stats || {};
  const totalStats = stats.total ?? categories.length;
  const activeCount = stats.active ?? categories.filter((c) => c.status === "active").length;
  const draftCount = stats.draft ?? categories.filter((c) => c.status === "draft").length;
  const inactiveCount = stats.inactive ?? categories.filter((c) => c.status === "inactive").length;
  const filtered = categories.filter(
    (item) => !search || item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (category) => {
    setDeleteTarget(category);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.expenseCategory.list.name"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            <Tag size={14} />
          </div>
          <span className="font-medium text-foreground">{row.name || "-"}</span>
        </div>
      )
    },
    {
      header: t("page.expenseCategory.list.description"),
      render: (row) => (
        <span className="text-sm text-muted-foreground max-w-[300px] truncate block">
          {row.description || "-"}
        </span>
      )
    },
    {
      header: t("page.expenseCategory.list.status"),
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : row.status === "draft"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {row.status === "active"
            ? t("common.active")
            : row.status === "draft"
              ? t("common.draft")
              : t("common.inactive")}
        </span>
      )
    },
    {
      header: t("common.createdBy"),
      render: (row) => (
        <span className="text-sm text-muted-foreground">{row.createdByUser?.fullName || row.createdByUser?.userName || row.createdBy || "-"}</span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (row) => (
        <span className="text-sm text-muted-foreground">{row.modifiedByUser?.fullName || row.modifiedByUser?.userName || row.modifiedBy || "-"}</span>
      )
    },
    {
      header: t("common.createdAt"),
      render: (row) => {
        if (!row.createdAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(row.createdAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return <span className="text-sm font-mono text-muted-foreground">{d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>;
      }
    },
    {
      header: t("common.updatedAt"),
      render: (row) => {
        if (!row.updatedAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(row.updatedAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return <span className="text-sm font-mono text-muted-foreground">{d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>;
      }
    },
    {
      header: t("page.expenseCategory.list.actions"),
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/detail-expense-category?id=${row.id || row._id}`)}>
            <Eye size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-expense-category?id=${row.id || row._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
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
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.expenseCategory.list.title")}</span>
        </nav>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.expenseCategory.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.expenseCategory.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-expense-category")} className="gap-2">
            <Plus size={18} />
            {t("page.expenseCategory.button.add")}
          </Button>
        )}
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">
                {t("page.expenseCategory.list.total")}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalStats}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">{t("common.active")}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">{t("common.draft")}</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{draftCount}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{inactiveCount}</p>
            </Card>
          </div>

          <div>
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t("page.expenseCategory.list.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div>
            <DataTable
              columns={columns}
              data={filtered}
              isLoading={isLoading}
              emptyIcon={Tag}
              emptyMessage={t("page.expenseCategory.list.empty")}
            />
          </div>
        </>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.expenseCategory.modal.deleteTitle")}
        description={t("page.expenseCategory.modal.deleteDesc", {
          name: deleteTarget?.name || ""
        })}
        confirmText={t("page.expenseCategory.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ExpenseCategoryList;
