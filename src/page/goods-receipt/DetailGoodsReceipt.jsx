import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileText, Package } from "lucide-react";
import { getGoodsReceiptById } from "@/services/goods-receipt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";

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

  return (
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
        {isLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <span className="text-primary font-semibold">{receipt?.receiptNumber || "Detail"}</span>
        )}
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/goods-receipt")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Package size={24} />
          </div>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{t("page.goodsReceipt.detail.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{receipt?.receiptNumber}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </Card>
          </div>
        </div>
      ) : !receipt ? (
        <div className="p-6">
          <p className="text-muted-foreground">{t("page.goodsReceipt.detail.notFound")}</p>
          <Button variant="outline" onClick={() => navigate("/goods-receipt")} className="mt-4">
            <ArrowLeft size={16} className="mr-1" /> {t("page.goodsReceipt.detail.back")}
          </Button>
        </div>
      ) : (() => {
        const st = statusDetail[receipt.status] || statusDetail.draft;

        return (
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
        );
      })()}
    </div>
  );
};

export default DetailGoodsReceipt;
