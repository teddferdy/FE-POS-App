import React, { useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import {
  Search,
  AlertTriangle,
  Package,
  ShoppingBasket,
  Store,
  Filter
} from "lucide-react";
import { getLowStockAll } from "@/services/stock";
import { getAllLocation } from "@/services/location";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const LowStockAll = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: locationsData } = useQuery(["locations-all"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000
  });
  const locations = locationsData?.data || locationsData || [];

  const { data, isLoading } = useQuery(
    ["low-stock-all", page, limit, storeFilter, typeFilter, search],
    () =>
      getLowStockAll({
        page,
        limit,
        store: storeFilter !== "all" ? storeFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: search || undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;

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
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            setStoreFilter(v);
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
      <PageHeader
        title="Low Stock - Semua Toko"
        description="Daftar barang dengan stok menipis di seluruh toko"
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="Tidak ada barang dengan stok menipis"
        emptyIcon={AlertTriangle}
        toolbar={filters}
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: setPage,
          showingText: `Menampilkan ${items.length} dari ${total} data`
        }}
      />
    </div>
  );
};

export default LowStockAll;
