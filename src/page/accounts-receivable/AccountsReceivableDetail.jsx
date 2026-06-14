import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, Receipt, Wallet, Clock, AlertCircle } from "lucide-react";
import { getARById } from "@/services/accounts-receivable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DataTable from "@/components/ui/DataTable";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const STATUS_MAP = {
  UNPAID: { label: "Belum Dibayar", color: "bg-yellow-100 text-yellow-800" },
  PARTIAL: { label: "Sebagian Dibayar", color: "bg-blue-100 text-blue-800" },
  PAID: { label: "Lunas", color: "bg-green-100 text-green-800" },
  OVERDUE: { label: "Jatuh Tempo", color: "bg-red-100 text-red-800" }
};

const AccountsReceivableDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["ar-detail", id],
    () => getARById(id),
    { enabled: !!id }
  );

  if (isLoading) return <Loading fullscreen size="lg" label="Memuat data..." />;
  const ar = data?.data;
  if (!ar) return <p className="text-center text-muted-foreground py-12">Data tidak ditemukan</p>;

  const statusInfo = STATUS_MAP[ar.status] || STATUS_MAP.UNPAID;
  const payments = ar.payments || [];
  const isOverdue = ar.overdueDays > 0 && ar.status !== "PAID";

  const paymentColumns = [
    { header: "Tanggal", render: (p) => new Date(p.paymentDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
    { header: "Jumlah", render: (p) => formatCurrencyRupiah(p.amount) },
    { header: "Metode", render: (p) => p.paymentMethod || "-" },
    { header: "Keterangan", render: (p) => p.note || "-" }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/accounts-receivable")} className="hover:text-foreground transition-colors">
          Piutang (AR)
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Detail</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts-receivable")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{ar.invoiceNo || `AR-${ar.id}`}</h1>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${statusInfo.color}`}>
              {isOverdue ? STATUS_MAP.OVERDUE.label : statusInfo.label}
              {ar.overdueDays > 0 && ` (terlambat ${ar.overdueDays} hari)`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Receipt size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Tagihan</p>
            <p className="text-lg font-bold">{formatCurrencyRupiah(ar.totalAmount)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <Wallet size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
            <p className="text-lg font-bold">{formatCurrencyRupiah(ar.paidAmount)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOverdue ? "bg-red-50" : "bg-yellow-50"}`}>
            {isOverdue ? <AlertCircle size={20} className="text-red-600" /> : <Clock size={20} className="text-yellow-600" />}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sisa Piutang</p>
            <p className="text-lg font-bold">{formatCurrencyRupiah(ar.outstandingAmount)}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Informasi Invoice</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">No. Invoice</span><span>{ar.invoiceNo || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Invoice</span><span>{ar.invoiceDate ? new Date(ar.invoiceDate).toLocaleDateString("id-ID") : "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Jatuh Tempo</span><span>{ar.dueDate ? new Date(ar.dueDate).toLocaleDateString("id-ID") : "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{ar.customerName || ar.orderData?.customerName || "-"}</span></div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Informasi Order</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">No. Order</span><span>{ar.orderNumber || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Tipe Order</span><span>{ar.orderData?.orderType || ar.orderType || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Status Order</span><span>{ar.orderData?.status || "-"}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Metode Pembayaran</span><span>{ar.orderData?.paymentMethod || ar.paymentMethod || "-"}</span></div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Riwayat Pembayaran ({payments.length})</h3>
        {payments.length > 0 ? (
          <DataTable
            columns={paymentColumns}
            data={payments}
            isLoading={false}
            emptyMessage="Belum ada pembayaran"
            emptyIcon={Wallet}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada pembayaran</p>
        )}
      </Card>

      {ar.notes && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Catatan</h3>
          <p className="text-sm text-muted-foreground">{ar.notes}</p>
        </Card>
      )}
    </div>
  );
};

export default AccountsReceivableDetail;
