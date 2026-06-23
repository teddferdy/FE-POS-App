import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Receipt, Wallet } from "lucide-react";
import { getARList, getARAging, recordARPayment } from "@/services/accounts-receivable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import { TipsCard } from "@/components/ui/tips-card";
import Modal from "@/components/organism/modal";
import { toast } from "sonner";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";

const STATUS_LABELS = {
  UNPAID: { label: "Belum Dibayar", color: "bg-yellow-100 text-yellow-800" },
  PARTIAL: { label: "Sebagian", color: "bg-blue-100 text-blue-800" },
  PAID: { label: "Lunas", color: "bg-green-100 text-green-800" },
  OVERDUE: { label: "Jatuh Tempo", color: "bg-red-100 text-red-800" }
};

const statusLabelKeys = { UNPAID: "unpaid", PARTIAL: "partial", PAID: "paid", OVERDUE: "overdue" };

const AccountsReceivableList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const { data, isLoading, isError, refetch } = useQuery(
    ["ar-list", page, limit, statusFilter],
    () => getARList({ page, limit, status: statusFilter || undefined }),
    { keepPreviousData: true }
  );

  const { data: agingData } = useQuery(["ar-aging"], () => getARAging(), {
    refetchInterval: 60000
  });

  const payMutation = useMutation(({ id, payload }) => recordARPayment(id, payload), {
    onSuccess: () => {
      toast.success(t("page.accountsReceivable.list.toast.paymentSuccess"));
      setPayModal(null);
      setPayAmount("");
    },
    onError: (err) =>
      toast.error(err?.message || t("page.accountsReceivable.list.toast.paymentError"))
  });

  const arList = data?.data || [];
  const pagination = data?.pagination || {};
  const agingBuckets = agingData?.data?.buckets || {};
  const grandTotal = agingData?.data?.grandTotal || 0;

  // const totalOutstanding = arList.reduce((s, ar) => s + Number(ar.outstandingAmount || 0), 0);

  const columns = [
    {
      header: t("page.accountsReceivable.list.header.invoice"),
      render: (ar) => (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/accounts-receivable/detail?id=${ar.id}`)}>
          {ar.invoiceNo || `AR-${ar.id}`}
        </span>
      )
    },
    {
      header: t("page.accountsReceivable.list.header.pelanggan"),
      render: (ar) => ar.customerName || ar.orderData?.customerName || "-"
    },
    {
      header: t("page.accountsReceivable.list.header.total"),
      render: (ar) => formatCurrencyRupiah(ar.totalAmount || 0)
    },
    {
      header: t("page.accountsReceivable.list.header.terbayar"),
      render: (ar) => formatCurrencyRupiah(ar.paidAmount || 0)
    },
    {
      header: t("page.accountsReceivable.list.header.sisa"),
      render: (ar) => (
        <span className="font-semibold">{formatCurrencyRupiah(ar.outstandingAmount || 0)}</span>
      )
    },
    {
      header: t("page.accountsReceivable.list.header.jatuhTempo"),
      render: (ar) =>
        ar.dueDate
          ? new Date(ar.dueDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "-"
    },
    {
      header: t("page.accountsReceivable.list.header.status"),
      render: (ar) => {
        const rawStatus =
          ar.status === "OVERDUE" || (ar.status !== "PAID" && ar.overdueDays > 0)
            ? "OVERDUE"
            : ar.status || "UNPAID";
        const st = STATUS_LABELS[rawStatus] || STATUS_LABELS.UNPAID;
        return (
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${st.color}`}>
            {t(
              `page.accountsReceivable.list.status.${statusLabelKeys[rawStatus] || rawStatus.toLowerCase()}`
            )}
            {ar.overdueDays > 0 && ` (+${ar.overdueDays}h)`}
          </span>
        );
      }
    },
    {
      header: t("page.accountsReceivable.list.header.aksi"),
      render: (ar) =>
        ar.status !== "PAID" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPayModal(ar);
              setPayAmount(String(ar.outstandingAmount || 0));
            }}>
            <Wallet size={14} className="mr-1" /> {t("page.accountsReceivable.list.payButton")}
          </Button>
        )
    }
  ];

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
          <span className="text-primary font-semibold">
            {t("page.accountsReceivable.list.breadcrumb")}
          </span>
        </nav>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.accountsReceivable.list.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.accountsReceivable.list.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label={t("page.accountsReceivable.list.totalPiutang")} value={formatCurrencyRupiah(grandTotal)} icon="account_balance" variant="default" />
        {Object.entries(agingBuckets).map(([key, bucket]) => {
          const lk = key.toLowerCase();
          const icon = lk.includes("paid") ? "check_circle" : lk.includes("overdue") ? "cancel" : lk.includes("unpaid") ? "edit_note" : lk.includes("partial") ? "schedule" : "account_balance";
          const variant = lk.includes("paid") ? "active" : lk.includes("overdue") ? "inactive" : lk.includes("unpaid") ? "draft" : "default";
          return <StatCard key={key} label={bucket.label} value={formatCurrencyRupiah(bucket.total)} icon={icon} variant={variant} />;
        })}
      </div>

      <div className="flex items-center gap-2">
        {["", "UNPAID", "PARTIAL", "PAID", "OVERDUE"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}>
            {s
              ? t(`page.accountsReceivable.list.status.${statusLabelKeys[s] || s}`)
              : t("page.accountsReceivable.list.filterAll")}
          </button>
        ))}
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={arList}
            isLoading={isLoading}
            emptyMessage={t("page.accountsReceivable.list.emptyMessage")}
            emptyIcon={Receipt}
            pagination={{
              page,
              totalPages: pagination.totalPages || 1,
              total: pagination.total || 0,
              onPageChange: setPage
            }}
          />
        </div>
      )}

      {payModal && (
        <Modal
          open={!!payModal}
          onOpenChange={() => {
            setPayModal(null);
            setPayAmount("");
          }}
          title={t("page.accountsReceivable.list.modal.title")}
          description={`${t("page.accountsReceivable.list.modal.invoice")}: ${payModal.invoiceNo} | ${t("page.accountsReceivable.list.modal.sisa")}: ${formatCurrencyRupiah(payModal.outstandingAmount)}`}
          confirmText={t("page.accountsReceivable.list.modal.confirm")}
          onConfirm={() => {
            if (!payAmount || Number(payAmount) <= 0) {
              toast.error(t("page.accountsReceivable.list.validation.noAmount"));
              return;
            }
            if (Number(payAmount) > Number(payModal.outstandingAmount)) {
              toast.error(t("page.accountsReceivable.list.validation.exceedsAmount"));
              return;
            }
            payMutation.mutate({ id: payModal.id, payload: { amount: payAmount } });
          }}
          loading={payMutation.isLoading}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                {t("page.accountsReceivable.list.modal.amountLabel")}
              </label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={t("page.accountsReceivable.list.modal.amountPlaceholder")}
              />
            </div>
          </div>
        </Modal>
      )}

      <div>
        <TipsCard
          tips={[
            t("page.accountsReceivable.list.tips.1"),
            t("page.accountsReceivable.list.tips.2"),
            t("page.accountsReceivable.list.tips.3"),
            t("page.accountsReceivable.list.tips.4")
          ]}
        />
      </div>
    </div>
  );
};

export default AccountsReceivableList;
