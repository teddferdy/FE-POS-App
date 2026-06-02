import React from "react";
import { useTranslation } from "react-i18next";
import { Palette } from "lucide-react";

const Branding = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Palette className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
          <h3 className="text-lg font-semibold">{t("page.globalSetting.branding.title")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-4">
                {t("page.globalSetting.branding.primaryColor")}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  className="w-16 h-16 rounded-lg cursor-pointer border-none p-0"
                  defaultValue="#0058be"
                />
                <div className="flex-1">
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm uppercase"
                    type="text"
                    defaultValue="#0058be"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-4">
                {t("page.globalSetting.branding.secondaryColor")}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  className="w-16 h-16 rounded-lg cursor-pointer border-none p-0"
                  defaultValue="#006c49"
                />
                <div className="flex-1">
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm uppercase"
                    type="text"
                    defaultValue="#006c49"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t("page.globalSetting.branding.systemFont")}
              </label>
              <select className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary">
                <option>Inter (Standard)</option>
                <option>Roboto</option>
                <option>Open Sans</option>
                <option>Manrope</option>
              </select>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-3 uppercase tracking-widest">
                {t("page.globalSetting.branding.preview")}
              </p>
              <div className="p-4 bg-card rounded-lg shadow-sm border border-border/20">
                <h4 className="text-lg font-semibold text-primary mb-2">
                  {t("page.globalSetting.branding.dashboardPreview")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("page.globalSetting.branding.previewDescription")}
                </p>
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                  {t("page.globalSetting.branding.exampleButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4">
        <button className="px-6 py-3 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          {t("page.globalSetting.branding.resetDefault")}
        </button>
        <button className="px-8 py-3 rounded-lg text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95">
          {t("page.globalSetting.branding.saveChanges")}
        </button>
      </div>
    </div>
  );
};

export default Branding;
