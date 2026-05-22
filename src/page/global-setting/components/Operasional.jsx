/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

const days = [
  { id: "senin", label: "Senin" },
  { id: "selasa", label: "Selasa" },
  { id: "rabu", label: "Rabu" },
  { id: "kamis", label: "Kamis" },
  { id: "jumat", label: "Jumat" },
  { id: "sabtu", label: "Sabtu" },
  { id: "minggu", label: "Minggu" }
];

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
  </label>
);

const Operasional = () => {
  const [showAllDays, setShowAllDays] = useState(false);
  const displayedDays = showAllDays ? days : days.slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {/* <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <span>Pengaturan Sistem</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-semibold">Kelola Role</span>
          </nav> */}
        <h2 className="text-2xl font-bold">Operasional</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">Jam Operasional Toko</p>
      </div>
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Clock className="text-primary p-2 bg-primary/10 rounded-lg" size={20} />
            <div>
              <h3 className="text-lg font-semibold">Jam Buka/Tutup</h3>
              <p className="text-sm text-muted-foreground">Atur jadwal operasional toko mingguan</p>
            </div>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm transition-all active:scale-95 shadow-md">
            Simpan Perubahan
          </button>
        </div>
        <div className="space-y-2">
          {displayedDays.map((day) => {
            const isMinggu = day.id === "minggu";
            return (
              <div
                key={day.id}
                className={`grid grid-cols-12 gap-4 items-center py-4 border-b border-border ${
                  isMinggu ? "opacity-60 bg-muted px-3 rounded-lg" : ""
                }`}>
                <div className="col-span-2 text-sm font-semibold">{day.label}</div>
                <div className="col-span-3">
                  <input
                    className={`w-full px-4 py-2 rounded-lg border border-border text-sm ${
                      isMinggu ? "bg-muted text-muted-foreground cursor-not-allowed" : ""
                    }`}
                    type="time"
                    defaultValue={isMinggu ? "" : "09:00"}
                    disabled={isMinggu}
                  />
                </div>
                <div className="col-span-1 text-center text-sm font-medium">
                  {isMinggu ? "-" : "s/d"}
                </div>
                <div className="col-span-3">
                  <input
                    className={`w-full px-4 py-2 rounded-lg border border-border text-sm ${
                      isMinggu ? "bg-muted text-muted-foreground cursor-not-allowed" : ""
                    }`}
                    type="time"
                    defaultValue={isMinggu ? "" : "21:00"}
                    disabled={isMinggu}
                  />
                </div>
                <div className="col-span-3 flex justify-end items-center gap-2">
                  <span
                    className={`text-sm ${isMinggu ? "text-destructive" : "text-muted-foreground"}`}>
                    {isMinggu ? "Tutup" : "Buka"}
                  </span>
                  <Toggle checked={!isMinggu} onChange={() => {}} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center py-4">
          <button
            className="text-primary text-sm flex items-center gap-2 mx-auto hover:underline"
            onClick={() => setShowAllDays(!showAllDays)}>
            <ChevronDown
              size={16}
              className={`transition-transform ${showAllDays ? "rotate-180" : ""}`}
            />
            {showAllDays ? "Sembunyikan" : "Tampilkan Semua Hari"}
          </button>
        </div>
      </section>

      {/* <div className="flex items-center justify-end gap-4">
        <button className="px-6 py-3 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
          Reset ke Default
        </button>
        <button className="px-8 py-3 rounded-lg text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95">
          Simpan Perubahan
        </button>
      </div> */}
    </div>
  );
};

export default Operasional;
