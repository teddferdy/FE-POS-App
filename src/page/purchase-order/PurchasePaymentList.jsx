import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { getAllPayments } from "@/services/purchase-payment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import { TipsCard } from "@/components/ui/tips-card";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
      header: t("page.purchasePayment.list.columns.date"),
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
      header: t("page.purchasePayment.list.columns.supplier"),
      render: (p) => p.supplierData?.name || "-"
    },
    {
      header: t("page.purchasePayment.list.columns.poNumber"),
      render: (p) => (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/purchase-order/detail?id=${p.purchaseOrderData?.id}`)}>
          {p.purchaseOrderData?.orderNumber || `PO-${p.purchaseOrder}`}
        </span>
      )
    },
    {
      header: t("page.purchasePayment.list.columns.amount"),
      render: (p) => (
        <span className="font-medium">Rp {Number(p.amount).toLocaleString("id-ID")}</span>
      )
    },
    {
      header: t("page.purchasePayment.list.columns.method"),
      render: (p) => {
        const labels = {
          cash: t("page.purchaseOrder.paymentMethod.cash"),
          transfer: t("page.purchaseOrder.paymentMethod.transfer"),
          giro: t("page.purchaseOrder.paymentMethod.giro"),
          other: t("page.purchaseOrder.paymentMethod.other")
        };
        return <span className="text-sm">{labels[p.paymentMethod] || p.paymentMethod || "-"}</span>;
      }
    },
    {
      header: t("page.purchasePayment.list.columns.reference"),
      render: (p) => <span className="text-sm text-muted-foreground">{p.reference || "-"}</span>
    },
    {
      header: t("page.purchasePayment.list.columns.notes"),
      render: (p) => (
        <span className="text-sm text-muted-foreground max-w-[150px] block truncate">
          {p.notes || "-"}
        </span>
      )
    },
    {
      header: t("page.purchasePayment.list.columns.actions"),
      render: (p) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            navigate(`/purchase-order/detail?id=${p.purchaseOrderData?.id || p.purchaseOrder}`)
          }>
          {t("page.purchasePayment.list.detailButton")}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.purchasePayment.list.title")}</span>
        </nav>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.purchasePayment.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.purchasePayment.list.description")}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm">
            <Wallet size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("page.purchasePayment.list.totalLabel")}:
            </span>
            <span className="font-bold text-lg">
              Rp {Number(totalAmount).toLocaleString("id-ID")}
            </span>
          </div>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-4">
        <DataTable
          columns={columns}
          data={payments}
          isLoading={isLoading}
          emptyMessage={t("page.purchasePayment.list.empty")}
          emptyIcon={Wallet}
          pagination={{ page, totalPages, total, onPageChange: setPage }}
        />
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <TipsCard
          tips={[
            t("page.purchasePayment.list.tips.1"),
            t("page.purchasePayment.list.tips.2"),
            t("page.purchasePayment.list.tips.3"),
            t("page.purchasePayment.list.tips.4")
          ]}
        />
      </motion.div>
    </div>
  );
};

export default PurchasePaymentList;
