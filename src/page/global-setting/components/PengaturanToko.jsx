/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ReceiptText,
  Image,
  CloudUpload,
  Delete,
  AtSign,
  Share2,
  MessageCircle,
  Music,
  Play,
  Briefcase,
  Wallet,
  MessageSquare,
  Eye
} from "lucide-react";

const platforms = [
  { id: "ig", label: "Instagram", icon: AtSign, placeholder: "@username" },
  { id: "fb", label: "Facebook", icon: Share2, placeholder: "Halaman / URL" },
  { id: "wa", label: "WhatsApp", icon: MessageCircle, placeholder: "+62..." },
  { id: "tw", label: "Twitter (X)", icon: MessageSquare, placeholder: "@username" },
  { id: "li", label: "Line", icon: MessageCircle, placeholder: "ID Line" },
  { id: "tk", label: "TikTok", icon: Music, placeholder: "@tiktok_id" },
  { id: "yt", label: "YouTube", icon: Play, placeholder: "Channel Name" },
  { id: "ln", label: "LinkedIn", icon: Briefcase, placeholder: "Company Profile" }
];

const Toggle = ({ checked, onChange, size = "md" }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div
      className={`${
        size === "sm" ? "w-9 h-5 after:h-4 after:w-4" : "w-11 h-6 after:h-5 after:w-5"
      } bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:transition-all peer-checked:bg-primary`}
    />
  </label>
);

