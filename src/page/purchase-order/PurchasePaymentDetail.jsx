/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Wallet, Building2, FileText, User, CreditCard } from "lucide-react";
import { getPaymentById } from "@/services/purchase-payment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";

const methodBadge = {
  cash: {
    label: "Cash",
    class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  },
  transfer: {
    label: "Transfer",
    class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  },
  giro: {
    label: "Giro",
    class: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
  },
  other: {
    label: "Other",
    class: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
};

const poStatusBadge = {
  draft: {
    label: "Draft",
    class: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  },
  pending: {
    label: "Pending",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
  },
  ordered: {
    label: "Ordered",
    class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  },
  received: {
    label: "Received",
    class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  }
};

const Row = ({ label, children }) => (
  <tr>
    <td className="py-2.5 text-muted-foreground w-44 align-top">{label}</td>
    <td className="py-2.5 font-medium">{children || "-"}</td>
  </tr>
);

const PurchasePaymentDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["payment-detail", id],
    () => getPaymentById(id),
    { enabled: !!id }
  );
  const payment = data?.data;
  const mb = methodBadge[payment?.paymentMethod] || methodBadge.other;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.purchaseOrder.detail.idNotFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/purchase-payment")}
          className="hover:text-foreground transition-colors">
          {t("page.purchasePayment.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.purchasePayment.detail.title")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/purchase-payment")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CreditCard size={24} />
          </div>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">
                  {t("page.purchasePayment.detail.title")} #{payment?.id}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("page.purchasePayment.detail.pageDesc")}
                </p>
              </>
            )}
          </div>
        </div>
        {!isLoading && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${mb?.class}`}>
            <Wallet size={14} />
            {t(`page.purchaseOrder.paymentMethod.${payment?.paymentMethod}`) || mb?.label}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
            </Card>
            <Card className="p-6 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></Card>
          </div>
        </div>
      ) : !payment ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-muted-foreground" />
              {t("page.purchasePayment.detail.paymentInfo")}
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                <Row label={t("page.purchasePayment.detail.amount")}>
                  <span className="text-lg font-bold">
                    Rp {Number(payment.amount).toLocaleString("id-ID")}
                  </span>
                </Row>
                <Row label={t("page.purchasePayment.detail.paymentMethod")}>
                  <span className="capitalize">
                    {t(`page.purchaseOrder.paymentMethod.${payment.paymentMethod}`)}
                  </span>
                </Row>
                <Row label={t("page.purchasePayment.detail.paymentDate")}>
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "-"}
                </Row>
                <Row label={t("page.purchasePayment.detail.reference")}>
                  {payment.reference || "-"}
                </Row>
                <Row label={t("page.purchasePayment.detail.notes")}>{payment.notes || "-"}</Row>
              </tbody>
            </table>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground" />
              {t("page.purchasePayment.detail.poInfo")}
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                <Row label={t("page.purchasePayment.detail.poNumber")}>
                  {payment.purchaseOrderData?.orderNumber || `PO-${payment.purchaseOrder}`}
                </Row>
                <Row label={t("page.purchasePayment.detail.supplier")}>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-muted-foreground" />
                    {payment.supplierData?.name || "-"}
                  </div>
                </Row>
                <Row label={t("page.purchasePayment.detail.poStatus")}>
                  {(() => {
                    const s =
                      poStatusBadge[payment.purchaseOrderData?.status] || poStatusBadge.pending;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.class}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                </Row>
                <Row label={t("page.purchasePayment.detail.poAmount")}>
                  <span className="font-medium">
                    Rp {Number(payment.purchaseOrderData?.finalAmount || 0).toLocaleString("id-ID")}
                  </span>
                </Row>
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              {t("page.purchasePayment.detail.system")}
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-muted-foreground">
                    {t("page.purchasePayment.detail.createdBy")}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {payment.createdByUser?.fullName || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">
                    {t("page.purchasePayment.detail.created")}
                  </td>
                  <td className="py-2 text-right">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">
                    {t("page.purchasePayment.detail.updated")}
                  </td>
                  <td className="py-2 text-right">
                    {payment.updatedAt
                      ? new Date(payment.updatedAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default PurchasePaymentDetail;
