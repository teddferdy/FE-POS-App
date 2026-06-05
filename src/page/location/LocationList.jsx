import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit, Trash2, Eye, Store, Map } from "lucide-react";
import { toast } from "sonner";
import { getAllLocationTable, deleteLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";

const LocationList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["locations", page, limit, statusFilter, categoryFilter],
    () =>
      getAllLocationTable({
        page,
        limit,
        statusLocation: statusFilter,
        category: categoryFilter
      }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteLocation, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.location.toast.success") });
      queryClient.invalidateQueries(["locations"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err.message });
    }
  });

  const locations = data?.data || data?.locations || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;
  const categories = data?.categories || [];

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !loc.name?.toLowerCase().includes(q) &&
        !loc.address?.toLowerCase().includes(q) &&
        !loc.storeId?.toLowerCase().includes(q) &&
        !loc.phoneNumber?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (statusFilter !== "all") {
      const matchesStatus =
        statusFilter === "active"
          ? loc.isActive || loc.status === "active"
          : !(loc.isActive || loc.status === "active");
      if (!matchesStatus) return false;
    }

    return true;
  });

  const columns = [
    {
      header: t("page.location.table.storeId"),
      render: (loc) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
          {loc.storeId || loc.code || `ST-${String(loc.id).padStart(3, "0")}`}
        </span>
      )
    },
    {
      header: t("page.location.table.image"),
      render: (loc) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
          {loc.image ? (
            <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Store size={16} />
            </div>
          )}
        </div>
      )
    },
    {
      header: t("page.location.table.storeName"),
      render: (loc) => (
        <div>
          <p className="font-medium text-foreground">{loc.name}</p>
          <p className="text-xs text-muted-foreground">
            {loc.description || loc.type || "Main Branch"}
          </p>
        </div>
      )
    },
    {
      header: t("page.location.table.category"),
      render: (loc) => (
        <span className="text-sm font-medium text-foreground text-capitalize">
          {loc.category || "Main Branch"}
        </span>
      )
    },
    {
      header: t("page.location.table.address"),
      render: (loc) => (
        <p className="text-sm text-muted-foreground max-w-[180px] truncate">{loc.address}</p>
      )
    },
    {
      header: t("page.location.table.phoneNumber"),
      render: (loc) => (
        <span className="font-mono text-xs text-foreground">
          {loc.phoneNumber || loc.phone || "-"}
        </span>
      )
    },
    {
      header: t("page.location.table.status"),
      render: (loc) => {
        const isActive = loc.isActive || loc.status === "active";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}>
            {isActive ? t("common.active") : t("common.inactive")}
          </span>
        );
      }
    },
    {
      header: t("common.actions"),
      align: "right",
      render: (loc) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/detail-location?id=${loc.id || loc._id}`)}>
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/edit-location?id=${loc.id || loc._id}`)}>
            <Edit size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => handleDelete(loc.id || loc._id)}>
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-location" className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          { label: t("page.location.list.title"), i18nKey: "page.location.list.title" }
        ]}
        title={t("page.location.list.title")}
        description={t("page.location.list.description")}>
        <Button onClick={() => navigate("/add-location")} className="shrink-0">
          <Plus size={18} />
          {t("breadcrumb.add")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.location.stats.total")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {(data?.stats?.total ?? data?.total ?? 0).toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-primary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">store</span>
              {t("page.location.stats.totalSub")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">store</span>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.location.stats.active")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {(data?.stats?.active ?? 0).toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {(data?.stats?.total ?? 0) > 0
                ? Math.round(((data?.stats?.active ?? 0) / (data?.stats?.total ?? 1)) * 100)
                : 0}
              % {t("page.location.stats.activeSub")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
        </div>
        <div className="bg-red-600 dark:bg-red-900 p-6 rounded-xl shadow-sm flex justify-between items-center group hover:bg-red-700 dark:hover:bg-red-800 transition-colors hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-red-100 uppercase tracking-wider mb-1">
              {t("page.location.stats.inactive")}
            </p>
            <h3 className="text-3xl font-bold text-white">
              {((data?.stats?.total ?? 0) - (data?.stats?.active ?? 0)).toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-red-100 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">cancel</span>
              {t("page.location.stats.inactiveSub")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-700 dark:bg-red-950 flex items-center justify-center text-white group-hover:bg-red-800 dark:group-hover:bg-red-950/80 transition-colors group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">cancel</span>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.location.stats.cities")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {(data?.stats?.cities ?? 0).toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-tertiary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">location_city</span>
              {t("page.location.stats.citiesSub")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">location_city</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLocations}
        isLoading={isLoading}
        emptyMessage={t("page.location.list.empty")}
        toolbar={
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder={t("page.location.list.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {t("common.status")}:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="all">{t("common.all")}</option>
                  <option value="active">{t("common.active")}</option>
                  <option value="inactive">{t("common.inactive")}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {t("common.category")}:
                </span>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="all">{t("common.all")}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => navigate("/store-geospatial")}>
                <Map size={14} />
                {t("page.location.button.viewMap")}
              </Button>
            </div>
          </div>
        }
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: setPage
        }}
      />

      {/* Map Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="md:col-span-2 bg-card rounded-xl border border-border p-6 h-48 relative overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => navigate("/store-geospatial")}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all" />
          <div className="relative z-10 text-center">
            <Map size={32} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              {t("page.location.button.viewMap")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.location.button.viewMapDescription")}
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              {t("page.location.button.viewMap")}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.confirmDelete")}
        confirmText={t("common.delete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default LocationList;
