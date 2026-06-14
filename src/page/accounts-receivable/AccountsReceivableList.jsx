import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Receipt, Search, Filter, Plus, Wallet } from "lucide-react";
import { getARList, getARAging, recordARPayment } from "@/services/accounts-receivable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import { toast } from "sonner";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const STATUS_LABELS = {
  UNPAID: { label: "Belum Dibayar", color: "bg-yellow-100 text-yellow-800" },
  PARTIAL: { label: "Sebagian", color: "bg-blue-100 text-blue-800" },
  PAID: { label: "Lunas", color: "bg-green-100 text-green-800" },
  OVERDUE: { label: "Jatuh Tempo", color: "bg-red-100 text-red-800" }
};

const AccountsReceivableList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const { data, isLoading } = useQuery(
    ["ar-list", page, limit, statusFilter],
    () => getARList({ page, limit, status: statusFilter || undefined }),
    { keepPreviousData: true }
  );

  const { data: agingData } = useQuery(["ar-aging"], () => getARAging(), {
    refetchInterval: 60000
  });

  const payMutation = useMutation(
    ({ id, payload }) => recordARPayment(id, payload),
    {
      onSuccess: () => {
        toast.success("Pembayaran berhasil dicatat");
        setPayModal(null);
        setPayAmount("");
      },
      onError: (err) => toast.error(err?.message || "Gagal mencatat pembayaran")
    }
  );

  const arList = data?.data || [];
  const pagination = data?.pagination || {};
  const agingBuckets = agingData?.data?.buckets || {};
  const grandTotal = agingData?.data?.grandTotal || 0;

  const totalOutstanding = arList.reduce((s, ar) => s + Number(ar.outstandingAmount || 0), 0);

  const columns = [
    {
      header: "Invoice",
      render: (ar) => (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/accounts-receivable/detail?id=${ar.id}`)}>
          {ar.invoiceNo || `AR-${ar.id}`}
        </span>
      )
    },
    {
      header: "Pelanggan",
      render: (ar) => ar.customerName || ar.orderData?.customerName || "-"
    },
    {
      header: "Total",
      render: (ar) => formatCurrencyRupiah(ar.totalAmount || 0)
    },
    {
      header: "Terbayar",
      render: (ar) => formatCurrencyRupiah(ar.paidAmount || 0)
    },
    {
      header: "Sisa",
      render: (ar) => (
        <span className="font-semibold">{formatCurrencyRupiah(ar.outstandingAmount || 0)}</span>
      )
    },
    {
      header: "Jatuh Tempo",
      render: (ar) =>
        ar.dueDate
          ? new Date(ar.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
          : "-"
    },
    {
      header: "Status",
      render: (ar) => {
        const st = ar.status === 'OVERDUE' || (ar.status !== 'PAID' && ar.overdueDays > 0)
          ? STATUS_LABELS.OVERDUE
          : STATUS_LABELS[ar.status] || STATUS_LABELS.UNPAID;
        return (
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${st.color}`}>
            {st.label}
            {ar.overdueDays > 0 && ` (+${ar.overdueDays}h)`}
          </span>
        );
      }
    },
    {
      header: "Aksi",
      render: (ar) =>
        ar.status !== "PAID" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPayModal(ar);
              setPayAmount(String(ar.outstandingAmount || 0));
            }}>
            <Wallet size={14} className="mr-1" /> Bayar
          </Button>
        )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Piutang (AR)</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard-super-admin")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Piutang (Accounts Receivable)</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola tagihan piutang customer</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Piutang</p>
          <p className="text-lg font-bold">{formatCurrencyRupiah(grandTotal)}</p>
        </Card>
        {Object.entries(agingBuckets).map(([key, bucket]) => (
          <Card key={key} className="p-4">
            <p className="text-xs text-muted-foreground">{bucket.label}</p>
            <p className="text-lg font-bold">{formatCurrencyRupiah(bucket.total)}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {["", "UNPAID", "PARTIAL", "PAID", "OVERDUE"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}>
            {s ? (STATUS_LABELS[s]?.label || s) : "Semua"}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={arList}
        isLoading={isLoading}
        emptyMessage="Belum ada piutang"
        emptyIcon={Receipt}
        pagination={{ page, totalPages: pagination.totalPages || 1, total: pagination.total || 0, onPageChange: setPage }}
      />

      {payModal && (
        <Modal
          open={!!payModal}
          onOpenChange={() => { setPayModal(null); setPayAmount(""); }}
          title="Catat Pembayaran"
          description={`Invoice: ${payModal.invoiceNo} | Sisa: ${formatCurrencyRupiah(payModal.outstandingAmount)}`}
          confirmText="Simpan"
          onConfirm={() => {
            if (!payAmount || Number(payAmount) <= 0) {
              toast.error("Masukkan jumlah pembayaran");
              return;
            }
            if (Number(payAmount) > Number(payModal.outstandingAmount)) {
              toast.error("Jumlah melebihi sisa piutang");
              return;
            }
            payMutation.mutate({ id: payModal.id, payload: { amount: payAmount } });
          }}
          loading={payMutation.isLoading}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Jumlah Pembayaran</label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Masukkan jumlah"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AccountsReceivableList;
