import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  FileText
  //  CheckCircle,
  //  XCircle
} from "lucide-react";
import { getGoodsReceiptById } from "@/services/goods-receipt";
import { Button } from "@/components/ui/button";
import AbortController from "@/components/organism/abort-controller";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const statusDetail = {
  draft: { class: "bg-yellow-100 text-yellow-800" },
  completed: { class: "bg-green-100 text-green-800" },
  cancelled: { class: "bg-red-100 text-red-800" }
};

const DetailGoodsReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["goods-receipt-detail", id],
    () => getGoodsReceiptById(id),
    { enabled: !!id }
  );

  const receipt = data?.data;

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("page.goodsReceipt.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/goods-receipt")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> {t("page.goodsReceipt.detail.back")}
        </Button>
      </div>
    );
  }

  const st = statusDetail[receipt.status] || statusDetail.draft;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/goods-receipt")} className="hover:text-foreground">
            {t("breadcrumb.goodsReceipt")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.detail")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("page.goodsReceipt.detail.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{receipt.receiptNumber}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/goods-receipt")}>
            <ArrowLeft size={16} className="mr-1" /> {t("page.goodsReceipt.detail.back")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">
                {t("page.goodsReceipt.detail.receiptInfo")}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    [t("page.goodsReceipt.detail.receiptNumber"), receipt.receiptNumber],
                    [
                      t("page.goodsReceipt.detail.poReference"),
                      receipt.purchaseOrderData?.orderNumber || "-"
                    ],
                    [t("page.goodsReceipt.detail.store"), receipt.storeData?.name || "-"],
                    [
                      t("page.goodsReceipt.detail.receivedDate"),
                      receipt.receivedDate
                        ? new Date(receipt.receivedDate).toLocaleDateString("id")
                        : "-"
                    ],
                    [t("page.goodsReceipt.detail.notes"), receipt.notes || "-"]
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-muted/30">
                      <td className="py-2 pr-4 text-muted-foreground w-40">{label}</td>
                      <td className="py-2 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">
                {t("page.goodsReceipt.detail.itemsReceived")}
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">{t("page.goodsReceipt.detail.product")}</th>
                    <th className="pb-2 text-right">{t("page.goodsReceipt.detail.qty")}</th>
                    <th className="pb-2 text-center">{t("page.goodsReceipt.detail.unit")}</th>
                    <th className="pb-2">{t("page.goodsReceipt.detail.notes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items?.length > 0 ? (
                    receipt.items.map((item, i) => (
                      <tr key={i} className="border-b border-muted/20">
                        <td className="py-2">
                          {item.productData?.nameProduct || item.ingredientName || "-"}
                        </td>
                        <td className="py-2 text-right font-mono">{item.qtyReceived}</td>
                        <td className="py-2 text-center">{item.unit || "pcs"}</td>
                        <td className="py-2">{item.conditionNotes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        {t("page.goodsReceipt.detail.noItems")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {receipt.purchaseOrderItems?.length > 0 && (
              <div className="bg-card p-6 rounded-xl border border-border">
                <h2 className="text-lg font-semibold mb-4">
                  {t("page.goodsReceipt.detail.poItems")}
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2">{t("page.goodsReceipt.detail.product")}</th>
                      <th className="pb-2 text-right">{t("page.goodsReceipt.detail.qtyPo")}</th>
                      <th className="pb-2 text-right">
                        {t("page.goodsReceipt.detail.qtyReceived")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.purchaseOrderItems.map((poItem, i) => (
                      <tr key={i} className="border-b border-muted/20">
                        <td className="py-2">{poItem.product || poItem.ingredientName || "-"}</td>
                        <td className="py-2 text-right font-mono">{poItem.quantity}</td>
                        <td className="py-2 text-right font-mono">
                          {poItem.receivedQuantity || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("page.goodsReceipt.detail.statusLabel")}
              </h2>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${st.class}`}>
                <FileText size={14} />{" "}
                {t(`page.goodsReceipt.detail.status.${receipt.status || "draft"}`)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailGoodsReceipt;
