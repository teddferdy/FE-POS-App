import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Save,
  Eye,
  ChevronUp,
  ChevronDown,
  CalendarDays,
  Bitcoin,
  Type,
  Store,
  Phone,
  MapPin,
  FileBarChart,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { getReportConfigMeta, getReportConfigs, saveReportConfig } from "@/services/reportConfig";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/reportUtils";
import ExcelPreviewSummary from "@/components/report/ExcelPreviewSummary";
import ExcelPreviewRanking from "@/components/report/ExcelPreviewRanking";
import ExcelPreviewStatement from "@/components/report/ExcelPreviewStatement";
import ExcelPreviewRoster from "@/components/report/ExcelPreviewRoster";

const ACCENTS = [
  { value: "#0f172a", name: "Slate" },
  { value: "#1d4ed8", name: "Blue" },
  { value: "#15803d", name: "Green" },
  { value: "#b45309", name: "Amber" },
  { value: "#be123c", name: "Rose" },
  { value: "#6d28d9", name: "Violet" }
];

const TYPE_ICONS = {
  date: CalendarDays,
  currency: Bitcoin,
  text: Type
};

const TYPE_STYLES = {
  date: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  currency: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  text: "bg-muted text-muted-foreground"
};

const SAMPLE_ROWS = [
  { date: "01/09/2026", currency: 1285000, text: "Customer A" },
  { date: "02/09/2026", currency: 940000, text: "Customer B" },
  { date: "03/09/2026", currency: 1560000, text: "Customer C" }
];

