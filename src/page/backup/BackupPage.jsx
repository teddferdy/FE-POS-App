import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Download, Upload, Database, FileSpreadsheet, RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadMasterDataBackup } from "@/services/backup";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const BackupPage = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadMasterDataBackup();
      toast.success(t("page.backup.exportSuccess"));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("page.backup.exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div variants={item} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("page.backup.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("page.backup.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">{t("page.backup.exportTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("page.backup.exportDesc")}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileSpreadsheet size={16} className="shrink-0" />
              <span>Excel (.xlsx) — 12 sheet master data</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Database size={16} className="shrink-0" />
              <span>Kategori, Supplier, Produk, Bahan Baku, Pajak, Diskon, dll</span>
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2" size="lg">
            {isExporting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Download size={16} />
                {t("page.backup.downloadButton")}
              </>
            )}
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Upload size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold">{t("page.backup.restoreTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("page.backup.restoreDesc")}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-muted-foreground">{t("page.backup.restoreNote")}</p>
          </div>

          <ul className="space-y-2 mb-6">
            {[
              { label: "Produk", href: "/product-list" },
              { label: "Kategori", href: "/category-list" },
              { label: "Supplier", href: "/supplier" },
              { label: "Bahan Baku", href: "/ingredient" },
              { label: "Pajak", href: "/tax-list" },
              { label: "Metode Pembayaran", href: "/type-payment-list" }
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileSpreadsheet size={14} />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground italic">{t("page.backup.restoreHint")}</p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {t("page.backup.tipsTitle")}
            </h4>
            <ul className="space-y-1.5">
              {t("page.backup.tips", { returnObjects: true }).map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BackupPage;
