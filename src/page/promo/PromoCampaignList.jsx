import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import {
  Megaphone,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Power,
  Pause,
  Play,
  Tag,
  Percent,
  Gift,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  getCampaigns,
  getCampaignStats,
  updateCampaignStatus,
  deleteCampaign
} from "@/services/promo";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import StoreFilter from "@/components/ui/StoreFilter";
import Modal from "@/components/organism/modal";
import { canAccess } from "@/utils/permission";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" }
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "happy_hour", label: "Happy Hour" },
  { value: "birthday", label: "Birthday" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
  { value: "spend_get", label: "Spend & Get" },
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" }
];

const statusBadge = (status) => {
  const map = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    expired: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const typeIcon = (type) => {
  const map = {
    happy_hour: Clock,
    birthday: Gift,
    buy_x_get_y: Tag,
    spend_get: Percent,
    manual: Megaphone,
    automatic: Power
  };
  return map[type] || Megaphone;
};

const PromoCampaignList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();

  const user = cookie?.user;
  const MENU_KEY = "/promo-list";

  const { data, isLoading, isFetching } = useQuery(
    ["promo-campaigns", page, limit, storeFilter, search, statusFilter, typeFilter],
    () =>
      getCampaigns({
        store: storeFilter === "all" ? "" : storeFilter,
        page,
        limit,
        search,
        status: statusFilter,
        type: typeFilter
      }),
    { retry: 1 }
  );

  const { data: statsData } = useQuery(
    ["promo-stats", storeFilter],
    () => getCampaignStats({ store: storeFilter === "all" ? "" : storeFilter }),
    { retry: 1 }
  );

  const statusMutation = useMutation(
    ({ id, status }) => updateCampaignStatus(id, { status }),
    {
      onSuccess: () => {
        toast.success(t("common.success"), {
          description: t("page.promo.toast.statusUpdated")
        });
        queryClient.invalidateQueries(["promo-campaigns"]);
        queryClient.invalidateQueries(["promo-stats"]);
      },
      onError: (err) => {
        toast.error(t("common.error"), {
          description: err?.response?.data?.message || err.message
        });
      }
    }
  );

  const deleteMutation = useMutation(deleteCampaign, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("common.deleteSuccess")
      });
      queryClient.invalidateQueries(["promo-campaigns"]);
      queryClient.invalidateQueries(["promo-stats"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const stats = statsData?.data || {};

  const columns = [
    {
      header: t("page.promo.list.name"),
      accessorKey: "name",
      cell: ({ row }) => {
        const Icon = typeIcon(row.original.type);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground">{row.original.name}</div>
              {row.original.code && (
                <div className="text-xs font-mono text-muted-foreground">{row.original.code}</div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: t("page.promo.list.type"),
      accessorKey: "type",
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.type?.replace("_", " ")}</span>
      )
    },
    {
      header: t("page.promo.list.discount"),
      accessorKey: "discountValue",
      cell: ({ row }) => {
        const type = row.original.discountType;
        const val = row.original.discountValue;
        if (type === "percentage") return <span className="font-semibold">{val}%</span>;
        if (type === "fixed") return <span className="font-semibold">Rp{val?.toLocaleString()}</span>;
        if (type === "free_item") return <span className="font-semibold">Free Item</span>;
        return <span className="font-semibold">{val}</span>;
      }
    },
    {
      header: t("page.promo.list.period"),
      accessorKey: "startDate",
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{new Date(row.original.startDate).toLocaleDateString()}</div>
          <div className="text-muted-foreground">to {new Date(row.original.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      header: t("page.promo.list.usage"),
      accessorKey: "currentUsage",
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-medium">{row.original.currentUsage || 0}</span>
          {row.original.maxUsageTotal && (
            <span className="text-muted-foreground"> / {row.original.maxUsageTotal}</span>
          )}
        </div>
      )
    },
    {
      header: t("page.promo.list.status"),
      accessorKey: "status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(row.original.status)}`}>
          {row.original.status?.toUpperCase()}
        </span>
      )
    },
    {
      header: t("common.action"),
      accessorKey: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/detail-promo?id=${item.id}`)}>
              <Eye size={14} />
            </Button>
            {canAccess(user, MENU_KEY, "edit") && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/edit-promo?id=${item.id}`)}>
                  <Edit size={14} />
                </Button>
                {item.status === "active" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-yellow-600"
                    onClick={() => statusMutation.mutate({ id: item.id, status: "paused" })}>
                    <Pause size={14} />
                  </Button>
                )}
                {item.status === "paused" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600"
                    onClick={() => statusMutation.mutate({ id: item.id, status: "active" })}>
                    <Play size={14} />
                  </Button>
                )}
                {item.status !== "cancelled" && item.status !== "expired" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={() => setDeleteTarget(item)}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          { i18nKey: "sidebar.promo" }
        ]}
        title={t("page.promo.list.title")}
        description={t("page.promo.list.description")}>
        {canAccess(user, MENU_KEY, "create") && (
          <Button onClick={() => navigate("/add-promo")}>
            <Plus size={16} className="mr-2" />
            {t("page.promo.list.addButton")}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("page.promo.stats.totalCampaigns")}
          value={stats.totalCampaigns || 0}
          icon={Megaphone}
          loading={isLoading}
        />
        <StatCard
          title={t("page.promo.stats.activeCampaigns")}
          value={stats.activeCampaigns || 0}
          icon={CheckCircle}
          loading={isLoading}
          className="border-green-200 dark:border-green-800"
        />
        <StatCard
          title={t("page.promo.stats.totalUsage")}
          value={stats.totalUsage || 0}
          icon={Tag}
          loading={isLoading}
        />
        <StatCard
          title={t("page.promo.stats.totalDiscount")}
          value={`Rp${(stats.totalDiscountGiven || 0).toLocaleString()}`}
          icon={Percent}
          loading={isLoading}
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("page.promo.list.searchPlaceholder")}
            className="w-full md:w-64"
          />
          <StoreFilter value={storeFilter} onChange={setGlobalStoreFilter} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          isFetching={isFetching}
          pagination={data?.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          emptyMessage={t("page.promo.list.empty")}
        />
      </div>

      {/* Delete Modal */}
      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.promo.modal.deleteTitle")}
        description={t("page.promo.modal.deleteDescription", { name: deleteTarget?.name })}
        confirmText={t("common.delete")}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default PromoCampaignList;
