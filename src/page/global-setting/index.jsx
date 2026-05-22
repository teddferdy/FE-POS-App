import React, { useState } from "react";

import PengaturanToko from "./components/PengaturanToko";
import Operasional from "./components/Operasional";
import Branding from "./components/Branding";
import KonfigurasiGlobal from "./components/KonfigurasiGlobal";
import KelolaRole from "./components/KelolaRole";

const GlobalSetting = () => {
  const [activeTab, setActiveTab] = useState("pengaturan-toko");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>
        <p className="text-sm text-muted-foreground">
          Konfigurasi parameter global dan preferensi operasional Kinetic Ledger.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "pengaturan-toko"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("pengaturan-toko")}>
          Pengaturan Toko
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "operasional"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("operasional")}>
          Operasional
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "branding"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("branding")}>
          Branding
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "konfigurasi-global"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("konfigurasi-global")}>
          Konfigurasi Global
        </button>
        <button
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
            activeTab === "kelola-role"
              ? "border-b-2 border-primary text-primary"
              : "border-b-2 border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setActiveTab("kelola-role")}>
          Kelola Role
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
