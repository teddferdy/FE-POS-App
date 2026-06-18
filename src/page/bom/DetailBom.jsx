import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { getBomById } from "@/services/bom";
import AbortController from "@/components/organism/abort-controller";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const DetailBom = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(["bom-detail", id], () => getBomById(id), {
    enabled: !!id
  });
  const bom = data?.data;

  if (isError) return <AbortController refetch={refetch} />;
  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!bom)
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t("page.bom.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/bom")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> {t("page.bom.detail.back")}
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/bom")} className="hover:text-foreground">
            {t("breadcrumb.bom")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.detail")}</span>
        </nav>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("page.bom.detail.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bom.name || `${t("page.bom.detail.bomPrefix")}#${bom.id}`}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/bom")}>
          <ArrowLeft size={16} className="mr-1" /> {t("page.bom.detail.back")}
        </Button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">{t("page.bom.detail.bomInfo")}</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  [t("page.bom.detail.name"), bom.name || `BOM #${bom.id}`],
                  [t("page.bom.detail.product"), bom.productData?.nameProduct || "-"],
                  [t("page.bom.detail.sku"), bom.productData?.sku || "-"],
                  [
                    t("page.bom.detail.totalItems"),
                    `${bom.lines?.length || 0} ${t("page.bom.detail.items")}`
                  ],
                  [t("page.bom.detail.notes"), bom.notes || "-"],
                  [
                    t("page.bom.detail.date"),
                    new Date(bom.createdAt).toLocaleDateString(i18n.language)
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

          <motion.div variants={item}>
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">{t("page.bom.detail.ingredientList")}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">{t("page.bom.detail.ingredient")}</th>
                    <th className="pb-2 text-right">{t("page.bom.detail.qty")}</th>
                    <th className="pb-2 text-center">{t("page.bom.detail.unit")}</th>
                    <th className="pb-2">{t("page.bom.detail.notes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.lines?.length > 0 ? (
                    bom.lines.map((line, i) => (
                      <tr key={i} className="border-b border-muted/20">
                        <td className="py-2">{line.ingredientData?.nameProduct || "-"}</td>
                        <td className="py-2 text-right font-mono">{line.qty}</td>
                        <td className="py-2 text-center">
                          {line.unit || t("page.bom.detail.pcs")}
                        </td>
                        <td className="py-2">{line.notes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        {t("page.bom.detail.noIngredients")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t("page.bom.detail.summary")}
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              <ClipboardList size={14} /> {bom.lines?.length || 0}{" "}
              {t("page.bom.detail.ingredientCount")}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DetailBom;