const ReportSettingsPage = () => {
  const { t } = useTranslation();

  const [meta, setMeta] = useState([]);
  const [configs, setConfigs] = useState({});
  const [activeKey, setActiveKey] = useState(null);
  const [selected, setSelected] = useState([]);
  const [accent, setAccent] = useState("#0f172a");
  const [branding, setBranding] = useState({ showLogo: true, showAddress: true, showPhone: true });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState("pdf");

  const loadReports = () => {
    setLoading(true);
    setLoadError(false);
    (async () => {
      try {
        const [metaRes, configRes] = await Promise.all([getReportConfigMeta(), getReportConfigs()]);
        const metaList = metaRes.data || [];
        setMeta(metaList);
        const cfgMap = {};
        (configRes.data || []).forEach((r) => {
          cfgMap[r.key] = r.config;
        });
        setConfigs(cfgMap);
        if (metaList[0]) selectReport(metaList[0].key, cfgMap[metaList[0].key], metaList);
      } catch (err) {
        // A failed fetch otherwise left `meta` at its initial empty array,
        // rendering exactly like "no report types configured" — with no
        // way to tell the two apart or retry.
        toast.error(t("common.error"), { description: err?.message });
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    loadReports();
  }, []);

  const selectReport = (key, cfg, reportList = meta) => {
    setActiveKey(key);
    const report = reportList.find((r) => r.key === key);
    const saved = cfg || configs[key] || {};
    setAccent(saved.accentColor || "#0f172a");
    setBranding({ showLogo: true, showAddress: true, showPhone: true, ...(saved.branding || {}) });
    setSelected(saved.selectedColumns || report?.columns?.map((col) => col.key) || []);
    setDirty(false);
  };

  const toggleColumn = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setDirty(true);
  };

  const moveColumn = (key, dir) => {
    setSelected((prev) => {
      const idx = prev.indexOf(key);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
    setDirty(true);
  };

  const handleAccentChange = (value) => {
    setAccent(value);
    setDirty(true);
  };

  const handleBrandingChange = (field) => (checked) => {
    setBranding((prev) => ({ ...prev, [field]: checked }));
    setDirty(true);
  };

  const activeReport = useMemo(() => meta.find((r) => r.key === activeKey), [meta, activeKey]);

  const orderedColumns = useMemo(
    () =>
      activeReport
        ? selected.map((k) => activeReport.columns.find((c) => c.key === k)).filter(Boolean)
        : [],
    [activeReport, selected]
  );

  const handleSave = async () => {
    if (!activeKey) return;
    if (selected.length === 0) {
      toast.error(t("page.reportSettings.requiredColumn"));
      return;
    }
    setSaving(true);
    try {
      const config = { selectedColumns: selected, accentColor: accent, branding };
      await saveReportConfig(activeKey, config);
      setConfigs((prev) => ({ ...prev, [activeKey]: config }));
      setDirty(false);
      toast.success(t("common.success"), { description: t("page.reportSettings.saved") });
    } catch (err) {
      toast.error(t("common.error"), { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  const renderPreviewCell = (type, row) => {
    if (type === "currency") return formatCurrency(row.currency);
    if (type === "date") return row.date;
    return row.text;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          { i18nKey: "page.reportSettings.title" }
        ]}
        title={t("page.reportSettings.title")}
        description={t("page.reportSettings.description")}>
        <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={!activeReport}>
          <Eye size={16} />
          {t("page.reportSettings.preview")}
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save size={16} />
          {t("common.save")}
        </Button>
      </PageHeader>

      {dirty && activeReport && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("page.reportSettings.unsaved")}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t("page.reportSettings.reports")}
            </p>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-9 rounded-lg" />
                ))}
              </div>
            ) : loadError ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-muted-foreground">{t("common.loadError")}</p>
                <Button variant="outline" size="sm" onClick={loadReports}>
                  {t("common.retry")}
                </Button>
              </div>
            ) : (
              meta.map((r) => (
                <button
                  key={r.key}
                  onClick={() => selectReport(r.key)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeKey === r.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}>
                  {r.label}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:w-3/4 space-y-6">
          {activeReport ? (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{activeReport.label}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("page.reportSettings.columnHint")}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {selected.length} {t("page.reportSettings.selectedCount")}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {activeReport.columns.map((col) => {
                    const TypeIcon = TYPE_ICONS[col.type] || Type;
                    const selectedColumn = selected.includes(col.key);
                    return (
                      <div
                        key={col.key}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                          selectedColumn
                            ? "border-border bg-card"
                            : "border-dashed border-border/50"
                        }`}>
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
                          <Checkbox
                            checked={selectedColumn}
                            onCheckedChange={() => toggleColumn(col.key)}
                            aria-label={col.label}
                          />
                          <span
                            className={`truncate ${selectedColumn ? "" : "text-muted-foreground"}`}>
                            {col.label}
                          </span>
                          <span
                            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_STYLES[col.type] || TYPE_STYLES.text}`}>
                            <TypeIcon size={11} />
                            {t(`page.reportSettings.columnType.${col.type}`)}
                          </span>
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveColumn(col.key, -1)}
                            disabled={!selectedColumn}
                            className="rounded p-1 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                            aria-label={t("page.reportSettings.moveUp")}>
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => moveColumn(col.key, 1)}
                            disabled={!selectedColumn}
                            className="rounded p-1 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
                            aria-label={t("page.reportSettings.moveDown")}>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div>
                  <h2 className="text-lg font-semibold">{t("page.reportSettings.branding")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("page.reportSettings.brandingDesc")}
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {t("page.reportSettings.accentColor")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {ACCENTS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => handleAccentChange(c.value)}
                          className="flex flex-col items-center gap-1"
                          aria-label={c.name}>
                          <span
                            style={{ backgroundColor: c.value }}
                            className={`h-8 w-8 rounded-full border-2 ${
                              accent === c.value
                                ? "border-ring ring-2 ring-ring/40"
                                : "border-transparent"
                            }`}
                          />
                          <span
                            className={`text-[11px] ${accent === c.value ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-border pt-4">
                    {["showLogo", "showAddress", "showPhone"].map((field) => (
                      <label
                        key={field}
                        className="flex cursor-pointer items-center justify-between text-sm">
                        <span>{t(`page.reportSettings.${field}`)}</span>
                        <Checkbox
                          checked={branding[field]}
                          onCheckedChange={handleBrandingChange(field)}
                          aria-label={t(`page.reportSettings.${field}`)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                icon={FileBarChart}
                title={t("page.reportSettings.empty")}
                description={null}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-[90vw] flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              {t("page.reportSettings.previewTitle")}
            </DialogTitle>
            <DialogDescription>
              {activeReport ? activeReport.label : ""} — {t("page.reportSettings.previewDesc")}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={previewTab}
            onValueChange={setPreviewTab}
            className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="gap-1.5">
                <FileText size={14} />
                {t("page.reportSettings.previewTabPdf")}
              </TabsTrigger>
              <TabsTrigger value="excel" className="gap-1.5">
                <FileSpreadsheet size={14} />
                {t("page.reportSettings.previewTabExcel")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="mt-3 min-h-0 flex-1 overflow-auto">
              <div className="overflow-hidden rounded-xl border-2" style={{ borderColor: accent }}>
                <div
                  className="flex items-start justify-between gap-4 px-6 py-5"
                  style={{ backgroundColor: accent }}>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white">{activeReport?.label}</p>
                    <p className="text-xs text-white/80">Laporan Periode</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-right text-white/90">
                    {branding.showLogo && (
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                        <Store size={18} />
                      </span>
                    )}
                    {branding.showAddress && (
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <MapPin size={11} />
                        <span className="text-xs text-white/80">
                          Contoh Alamat Toko, Jakarta 12345
                        </span>
                      </span>
                    )}
                    {branding.showPhone && (
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Phone size={11} />
                        <span className="text-xs text-white/80">(+62) 812-3456-7890</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {orderedColumns.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      {t("page.reportSettings.previewEmpty")}
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr>
                          {orderedColumns.map((col) => (
                            <th
                              key={col.key}
                              className="border-b-2 px-3 py-2 font-semibold text-muted-foreground"
                              style={{ borderColor: accent }}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_ROWS.map((row, ri) => (
                          <tr key={ri}>
                            {orderedColumns.map((col) => (
                              <td
                                key={col.key}
                                className={`border-b border-border/60 px-3 py-2 ${
                                  col.type === "currency" ? "font-mono" : ""
                                }`}>
                                {renderPreviewCell(col.type, row)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <p className="mt-4 text-[11px] italic text-muted-foreground">
                    {t("page.reportSettings.previewPdfFooter")}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="excel" className="mt-3 flex min-h-0 flex-1 flex-col">
              <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-2"
                style={{ borderColor: "#94a3b8" }}>
                <div className="flex items-center justify-between bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="text-green-600" />
                    {activeReport?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-1 text-[10px] text-muted-foreground">
                  <span>A1 : {activeReport?.label || ""}</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-green-600 bg-green-600 text-center font-sans text-[11px] leading-none">
                      <FileSpreadsheet size={10} className="text-white" />
                    </span>
                    {t("page.reportSettings.previewExcelSheetName")}
                  </span>
                </div>
                <div className="min-h-0 flex-1 overflow-auto bg-slate-100/50 p-6">
                  {orderedColumns.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                      {t("page.reportSettings.previewEmpty")}
                    </div>
                  ) : (
                    <div className="mx-auto max-w-4xl overflow-hidden rounded-t-lg border border-slate-200 bg-white shadow-sm">
                      {(() => {
                        const archetype = activeReport?.archetype || "summary";
                        const props = { accent, columns: orderedColumns, branding };
                        switch (archetype) {
                          case "ranking":
                            return <ExcelPreviewRanking {...props} />;
                          case "statement":
                            return <ExcelPreviewStatement {...props} />;
                          case "roster":
                            return <ExcelPreviewRoster {...props} />;
                          case "summary":
                          default:
                            return <ExcelPreviewSummary {...props} />;
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportSettingsPage;
