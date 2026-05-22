/* eslint-disable react/prop-types */
import React from "react";
import { Cog, Banknote, Wallet, RefreshCw, Award } from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
  </label>
);

const items = [
  {
    id: "multi-currency",
    icon: Banknote,
    title: "Multi-Currency",
    desc: "Izinkan transaksi dengan mata uang asing",
    defaultChecked: false
  },
  {
    id: "pajak",
    icon: Wallet,
    title: "Pengaturan Pajak (PPN)",
    desc: "Hitung pajak otomatis pada invoice",
    defaultChecked: true
  },
  {
    id: "stok",
    icon: RefreshCw,
    title: "Update Stok Otomatis",
    desc: "Kurangi stok saat transaksi sukses",
    defaultChecked: true
  }
];

const KonfigurasiGlobal = () => {
  return (
    <div className="space-y-6">
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <Cog className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
          <h3 className="text-lg font-semibold">Konfigurasi Global</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex gap-4 items-center">
                  <Icon className="text-muted-foreground" size={20} />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Toggle checked={item.defaultChecked} onChange={() => {}} />
              </div>
            );
          })}
          <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-4">
            <div className="flex gap-4 items-center flex-1">
              <Award className="text-muted-foreground" size={20} />
              <div>
                <p className="text-sm font-medium">Rasio Konversi Poin</p>
                <p className="text-xs text-muted-foreground">Nilai Rp1 = Berapa Poin?</p>
              </div>
            </div>
            <div className="w-24">
              <input
                className="w-full px-3 py-1.5 rounded-lg border border-border text-center text-sm"
                type="number"
                defaultValue="100"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4">
        <button className="px-6 py-3 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          Reset ke Default
        </button>
        <button className="px-8 py-3 rounded-lg text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95">
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

export default KonfigurasiGlobal;
