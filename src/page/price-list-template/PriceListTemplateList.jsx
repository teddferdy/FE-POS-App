import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, TrendingUp } from "lucide-react";
import { getAllPriceListTemplate, deletePriceListTemplate } from "@/services/price-list-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";

const PriceListTemplateList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["price-list-templates", page, limit, search],
    () => getAllPriceListTemplate({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deletePriceListTemplate, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.priceListTemplate.toast.deleted")
      });
      queryClient.invalidateQueries(["price-list-templates"]);
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
    { header: t("page.priceListTemplate.table.name"), accessor: "name" },
    {
      header: t("page.priceListTemplate.table.tiers"),
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(item.tiers || []).map((tier, i) => (
            <span
              key={i}
              className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
              {tier.name}
            </span>
          ))}
          {(!item.tiers || item.tiers.length === 0) && (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </div>
      )
    },
    {
      header: t("page.priceListTemplate.table.description"),
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/edit-price-list-template?id=${item.id || item._id}`)}>
            <Edit size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => handleDelete(item)}>
            <Trash2 size={15} />
          </Button>
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
        <span className="text-primary font-semibold">{t("breadcrumb.priceListTemplate")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.priceListTemplate.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.priceListTemplate.list.description")}
          </p>
        </div>
        <Button
          data-tour="pricelist-add"
          onClick={() => navigate("/add-price-list-template")}
          className="gap-2">
          <Plus size={18} />
          {t("page.priceListTemplate.button.add")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-tour="pricelist-stat-total" className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.priceListTemplate.stats.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card data-tour="pricelist-stat-active" className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
        </Card>
        <Card data-tour="pricelist-stat-inactive" className="p-5">
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
          data-tour="pricelist-search"
          placeholder={t("page.priceListTemplate.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </div>

      <div data-tour="pricelist-table">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          emptyMessage={t("page.priceListTemplate.list.empty")}
          emptyIcon={TrendingUp}
          pagination={{ page, totalPages, total, onPageChange: setPage }}
        />
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.priceListTemplate.modal.deleteTitle")}
        description={t("page.priceListTemplate.modal.deleteDescription", {
          name: deleteTarget?.name || ""
        })}
        confirmText={t("page.priceListTemplate.modal.confirmDelete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PriceListTemplateList;
