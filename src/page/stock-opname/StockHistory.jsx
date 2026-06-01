import React, { useState } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllStockHistory } from "@/services/stock";
import { getAllProductTable } from "@/services/product";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import PageHeader from "@/components/ui/PageHeader";

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
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  } catch {
    return "-";
  }
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString("id-ID");
};

const StockHistory = () => {
  const [cookie] = useCookies();
  const user = cookie?.user;
  const role = user?.role || user?.type || "";

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [productFilter, setProductFilter] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchProduct] = useState("");

  const { data, isLoading } = useQuery(
    ["stock-history", page, limit, productFilter, referenceFilter, startDate, endDate],
    () =>
      getAllStockHistory({
        page,
        limit,
        product: productFilter || undefined,
        referenceType: referenceFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }),
    { keepPreviousData: true }
  );

  const { data: productsData } = useQuery(
    ["products-dropdown", searchProduct],
    () => getAllProductTable({ location: "", limit: 100, page: 1, statusProduct: "all" }),
    { keepPreviousData: true }
  );

  const histories = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const total = pagination.total || 0;
  const products = productsData?.data || productsData?.products || [];

  const referenceTypeOptions = [
    { value: "", label: "Semua Tipe" },
    { value: "purchase", label: "Pembelian" },
    { value: "sale", label: "Penjualan" },
    { value: "adjustment", label: "Penyesuaian" },
    { value: "opname", label: "Stok Opname" },
    { value: "return", label: "Retur" }
  ];

  const getChangeDisplay = (change) => {
    const num = Number(change);
    const cls = num >= 0 ? "text-green-600" : "text-red-600";
    const prefix = num >= 0 ? "+" : "";
    return (
      <span className={`font-semibold ${cls}`}>
        {prefix}
        {formatNumber(num)}
      </span>
    );
  };

  const getReferenceBadge = (type) => {
    const map = {
      purchase: "bg-blue-100 text-blue-700",
      sale: "bg-purple-100 text-purple-700",
      adjustment: "bg-amber-100 text-amber-700",
      opname: "bg-cyan-100 text-cyan-700",
      return: "bg-rose-100 text-rose-700"
    };
    const labels = {
      purchase: "Pembelian",
      sale: "Penjualan",
      adjustment: "Penyesuaian",
      opname: "Stok Opname",
      return: "Retur"
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${map[type] || "bg-gray-100 text-gray-700"}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: "Dashboard",
            href:
              role === "super_admin"
                ? "/dashboard-super-admin"
                : role === "admin"
                  ? "/dashboard-admin"
                  : "/home"
          },
          { label: "Inventory" },
          { label: "History Stok" }
        ]}
        title="History Stok"
        description="Riwayat perubahan stok produk secara real-time."
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Produk</label>
            <Combobox
              options={[
                { value: "", label: "Semua Produk" },
                ...products.map((p) => ({
                  value: String(p.id || p._id),
                  label: p.name || p.nameProduct
                }))
              ]}
              value={productFilter}
              onChange={(v) => {
                setProductFilter(v);
                setPage(1);
              }}
              placeholder="Semua Produk"
              searchPlaceholder="Cari produk..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Tipe Referensi
            </label>
            <Combobox
              options={referenceTypeOptions}
              value={referenceFilter}
              onChange={(v) => {
                setReferenceFilter(v);
                setPage(1);
              }}
              placeholder="Semua Tipe"
              searchPlaceholder="Cari tipe..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Dari Tanggal
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Sampai Tanggal
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-10"
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      ) : histories.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Belum ada history stok</p>
          <p className="text-sm mt-1">History akan muncul saat ada perubahan stok produk.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Sebelum</TableHead>
                  <TableHead className="text-right">Perubahan</TableHead>
                  <TableHead className="text-right">Sesudah</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(h.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {h.productData?.nameProduct || h.productName || "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatNumber(h.quantityBefore)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getChangeDisplay(h.quantityChange)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatNumber(h.quantityAfter)}
                    </TableCell>
                    <TableCell>{getReferenceBadge(h.referenceType)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {h.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Menampilkan 1-{Math.min(limit, histories.length)} dari {total} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistory;
