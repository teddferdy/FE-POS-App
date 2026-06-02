import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import PengaturanToko from "./components/PengaturanToko";
import Operasional from "./components/Operasional";
import Branding from "./components/Branding";
import KonfigurasiGlobal from "./components/KonfigurasiGlobal";
import KelolaRole from "./components/KelolaRole";

const GlobalSetting = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("pengaturan-toko");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("page.globalSetting.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("page.globalSetting.description")}</p>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "pengaturan-toko"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("pengaturan-toko")}>
          {t("page.globalSetting.tab.storeSettings")}
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "operasional"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("operasional")}>
          {t("page.globalSetting.tab.operational")}
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "branding"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("branding")}>
          {t("page.globalSetting.tab.branding")}
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "konfigurasi-global"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("konfigurasi-global")}>
          {t("page.globalSetting.tab.globalConfig")}
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "kelola-role"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("kelola-role")}>
          {t("page.globalSetting.tab.roleManagement")}
        </button>
      </div>

      {activeTab === "pengaturan-toko" && <PengaturanToko />}
      {activeTab === "operasional" && <Operasional />}
      {activeTab === "branding" && <Branding />}
      {activeTab === "konfigurasi-global" && <KonfigurasiGlobal />}
      {activeTab === "kelola-role" && <KelolaRole />}
    </div>
  );
};

export default GlobalSetting;
