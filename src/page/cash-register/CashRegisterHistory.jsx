import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, Eye } from "lucide-react";
import { useCookies } from "react-cookie";
import { getCashRegisterHistory } from "@/services/cash-register";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/DataTable";

const statusCfg = {
  open: { label: "Buka", class: "bg-green-100 text-green-800" },
  closed: { label: "Tutup", class: "bg-gray-100 text-gray-800" }
};

const CashRegisterHistory = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const storeId = cookie?.activeStore || user?.store;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useQuery(
    ["cash-register-history", page, limit, storeId],
    () => getCashRegisterHistory({ page, limit, store: storeId }),
    { keepPreviousData: true, enabled: !!storeId }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const columns = [
    {
      header: "Dibuka Oleh",
      render: (item) => <span className="text-sm">{item.openedByData?.name || "-"}</span>
    },
    {
      header: "Dibuka",
      render: (item) => (
        <span className="text-xs">{new Date(item.openedAt).toLocaleString("id")}</span>
      )
    },
    {
      header: "Ditutup",
      render: (item) => (
        <span className="text-xs">
          {item.closedAt ? new Date(item.closedAt).toLocaleString("id") : "-"}
        </span>
      )
    },
    {
      header: "Saldo Awal",
      align: "right",
      render: (item) => (
        <span className="font-mono text-sm">
          Rp {parseInt(item.openingBalance).toLocaleString("id")}
        </span>
      )
    },
    {
      header: "Penjualan",
      align: "right",
      render: (item) => (
        <span className="font-mono text-sm">
          Rp {parseInt(item.totalSales || 0).toLocaleString("id")}
        </span>
      )
    },
    {
      header: "Status",
      align: "center",
      render: (item) => {
        const sc = statusCfg[item.status] || statusCfg.closed;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {sc.label}
          </span>
        );
      }
    },
    {
      header: "Aksi",
      align: "right",
      render: (item) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={() => navigate(`/cash-register/current?id=${item.id}`)}>
          <Eye size={15} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/cash-register/current")}
          className="hover:text-foreground">
          Kasir
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Riwayat</span>
      </nav>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Kasir</h1>
          <p className="text-sm text-muted-foreground mt-1">Riwayat buka/tutup kasir</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/cash-register/current")}
          className="shrink-0 gap-2">
          <ArrowLeft size={16} /> Kembali
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="Tidak ada riwayat kasir"
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </div>
  );
};

export default CashRegisterHistory;
