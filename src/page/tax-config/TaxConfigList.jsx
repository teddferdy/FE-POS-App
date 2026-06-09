import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Percent } from "lucide-react";
import { getAllTaxConfig, deleteTaxConfig } from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";

const typeColors = {
  PPN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PPh: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Non-Pajak": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
};

const TaxConfigList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const MENU_KEY = "/tax-list";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["tax-configs", page, limit, search],
    () => getAllTaxConfig({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteTaxConfig, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.taxConfig.toast.deleteSuccess") });
      queryClient.invalidateQueries(["tax-configs"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const items = data?.data || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    { header: t("page.taxConfig.table.name"), accessor: "name" },
    {
      header: t("page.taxConfig.table.type"),
      render: (item) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[item.type] || typeColors["Non-Pajak"]}`}>
          {item.type || "Non-Pajak"}
        </span>
      )
    },
    {
      header: t("page.taxConfig.table.rate"),
      render: (item) => <span className="font-semibold text-foreground">{item.rate ?? 0}%</span>
    },
    {
      header: t("page.taxConfig.table.description"),
      render: (item) => (
        <span className="text-muted-foreground max-w-[250px] block truncate">
          {item.description || "-"}
        </span>
      )
    },
    {
      header: t("common.actions"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-tax?id=${item.id || item._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(item)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.taxConfig.list.title")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.taxConfig.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.taxConfig.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button data-tour="tax-add" onClick={() => navigate("/add-tax")} className="gap-2">
            <Plus size={18} />
            {t("page.taxConfig.button.add")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-tour="tax-stat-total" className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.taxConfig.stats.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card data-tour="tax-stat-active" className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
        </Card>
        <Card data-tour="tax-stat-inactive" className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.inactive ?? 0}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          data-tour="tax-search"
          placeholder={t("page.taxConfig.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </div>

      <div data-tour="tax-table">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          emptyMessage={t("page.taxConfig.list.empty")}
          emptyIcon={Percent}
          pagination={{ page, totalPages, total, onPageChange: setPage }}
        />
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteTitle")}
        description={t("page.taxConfig.deleteConfirmDescription", {
          name: deleteTarget?.name || ""
        })}
        confirmText={t("modal.yesDelete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default TaxConfigList;
