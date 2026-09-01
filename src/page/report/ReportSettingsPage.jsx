import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Save, ChevronUp, ChevronDown } from "lucide-react";
import { getReportConfigMeta, getReportConfigs, saveReportConfig } from "@/services/reportConfig";

const ACCENTS = ["#0f172a", "#1d4ed8", "#15803d", "#b45309", "#be123c", "#6d28d9"];

const ReportSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [meta, setMeta] = useState([]);
  const [configs, setConfigs] = useState({});
  const [activeKey, setActiveKey] = useState(null);
  const [selected, setSelected] = useState([]);
  const [accent, setAccent] = useState("#0f172a");
  const [branding, setBranding] = useState({ showLogo: true, showAddress: true, showPhone: true });

  useEffect(() => {
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
        if (metaList[0]) selectReport(metaList[0].key, cfgMap[metaList[0].key]);
      } catch (err) {
        toast.error(t("common.error"), { description: err?.message });
      }
    })();
  }, []);

  const selectReport = (key, cfg) => {
    setActiveKey(key);
    const report = meta.find((r) => r.key === key);
    const saved = cfg || configs[key] || {};
    setAccent(saved.accentColor || "#0f172a");
    setBranding({ showLogo: true, showAddress: true, showPhone: true, ...(saved.branding || {}) });
    setSelected(saved.selectedColumns || report?.columns?.map((col) => col.key) || []);
  };

  const toggleColumn = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
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
  };

  const activeReport = useMemo(() => meta.find((r) => r.key === activeKey), [meta, activeKey]);

  const handleSave = async () => {
    if (!activeKey) return;
    try {
      const config = { selectedColumns: selected, accentColor: accent, branding };
      await saveReportConfig(activeKey, config);
      setConfigs((prev) => ({ ...prev, [activeKey]: config }));
      toast.success(t("common.success"), { description: t("page.reportSettings.saved") });
    } catch (err) {
      toast.error(t("common.error"), { description: err?.message });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/report/sales")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.reportSettings.title")}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t("page.reportSettings.reports")}
            </p>
            {meta.map((r) => (
              <button
                key={r.key}
                onClick={() => selectReport(r.key)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeKey === r.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-3/4 space-y-6">
          {activeReport ? (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">{activeReport.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("page.reportSettings.columnHint")}
                </p>
                <div className="mt-4 space-y-2">
                  {activeReport.columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="h-4 w-4 rounded"
                        />
                        <span>{col.label}</span>
                        <span className="text-xs text-muted-foreground">{col.type}</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveColumn(col.key, -1)}
                          className="rounded p-1 hover:bg-muted"
                          aria-label="up">
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveColumn(col.key, 1)}
                          className="rounded p-1 hover:bg-muted"
                          aria-label="down">
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">{t("page.reportSettings.branding")}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {t("page.reportSettings.accentColor")}
                    </p>
                    <div className="flex gap-2">
                      {ACCENTS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setAccent(c)}
                          style={{ backgroundColor: c }}
                          className={`h-8 w-8 rounded-full border-2 ${
                            accent === c ? "border-ring ring-2" : "border-transparent"
                          }`}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                  {["showLogo", "showAddress", "showPhone"].map((field) => (
                    <label key={field} className="flex items-center justify-between text-sm">
                      <span>{t(`page.reportSettings.${field}`)}</span>
                      <input
                        type="checkbox"
                        checked={branding[field]}
                        onChange={(e) =>
                          setBranding((prev) => ({ ...prev, [field]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Save size={16} />
                {t("common.save")}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              {t("page.reportSettings.empty")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSettingsPage;
