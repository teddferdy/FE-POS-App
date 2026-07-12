import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NoStore from "@/components/ui/NoStore";
import { Search, AlertTriangle, Package, ShoppingBasket, Store, Filter } from "lucide-react";
import { getLowStockAll } from "@/services/stock";
import { getAllLocation } from "@/services/location";
import DataTable from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import AbortController from "@/components/organism/abort-controller";
import { TipsCard } from "@/components/ui/tips-card";
import StatCard from "@/components/ui/StatCard";
import { useSidebar } from "@/components/layout/DashboardLayout";

const LowStockAll = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const sidebarCollapsed = useSidebar();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: locData } = useQuery(["locations-low-stock-all"], () => getAllLocation(), {
    
    enabled: isSuperAdmin
  });
  const locations = locData?.data || [];

  const { data, isLoading, isError, refetch } = useQuery(
    ["low-stock-all", page, limit, storeFilter, typeFilter, search],
    () =>
      getLowStockAll({
        page,
        limit,
        store: storeFilter !== "all" ? storeFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: search || undefined
      }),
  );

  const items = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const stats = data?.data?.stats || {};
  const statCards = [
    {
      label: t("page.lowStockAll.totalLowStock"),
      value: String(stats.totalLowStock ?? 0),
      icon: "inventory_2",
      variant: "default"
    },
    {
      label: t("page.lowStockAll.products"),
      value: String(stats.totalProducts ?? 0),
      icon: "package_2",
      variant: "active"
    },
    {
      label: t("page.lowStockAll.ingredients"),
      value: String(stats.totalIngredients ?? 0),
      icon: "nutrition",
      variant: "draft"
    },
    {
      label: t("page.lowStockAll.storesAffected"),
      value: String(stats.totalStores ?? 0),
      icon: "store",
      variant: "default"
    },
    {
      label: t("page.lowStockAll.outOfStock"),
      value: String(stats.totalOutOfStock ?? 0),
      icon: "block",
      variant: "inactive"
    }
  ];

  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return {
        label: "Habis",
        cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
      };
    }
    return {
      label: "Menipis",
      cls: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
    };
  };

  const columns = [
    {
      header: "No",
      render: (_row, idx) => String((page - 1) * limit + idx + 1),
      align: "center"
    },
    {
      header: "Toko",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Store size={14} className="text-muted-foreground shrink-0" />
          <span className="font-medium">{row.storeName || "Unknown"}</span>
        </div>
      )
    },
    {
      header: "Nama",
      accessor: "name"
    },
    {
      header: "Tipe",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.type === "product" ? (
            <Package size={14} className="text-destructive" />
          ) : (
            <ShoppingBasket size={14} className="text-orange-500" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider">{row.type}</span>
        </div>
      )
    },
    {
      header: "Stok",
      render: (row) => (
        <span className="font-semibold font-mono">{Number(row.stock).toLocaleString("id-ID")}</span>
      ),
      align: "right"
    },
    {
      header: "Min. Stok",
      render: (row) => (
        <span className="text-muted-foreground font-mono">
          {Number(row.minStock).toLocaleString("id-ID")}
        </span>
      ),
      align: "right"
    },
    {
      header: "Satuan",
      render: (row) => row.unit || "pcs"
    },
    {
      header: "Status",
      render: (row) => {
        const status = getStockStatus(row.stock);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.cls}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${row.stock <= 0 ? "bg-red-500" : "bg-orange-500"}`}
            />
            {status.label}
          </span>
        );
      }
    }
  ];

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-56">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Cari nama barang..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Store size={16} className="text-muted-foreground shrink-0" />
        <Select
          value={storeFilter}
          onValueChange={(v) => {
            setGlobalStoreFilter(v);
            setPage(1);
          }}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Semua Toko" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Toko</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={String(loc.id)}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted-foreground shrink-0" />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="product">Produk</SelectItem>
            <SelectItem value="ingredient">Bahan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

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
          <span className="text-primary font-semibold">{t("sidebar.lowStockAll")}</span>
        </nav>
      </div>

      <div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("sidebar.lowStockAll")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.lowStock.description")}</p>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            {statCards.map((card, i) => (
              <div
                key={i}
                style={{
                  width: `calc((100% - ${sidebarCollapsed ? 4 : 2}rem) / ${sidebarCollapsed ? 5 : 3})`,
                  transition: "width 300ms ease"
                }}>
                <StatCard {...card} />
              </div>
            ))}
          </div>

          <TipsCard
            variant="warning"
            title={t("tips.lowStock")}
            tips={[
              t("page.lowStockAll.tip1"),
              t("page.lowStockAll.tip2"),
              t("page.lowStockAll.tip3"),
              t("page.lowStockAll.tip4")
            ]}
          />

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div>
              <div>
                <DataTable
                  columns={columns}
                  data={items}
                  isLoading={isLoading}
                  emptyMessage={t("page.lowStock.empty")}
                  emptyIcon={AlertTriangle}
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LowStockAll;