const PengaturanToko = () => {
  const { t } = useTranslation();
  const [socialEnabled, setSocialEnabled] = useState({});
  const [previewEnabled, setPreviewEnabled] = useState({
    header: true,
    alamat: true,
    footer: true,
    logo: true,
    sosial: true
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <ReceiptText className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
              <h3 className="text-lg font-semibold">
                {t("page.globalSetting.storeSettings.invoiceReceipt")}
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("page.globalSetting.storeSettings.receiptHeader")}
                  </label>
                  <Toggle
                    checked={previewEnabled.header}
                    onChange={() => setPreviewEnabled((p) => ({ ...p, header: !p.header }))}
                  />
                </div>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  type="text"
                  defaultValue="PT. KINETIC LEDGER INDONESIA"
                  disabled={!previewEnabled.header}
                  placeholder={t("page.globalSetting.storeSettings.companyNamePlaceholder")}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("page.globalSetting.storeSettings.storeAddress")}
                  </label>
                  <Toggle
                    checked={previewEnabled.alamat}
                    onChange={() => setPreviewEnabled((p) => ({ ...p, alamat: !p.alamat }))}
                  />
                </div>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                  defaultValue="Jl. Jenderal Sudirman No. 123\nJakarta Selatan"
                  disabled={!previewEnabled.alamat}
                  placeholder={t("page.globalSetting.storeSettings.addressPlaceholder")}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("page.globalSetting.storeSettings.receiptFooter")}
                  </label>
                  <Toggle
                    checked={previewEnabled.footer}
                    onChange={() => setPreviewEnabled((p) => ({ ...p, footer: !p.footer }))}
                  />
                </div>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                  defaultValue="Terima kasih telah berbelanja! Silakan simpan struk ini sebagai bukti transaksi yang sah."
                  disabled={!previewEnabled.footer}
                  placeholder={t("page.globalSetting.storeSettings.footerPlaceholder")}
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium">
                  {t("page.globalSetting.storeSettings.showLogoOnReceipt")}
                </span>
                <Toggle
                  checked={previewEnabled.logo}
                  onChange={() => setPreviewEnabled((p) => ({ ...p, logo: !p.logo }))}
                />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Image className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
              <h3 className="text-lg font-semibold">
                {t("page.globalSetting.storeSettings.storeLogo")}
              </h3>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted transition-colors cursor-pointer">
              <CloudUpload className="text-4xl text-muted-foreground mb-4" />
              <p className="text-sm font-medium">
                {t("page.globalSetting.storeSettings.uploadLabel")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("page.globalSetting.storeSettings.uploadHint")}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4 p-4 bg-muted rounded-lg">
              <img
                alt="Current Logo"
                className="w-12 h-12 rounded object-contain bg-white p-1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvo-TnkEempjH99cCCyDm3W_clcCwlRJhki-YuBrToOqQykCPn9tGvor2qkaD-6R-GDTejw-TyEBdWWCkvADWyqklkmEWpIzFnrYV476YlGNr5cyYvAmMaC11S1FZ8vqbLi_StMzalw6MbuR4YJ-huXmowPwJqm6qjglS414G_8NIJqS9tsUtU5zpcAx2Xg1Bj8jHNdOBcwYStJj1TxpJgwHoP_FGAnuyfS_Zhhiv7migZgtvaa-Epa3NUbIq7Vq1WBVIQrGtH4d4x"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">logo_utama_2024.png</p>
                <p className="text-xs text-muted-foreground">
                  {t("page.globalSetting.storeSettings.fileInfo")}
                </p>
              </div>
              <button className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors">
                <Delete size={20} />
              </button>
            </div>
          </section>

          <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Share2 className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("page.globalSetting.storeSettings.socialMedia")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("page.globalSetting.storeSettings.socialMediaDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {t("page.globalSetting.storeSettings.showOnReceipt")}
                </span>
                <Toggle
                  checked={previewEnabled.sosial}
                  onChange={() => setPreviewEnabled((p) => ({ ...p, sosial: !p.sosial }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isEnabled = socialEnabled[platform.id] !== false;
                return (
                  <div key={platform.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Icon className="text-primary" size={18} />
                        {platform.label}
                      </label>
                      <Toggle
                        size="sm"
                        checked={isEnabled}
                        onChange={() =>
                          setSocialEnabled((p) => ({ ...p, [platform.id]: !isEnabled }))
                        }
                      />
                    </div>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                      type="text"
                      defaultValue={
                        platform.id === "ig"
                          ? "@kineticledger.id"
                          : platform.id === "fb"
                            ? "Kinetic Ledger Indonesia"
                            : platform.id === "wa"
                              ? "+62 812-3456-7890"
                              : platform.id === "tw"
                                ? "@kineticledger"
                                : ""
                      }
                      placeholder={platform.placeholder}
                      disabled={!isEnabled}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Wallet className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
                <h3 className="text-lg font-semibold">
                  {t("page.globalSetting.storeSettings.tax")}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {t("page.globalSetting.storeSettings.enableTax")}
                </span>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            </div>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t("page.globalSetting.storeSettings.taxPercentage")}
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-primary focus:border-primary text-sm pr-10"
                  type="number"
                  defaultValue="11"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  %
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <section className="bg-card rounded-xl border border-border p-6 shadow-sm h-full sticky top-20">
            <div className="flex items-center gap-4 mb-4">
              <Eye className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
              <h3 className="text-lg font-semibold">
                {t("page.globalSetting.storeSettings.invoicePreview")}
              </h3>
            </div>
            <div className="bg-muted p-4 rounded-lg flex justify-center items-start min-h-[600px]">
              <div className="bg-card w-full max-w-[280px] shadow-md p-6 font-mono text-[11px] text-card-foreground">
                <div className="text-center space-y-2 mb-4">
                  {previewEnabled.logo && (
                    <img
                      alt="Logo Preview"
                      className="w-10 h-10 mx-auto opacity-80 mix-blend-multiply"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvo-TnkEempjH99cCCyDm3W_clcCwlRJhki-YuBrToOqQykCPn9tGvor2qkaD-6R-GDTejw-TyEBdWWCkvADWyqklkmEWpIzFnrYV476YlGNr5cyYvAmMaC11S1FZ8vqbLi_StMzalw6MbuR4YJ-huXmowPwJqm6qjglS414G_8NIJqS9tsUtU5zpcAx2Xg1Bj8jHNdOBcwYStJj1TxpJgwHoP_FGAnuyfS_Zhhiv7migZgtvaa-Epa3NUbIq7Vq1WBVIQrGtH4d4x"
                    />
                  )}
                  <p className="font-bold uppercase">PT. KINETIC LEDGER INDONESIA</p>
                  <p>
                    Jl. Jenderal Sudirman No. 123
                    <br />
                    Jakarta Selatan
                  </p>
                </div>
                <div className="border-t border-dashed border-border py-2">
                  <p>Inv: #KL-20240520-001</p>
                  <p>Tgl: 20/05/2024 14:30</p>
                  <p>Kasir: Super Admin</p>
                </div>
                <div className="border-t border-dashed border-border py-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Kopi Susu Gula Aren x1</span>
                    <span>18.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roti Bakar Coklat x1</span>
                    <span>15.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Air Mineral 600ml x2</span>
                    <span>10.000</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-border py-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>43.000</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>PPN (11%)</span>
                    <span>4.730</span>
                  </div>
                  <div className="flex justify-between font-bold text-[13px] pt-1">
                    <span>TOTAL</span>
                    <span>47.730</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-border pt-4 text-center italic">
                  <p>
                    Terima kasih telah berbelanja! Silakan simpan struk ini sebagai bukti transaksi
                    yang sah.
                  </p>
                </div>
                {previewEnabled.sosial && (
                  <div className="border-t border-dashed border-border pt-3 mt-3 text-[10px] space-y-1">
                    {socialEnabled.ig !== false && (
                      <div className="flex items-center gap-2">
                        <AtSign className="text-[12px]" />
                        <span>@kineticledger.id</span>
                      </div>
                    )}
                    {socialEnabled.fb !== false && (
                      <div className="flex items-center gap-2">
                        <Share2 className="text-[12px]" />
                        <span>Kinetic Ledger Indonesia</span>
                      </div>
                    )}
                    {socialEnabled.wa !== false && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="text-[12px]" />
                        <span>+62 812-3456-7890</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-4 flex justify-center">
                  <div className="w-24 h-10 bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                    BARCODE
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center italic">
              {t("page.globalSetting.storeSettings.previewNote")}
            </p>
          </section>
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        <button className="px-6 py-3 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          {t("page.globalSetting.storeSettings.resetDefault")}
        </button>
        <button className="px-8 py-3 rounded-lg text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95">
          {t("page.globalSetting.storeSettings.saveAllSettings")}
        </button>
      </div>
    </div>
  );
};

export default PengaturanToko;
