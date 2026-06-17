import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ArrowLeft, ArrowRightLeft, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getTransferById,
  approveStockTransfer,
  rejectStockTransfer
} from "@/services/stock-transfer";
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

const DetailStockTransfer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(["stock-transfer-detail", id], () => getTransferById(id), {
    enabled: !!id
  });
  const transfer = data?.data;

  const approveMut = useMutation(() => approveStockTransfer(id), {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.detail.toast.success"), { description: t("page.stockTransfer.detail.toast.approveDesc") });
      queryClient.invalidateQueries(["stock-transfer-detail", id]);
    },
    onError: (err) =>
      toast.error(t("page.stockTransfer.detail.toast.error"), { description: err?.response?.data?.message || err.message })
  });

  const rejectMut = useMutation(() => rejectStockTransfer(id), {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.detail.toast.success"), { description: t("page.stockTransfer.detail.toast.rejectDesc") });
      queryClient.invalidateQueries(["stock-transfer-detail", id]);
    },
    onError: (err) =>
      toast.error(t("page.stockTransfer.detail.toast.error"), { description: err?.response?.data?.message || err.message })
  });

  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!transfer)
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("page.stockTransfer.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/stock-transfer")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> {t("page.stockTransfer.detail.back")}
        </Button>
      </div>
    );

  const st = statusDetail[transfer.status] || statusDetail.pending;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          {t("page.stockTransfer.detail.breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/stock-transfer")} className="hover:text-foreground">
          {t("page.stockTransfer.detail.breadcrumb.list")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.stockTransfer.detail.breadcrumb.detail")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("page.stockTransfer.detail.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{transfer.transferNumber}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/stock-transfer")}>
          <ArrowLeft size={16} className="mr-1" /> {t("page.stockTransfer.detail.back")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">{t("page.stockTransfer.detail.section.informasiTransfer")}</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  [t("page.stockTransfer.detail.field.transferNo"), transfer.transferNumber],
                  [t("page.stockTransfer.detail.field.from"), transfer.fromStoreData?.name || "-"],
                  [t("page.stockTransfer.detail.field.to"), transfer.toStoreData?.name || "-"],
                  [
                    t("page.stockTransfer.detail.field.transferredBy"),
                    transfer.transferredBy || transfer.transferredByData?.name || "-"
                  ],
                  [t("page.stockTransfer.detail.field.date"), new Date(transfer.createdAt).toLocaleDateString("id")],
                  [t("page.stockTransfer.detail.field.notes"), transfer.notes || "-"]
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
            <h2 className="text-lg font-semibold mb-4">{t("page.stockTransfer.detail.section.items")}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">{t("page.stockTransfer.detail.table.product")}</th>
                  <th className="pb-2 text-right">{t("page.stockTransfer.detail.table.qty")}</th>
                  <th className="pb-2 text-center">{t("page.stockTransfer.detail.table.unit")}</th>
                  <th className="pb-2">{t("page.stockTransfer.detail.table.notes")}</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items?.length > 0 ? (
                  transfer.items.map((item, i) => (
                    <tr key={i} className="border-b border-muted/20">
                      <td className="py-2">
                        {item.productData?.nameProduct || item.product?.nameProduct || "-"}
                      </td>
                      <td className="py-2 text-right font-mono">{item.qty}</td>
                      <td className="py-2 text-center">{item.unit || "pcs"}</td>
                      <td className="py-2">{item.notes || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      {t("page.stockTransfer.detail.table.noItems")}
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
              {t("page.stockTransfer.detail.section.status")}
            </h2>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${st.class}`}>
              <ArrowRightLeft size={14} /> {st.label}
            </div>
            {transfer.status === "pending" && (
              <div className="mt-4 space-y-2">
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  disabled={approveMut.isLoading}
                  onClick={() => approveMut.mutate()}>
                  <CheckCircle size={15} /> {t("page.stockTransfer.detail.approve")}
                </Button>
                <Button
                  className="w-full gap-2"
                  variant="destructive"
                  size="sm"
                  disabled={rejectMut.isLoading}
                  onClick={() => rejectMut.mutate()}>
                  <XCircle size={15} /> {t("page.stockTransfer.detail.reject")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
};

export default DetailStockTransfer;
