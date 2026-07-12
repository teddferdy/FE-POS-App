import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, ShoppingBag, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSalesReturnById } from "@/services/sales-return";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";

const statusDetail = {
  pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", class: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", class: "bg-red-100 text-red-800" }
};

const DetailSalesReturn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["sales-return-detail", id],
    () => getSalesReturnById(id),
    {
      enabled: !!id
    }
  );
  const ret = data?.data;

  if (isError) return <AbortController refetch={refetch} />;
  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 col-span-1 md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-32" /></div>
              <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-24" /></div>
              <div className="col-span-2 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-48" /></div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="p-5 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></Card>
          </div>
        </div>
      </div>
    );
  if (!ret)
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("page.salesReturn.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/sales-return")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> {t("page.salesReturn.detail.back")}
        </Button>
      </div>
    );

  const st = statusDetail[ret.status] || statusDetail.pending;

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.salesReturn.detail.breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/sales-return")} className="hover:text-foreground">
            {t("page.salesReturn.detail.breadcrumb.list")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.salesReturn.detail.breadcrumb.detail")}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/sales-return")}>
              <ArrowLeft size={16} />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <RotateCcw size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("page.salesReturn.detail.title")}</h1>
              <p className="text-sm text-muted-foreground">{ret.returnNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">
                {t("page.salesReturn.detail.section.informasiRetur")}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    [t("page.salesReturn.detail.field.returnNo"), ret.returnNumber],
                    [t("page.salesReturn.detail.field.store"), ret.storeData?.name || "-"],
                    [t("page.salesReturn.detail.field.reason"), ret.reason || "-"],
                    [
                      t("page.salesReturn.detail.field.returnedBy"),
                      ret.returnedBy || ret.returnedByData?.name || "-"
                    ],
                    [
                      t("page.salesReturn.detail.field.date"),
                      new Date(ret.createdAt).toLocaleDateString("id")
                    ]
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
              <h2 className="text-lg font-semibold mb-4">
                {t("page.salesReturn.detail.section.items")}
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">{t("page.salesReturn.detail.table.product")}</th>
                    <th className="pb-2 text-right">{t("page.salesReturn.detail.table.qty")}</th>
                    <th className="pb-2 text-center">{t("page.salesReturn.detail.table.unit")}</th>
                    <th className="pb-2">{t("page.salesReturn.detail.table.notes")}</th>
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
                        {t("page.salesReturn.detail.table.noItems")}
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
                {t("page.salesReturn.detail.section.status")}
              </h2>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${st.class}`}>
                <ShoppingBag size={14} /> {st.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailSalesReturn;
