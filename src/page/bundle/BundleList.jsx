import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  Zap,
  XCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { getBundles, deleteBundle } from "@/services/productBundle";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { TipsCard } from "@/components/ui/tips-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const BundleList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: locData } = useQuery(
    ["locations-bundle"],
    () => getAllLocation("active"),
    { enabled: isSuperAdmin }
  );

  const { data, isLoading, isError, refetch } = useQuery(
    ["bundles", page, limit, search, storeFilter, statusFilter],
    () =>
      getBundles({
        page,
        limit,
        store: storeFilter !== "all" ? storeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search || undefined
      })
  );

  const deleteMutation = useMutation(deleteBundle, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("common.deleteSuccess")
      });
      queryClient.invalidateQueries(["bundles"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const items = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const stats = data?.data?.stats || {};

  const statCards = [
    {
      label: t("page.bundle.stats.total"),
      value: String(stats.total ?? 0),
      icon: "package_2",
      variant: "default"
    },
    {
      label: t("page.bundle.stats.active"),
      value: String(stats.active ?? 0),
      icon: "check_circle",
      variant: "active"
    },
    {
      label: t("page.bundle.stats.draft"),
      value: String(stats.draft ?? 0),
      icon: "edit_note",
      variant: "draft"
    },
    {
      label: t("page.bundle.stats.inactive"),
      value: String(stats.inactive ?? 0),
      icon: "block",
      variant: "inactive"
    }
  ];

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("common.active") },
    { value: "draft", label: t("common.draft") },
    { value: "inactive", label: t("common.inactive") }
  ];

  const statusBadge = (status) => {
    const map = {
      active: {
        bg: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
        dot: "bg-green-500",
        label: t("common.active")
      },
      draft: {
        bg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400",
        dot: "bg-slate-500",
        label: t("common.draft")
      },
      inactive: {
        bg: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
        dot: "bg-red-500",
        label: t("common.inactive")
      }
    };
    return map[status] || map.draft;
  };

  const formatPrice = (val) =>
    `Rp${Number(val || 0).toLocaleString("id-ID")}`;

  const columns = [
    {
      header: "No",
      render: (_row, idx) => String((page - 1) * limit + idx + 1),
      align: "center"
    },
    {
      header: t("page.bundle.table.name"),
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.image ? (
            <img
              src={row.image}
              alt={row.name}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
              <Package size={14} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{row.name}</p>
            <p className="text-[10px] text-muted-foreground">{row.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: t("page.bundle.table.items"),
      render: (row) => (
        <span className="text-sm font-medium">
          {row.items?.length || 0} {t("page.bundle.table.itemsLabel")}
        </span>
      )
    },
    {
      header: t("page.bundle.table.originalPrice"),
      render: (row) => (
        <span className="text-sm line-through text-muted-foreground">
          {formatPrice(row.originalPrice)}
        </span>
      ),
      align: "right"
    },
    {
      header: t("page.bundle.table.bundlePrice"),
      render: (row) => (
        <span className="text-sm font-semibold text-green-600">
          {formatPrice(row.bundlePrice)}
        </span>
      ),
      align: "right"
    },
    {
      header: t("page.bundle.table.discount"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
          <Zap size={10} />
          {row.discountPercentage > 0 ? `${row.discountPercentage}%` : "-"}
        </span>
      )
    },
    {
      header: t("common.status"),
      render: (row) => {
        const s = statusBadge(row.status);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        );
      }
    },
    {
      header: t("common.action"),
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/bundle/${row.id}`)}>
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/bundle/edit/${row.id}`)}>
            <Edit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row)}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder={t("page.bundle.searchPlaceholder")}
        isLoading={isLoading}
      />
      <Select
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}>
        <SelectTrigger className="w-36 h-9 text-sm">
          <SelectValue placeholder={t("common.status")} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() =>
              navigate(
                isSuperAdmin ? "/dashboard-super-admin" : "/dashboard-admin"
              )
            }
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("sidebar.bundle")}
          </span>
        </nav>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.bundle.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.bundle.description")}
          </p>
        </div>
        <Button
          onClick={() => navigate("/bundle/add")}
          className="gap-2">
          <Plus size={16} />
          {t("page.bundle.addButton")}
        </Button>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                <StatCard {...card} />
              </div>
            ))}
          </div>

          <TipsCard
            variant="info"
            title={t("tips.bundleTitle")}
            tips={[
              t("page.bundle.tip1"),
              t("page.bundle.tip2"),
              t("page.bundle.tip3")
            ]}
          />

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <DataTable
              columns={columns}
              data={items}
              isLoading={isLoading}
              emptyMessage={t("page.bundle.empty")}
              emptyIcon={Package}
              toolbar={filters}
              pagination={{
                page,
                totalPages,
                total,
                onPageChange: setPage,
                showingText: `Menampilkan ${items.length} dari ${total} data`,
                pageSize: limit,
                onPageSizeChange: (v) => {
                  setLimit(v);
                  setPage(1);
                }
              }}
            />
          )}
        </>
      )}

      <Modal
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        type="confirm"
        title={t("common.deleteConfirmTitle")}
        description={t("common.deleteConfirmDesc", { name: deleteTarget?.name || "" })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        loading={deleteMutation.isLoading}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
      />
    </div>
  );
};

export default BundleList;
