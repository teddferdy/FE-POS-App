import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPurchaseReturnById } from "@/services/purchase-return";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const statusDetail = {
  pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", class: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", class: "bg-red-100 text-red-800" }
};

const DetailPurchaseReturn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["purchase-return-detail", id],
    () => getPurchaseReturnById(id),
    { enabled: !!id }
  );
  const ret = data?.data;

  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!ret)
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("page.purchaseReturn.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/purchase-return")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> {t("page.purchaseReturn.detail.back")}
        </Button>
      </div>
    );

  const st = statusDetail[ret.status] || statusDetail.pending;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          {t("page.purchaseReturn.detail.breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/purchase-return")} className="hover:text-foreground">
          {t("page.purchaseReturn.detail.breadcrumb.list")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.purchaseReturn.detail.breadcrumb.detail")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("page.purchaseReturn.detail.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{ret.returnNumber}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/purchase-return")}>
          <ArrowLeft size={16} className="mr-1" /> {t("page.purchaseReturn.detail.back")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">{t("page.purchaseReturn.detail.section.informasiRetur")}</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  [t("page.purchaseReturn.detail.field.returnNo"), ret.returnNumber],
                  [t("page.purchaseReturn.detail.field.store"), ret.storeData?.name || "-"],
                  [t("page.purchaseReturn.detail.field.reason"), ret.reason || "-"],
                  [t("page.purchaseReturn.detail.field.returnedBy"), ret.returnedBy || ret.returnedByData?.name || "-"],
                  [t("page.purchaseReturn.detail.field.date"), new Date(ret.createdAt).toLocaleDateString("id")]
                ].map(([l, v]) => (
                  <tr key={l} className="border-b border-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground w-40">{l}</td>
                    <td className="py-2 font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">{t("page.purchaseReturn.detail.section.items")}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">{t("page.purchaseReturn.detail.table.product")}</th>
                  <th className="pb-2 text-right">{t("page.purchaseReturn.detail.table.qty")}</th>
                  <th className="pb-2 text-center">{t("page.purchaseReturn.detail.table.unit")}</th>
                  <th className="pb-2">{t("page.purchaseReturn.detail.table.notes")}</th>
                </tr>
              </thead>
              <tbody>
                {ret.items?.length > 0 ? (
                  ret.items.map((item, i) => (
                    <tr key={i} className="border-b border-muted/20">
                      <td className="py-2">{item.productData?.nameProduct || "-"}</td>
                      <td className="py-2 text-right font-mono">{item.qty}</td>
                      <td className="py-2 text-center">{item.unit || "pcs"}</td>
                      <td className="py-2">{item.notes || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      {t("page.purchaseReturn.detail.table.noItems")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t("page.purchaseReturn.detail.section.status")}
            </h2>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${st.class}`}>
              <ShoppingBag size={14} /> {st.label}
            </div>
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
};

export default DetailPurchaseReturn;
