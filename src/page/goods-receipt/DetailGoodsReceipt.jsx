import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileText, Package, Printer } from "lucide-react";
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.print()}
            title={t("common.print")}>
            <Printer size={16} />
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
      ) : (
        (() => {
          const st = statusDetail[receipt.status] || statusDetail.draft;
          const poItems = receipt.purchaseOrderItems || [];
          const totalOrdered = poItems.reduce((s, pi) => s + (Number(pi.quantity) || 0), 0);
          const totalReceived = poItems.reduce(
            (s, pi) => s + (Number(pi.receivedQuantity) || 0),
            0
          );
          const receivingDone = totalOrdered > 0 && totalReceived >= totalOrdered;
          let docUrls = [];
          if (receipt.documentation) {
            try {
              const parsed = JSON.parse(receipt.documentation);
              docUrls = Array.isArray(parsed) ? parsed.filter(Boolean) : [receipt.documentation];
            } catch {
              docUrls = [receipt.documentation];
            }
          }
          const shippingCost = Number(receipt.shippingCost) || 0;

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
                        [
                          t("page.goodsReceipt.detail.pic"),
                          receipt.picData?.fullName || receipt.picData?.userName || "-"
                        ],
                        [t("page.goodsReceipt.add.form.suratJalan"), receipt.suratJalan || "-"],
                        [t("page.goodsReceipt.add.form.taxInvoiceNo"), receipt.taxInvoiceNo || "-"],
                        [
                          t("page.goodsReceipt.add.form.shippingCost"),
                          shippingCost > 0 ? "Rp " + shippingCost.toLocaleString("id-ID") : "-"
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

                {docUrls.length > 0 && (
                  <div className="bg-card p-6 rounded-xl border border-border">
                    <h2 className="text-lg font-semibold mb-4">
                      {t("page.goodsReceipt.detail.documentation")}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {docUrls.map((url, i) => (
                        <img
                          key={url || i}
                          src={url}
                          alt={`${t("page.goodsReceipt.detail.documentation")} ${i + 1}`}
                          className="rounded-lg border border-border h-40 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(url, "_blank")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-card p-6 rounded-xl border border-border">
                  <h2 className="text-lg font-semibold mb-4">
                    {t("page.goodsReceipt.detail.itemsReceived")}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2">{t("page.goodsReceipt.detail.product")}</th>
                          <th className="pb-2 text-right">{t("page.goodsReceipt.detail.qty")}</th>
                          <th className="pb-2 text-center">{t("page.goodsReceipt.detail.unit")}</th>
                          <th className="pb-2 text-center">
                            {t("page.goodsReceipt.detail.conversion")}
                          </th>
                          <th className="pb-2 text-right">
                            {t("page.goodsReceipt.detail.costPrice")}
                          </th>
                          <th className="pb-2 text-center">
                            {t("page.goodsReceipt.add.table.batch")}
                          </th>
                          <th className="pb-2 text-center">
                            {t("page.goodsReceipt.add.table.expiry")}
                          </th>
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
                              <td className="py-2 text-center">
                                <span className="font-mono">{item.conversionToBase || 1}</span>
                                {Number(item.qtyStock) > 0 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    (= {Number(item.qtyStock).toLocaleString("id-ID")} stok)
                                  </span>
                                )}
                              </td>
                              <td className="py-2 text-right font-mono">
                                {Number(item.costPrice) > 0
                                  ? "Rp " + Number(item.costPrice).toLocaleString("id-ID")
                                  : "-"}
                                {Number(item.landedCost) > 0 && (
                                  <p className="text-[10px] text-emerald-600 font-normal">
                                    {t("page.goodsReceipt.detail.landed")}: +Rp{" "}
                                    {Number(item.landedCost).toLocaleString("id-ID")}
                                  </p>
                                )}
                              </td>
                              <td className="py-2 text-center font-mono text-xs">
                                {item.batchNumber || "-"}
                              </td>
                              <td className="py-2 text-center font-mono text-xs">
                                {item.expiryDate
                                  ? new Date(item.expiryDate).toLocaleDateString("id")
                                  : "-"}
                              </td>
                              <td className="py-2">{item.conditionNotes || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-4 text-center text-muted-foreground">
                              {t("page.goodsReceipt.detail.noItems")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
                            <td className="py-2">
                              {poItem.product || poItem.ingredientName || "-"}
                            </td>
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
                  {totalOrdered > 0 && (
                    <>
                      <div className="border-t border-border my-4" />
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("page.goodsReceipt.detail.receivingStatus")}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          receivingDone
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                        {receivingDone
                          ? t("page.goodsReceipt.add.status.selesai")
                          : t("page.goodsReceipt.add.status.belumSelesai")}
                        {!receivingDone && (
                          <span className="font-normal">
                            ({totalReceived.toLocaleString("id-ID")}/
                            {totalOrdered.toLocaleString("id-ID")})
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-card p-6 rounded-xl border border-border">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    {t("page.goodsReceipt.detail.systemInfo")}
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("page.goodsReceipt.detail.createdAt")}
                      </p>
                      <p className="text-sm font-medium">
                        {receipt.createdAt
                          ? new Date(receipt.createdAt).toLocaleDateString("id", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("page.goodsReceipt.detail.updatedAt")}
                      </p>
                      <p className="text-sm font-medium">
                        {receipt.updatedAt
                          ? new Date(receipt.updatedAt).toLocaleDateString("id", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })
                          : "-"}
                      </p>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        {t("page.goodsReceipt.detail.createdBy")}
                      </p>
                      <p className="text-sm font-medium">
                        {receipt.createdByUser?.fullName || receipt.createdByUser?.userName || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("page.goodsReceipt.detail.updatedBy")}
                      </p>
                      <p className="text-sm font-medium">-</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

const style = document.createElement("style");
style.textContent = `
  @media print {
    nav, .flex.items-center.justify-between > div:first-child > button, button[title] { display: none !important; }
    body { background: white !important; }
    .bg-card { border: 1px solid #ddd !important; box-shadow: none !important; }
    .space-y-6 > div:last-child { break-inside: avoid; }
    @page { margin: 1.5cm; }
  }
`;
document.head.appendChild(style);

export default DetailGoodsReceipt;
