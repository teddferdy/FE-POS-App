import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Tags, Gift, Eye } from "lucide-react";
import { getAllDiscount, deleteDiscount } from "@/services/discount";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StoreFilter from "@/components/ui/StoreFilter";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";
import NoStore from "@/components/ui/NoStore";
import { canAccess } from "@/utils/permission";

const PROMO_TYPE_LABELS = {
  bogo: "BOGO",
  bundling: "Bundling",
  happyHour: "Happy Hour",
  category: "Kategori"
};

const getPromoLabel = (item) => {
  const promoType = item.conditions?.promoType;
  if (promoType && PROMO_TYPE_LABELS[promoType]) return PROMO_TYPE_LABELS[promoType];
  return item.type === "percent"
    ? "Persentase"
    : item.type === "nominal"
      ? "Nominal"
      : item.type || "-";
};

const DiscountList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [storeFilter, setStoreFilter] = useState(cookie?.activeStore || "");

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/discount";
  const locationParam = isSuperAdmin ? (storeFilter && storeFilter !== "all" ? storeFilter : "") : user?.store;

  const { data: locData } = useQuery(["locations"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000
  });
  const locationMap = React.useMemo(() => {
    const map = {};
    if (locData?.data)
      locData.data.forEach((l) => {
        map[l.id] = l;
      });
    return map;
  }, [locData]);

  const { data, isLoading } = useQuery(
    ["discounts", page, limit, search, storeFilter],
    () => getAllDiscount({ location: locationParam, page, limit, statusDiscount: "" }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteDiscount, {
    onSuccess: () => {
      toast.success(t("page.discount.list.toast.success"), {
        description: t("page.discount.list.toast.successDescription")
      });
      queryClient.invalidateQueries(["discounts"]);
    },
    onError: (err) => {
      toast.error(t("page.discount.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const discounts = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const statsFromBE = data?.stats || {};
  const statsTotal = statsFromBE.total || total;
  const activeCount = statsFromBE.active ?? discounts.filter((d) => d.status === "active").length;
  const draftCount = statsFromBE.draft ?? discounts.filter((d) => d.status === "draft").length;
  const inactiveCount =
    statsFromBE.inactive ??
    discounts.filter((d) => d.status !== "active" && d.status !== "draft").length;

  const handleDelete = (discount) => {
    setDeleteTarget(discount);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const columns = [
    {
      header: t("page.discount.table.name"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            <Tags size={14} />
          </div>
          <span className="font-medium text-foreground">{item.name || "-"}</span>
        </div>
      )
    },
    { header: t("page.discount.table.type"), render: (item) => getPromoLabel(item) },
    {
      header: t("page.discount.table.value"),
      render: (item) => {
        const cond = item.conditions || {};
        if (cond.promoType === "category" || cond.promoType === "happyHour")
          return `${cond.discountPercent || item.value}%`;
        if (item.type === "percent") return `${item.value}%`;
        return `Rp${item.value?.toLocaleString("id-ID") || item.value}`;
      }
    },
    {
      header: "Code",
      render: (item) => <span className="font-mono text-xs">{item.code || "-"}</span>
    },
    {
      header: t("page.discount.table.store"),
      render: (item) => {
        if (!item.store) return <span className="text-xs text-muted-foreground">Semua Toko</span>;
        const loc = locationMap[item.store];
        return <span className="text-xs">{loc?.name || `Store #${item.store}`}</span>;
      }
    },
    {
      header: t("page.discount.table.status"),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : item.status === "draft"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {item.status === "active"
            ? t("page.discount.list.active")
            : item.status === "draft"
              ? t("page.discount.list.draft")
              : t("page.discount.list.inactive")}
        </span>
      )
    },
    {
      header: t("page.discount.table.validity"),
      render: (item) => `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
    },
    {
      header: t("page.discount.table.createdDate"),
      render: (item) => formatDate(item.createdAt)
    },
    {
      header: t("page.discount.table.createdBy"),
      render: (item) => item.createdByUser?.fullName || item.createdBy || "-"
    },
    {
      header: t("page.discount.table.modifiedDate"),
      render: (item) => formatDate(item.updatedAt)
    },
    {
      header: t("page.discount.table.modifiedBy"),
      render: (item) => item.modifiedByUser?.fullName || item.modifiedBy || "-"
    },
    {
      header: t("page.discount.table.actions"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate(`/detail-discount?id=${item.id || item._id}`)}>
            <Eye size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-discount?id=${item.id || item._id}`)}>
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
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.discount.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.discount.list.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.discount.list.description")}
            </p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-discount")} className="gap-2">
              <Plus size={18} />
              {t("page.discount.button.add")}
            </Button>
          )}
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 && <NoStore />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t("page.discount.list.total")}
          value={statsTotal}
          icon="local_offer"
          variant="default"
          subtitle={t("page.discount.list.totalBadge", { count: discounts.length })}
        />
        <StatCard
          label={t("page.discount.list.active")}
          value={activeCount}
          icon="check_circle"
          variant="active"
          subtitle={`${statsTotal > 0 ? Math.round((activeCount / statsTotal) * 100) : 0}%`}
        />
        <StatCard
          label={t("common.draft")}
          value={draftCount}
          icon="edit_note"
          variant="draft"
          subtitle={`${statsTotal > 0 ? Math.round((draftCount / statsTotal) * 100) : 0}%`}
        />
        <StatCard
          label={t("page.discount.list.inactive")}
          value={inactiveCount}
          icon="cancel"
          variant="inactive"
          subtitle={`${statsTotal > 0 ? Math.round((inactiveCount / statsTotal) * 100) : 0}%`}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t("page.discount.list.search")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10"
          />
        </div>
        <StoreFilter
          locations={locData?.data || []}
          value={storeFilter}
          onChange={(v) => { setStoreFilter(v); setPage(1); }}
          isSuperAdmin={isSuperAdmin}
          t={t}
        />
      </div>

      <div>
        <DataTable
          columns={columns}
          data={discounts}
          isLoading={isLoading}
          emptyMessage={t("page.discount.list.empty")}
          emptyIcon={Gift}
          pagination={{ page, totalPages, total, onPageChange: setPage }}
        />
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.discount.modal.deleteTitle")}
        description={t("page.discount.modal.deleteDesc", { name: deleteTarget?.name || "" })}
        confirmText={t("page.discount.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default DiscountList;
