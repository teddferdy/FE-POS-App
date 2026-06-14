import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Wallet, Search } from "lucide-react";
import { getAllPayments } from "@/services/purchase-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";

const PurchasePaymentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useQuery(
    ["purchase-payments", page, limit],
    () => getAllPayments({ page, limit }),
    { keepPreviousData: true }
  );

  const payments = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const totalAmount = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const columns = [
    {
      header: "Tanggal",
      render: (p) => (
        <span className="text-muted-foreground">
          {p.paymentDate
            ? new Date(p.paymentDate).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "-"}
        </span>
      )
    },
    {
      header: "Supplier",
      render: (p) => p.supplierData?.name || "-"
    },
    {
      header: "No. PO",
      render: (p) => (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/purchase-order/detail?id=${p.purchaseOrderData?.id}`)}>
          {p.purchaseOrderData?.orderNumber || `PO-${p.purchaseOrder}`}
        </span>
      )
    },
    {
      header: "Jumlah",
      render: (p) => (
        <span className="font-medium">Rp {Number(p.amount).toLocaleString("id-ID")}</span>
      )
    },
    {
      header: "Metode",
      render: (p) => {
        const labels = { cash: "Tunai", transfer: "Transfer", giro: "Giro", other: "Lainnya" };
        return <span className="text-sm">{labels[p.paymentMethod] || p.paymentMethod || "-"}</span>;
      }
    },
    {
      header: "Referensi",
      render: (p) => <span className="text-sm text-muted-foreground">{p.reference || "-"}</span>
    },
    {
      header: "Catatan",
      render: (p) => (
        <span className="text-sm text-muted-foreground max-w-[150px] block truncate">
          {p.notes || "-"}
        </span>
      )
    },
    {
      header: "Aksi",
      render: (p) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/purchase-order/detail?id=${p.purchaseOrderData?.id || p.purchaseOrder}`)}>
          Detail
        </Button>
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
        <span className="text-primary font-semibold">Riwayat Pembayaran</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/purchase-order")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Riwayat Pembayaran</h1>
            <p className="text-sm text-muted-foreground mt-1">Semua pembayaran purchase order</p>
          </div>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm">
          <Wallet size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">Total Pembayaran:</span>
          <span className="font-bold text-lg">
            Rp {Number(totalAmount).toLocaleString("id-ID")}
          </span>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        emptyMessage="Belum ada pembayaran"
        emptyIcon={Wallet}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </div>
  );
};

export default PurchasePaymentList;
