/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const modules = [
  {
    id: "sales",
    icon: "payments",
    label: "Penjualan & Transaksi",
    desc: "POS, Invoice, Retur Penjualan",
    color: "text-emerald-600 bg-emerald-100"
  },
  {
    id: "inventory",
    icon: "inventory_2",
    label: "Inventori & Stok",
    desc: "Stok Opname, Supplier, Gudang",
    color: "text-amber-600 bg-amber-100"
  },
  {
    id: "hr",
    icon: "group",
    label: "Karyawan & Payroll",
    desc: "Absensi, Gaji, Jadwal Shift",
    color: "text-blue-600 bg-blue-100"
  },
  {
    id: "settings",
    icon: "settings_applications",
    label: "Pengaturan Sistem",
    desc: "Konfigurasi Toko, API, Database",
    color: "text-slate-600 bg-slate-100"
  },
  {
    id: "analytics",
    icon: "query_stats",
    label: "Laporan & Analitik",
    desc: "Export PDF/Excel, Grafik Penjualan",
    color: "text-purple-600 bg-purple-100"
  }
];

const roles = [
  { id: "super_admin", label: "Super Admin", subtitle: "AKSES PENUH", icon: "security" },
  { id: "admin", label: "Admin Toko", subtitle: "PENGELOLA OPERASIONAL", icon: "storefront" },
  { id: "supervisor", label: "Supervisor", subtitle: "PENGAWAS LANTAI", icon: "supervisor_account" }
];

const initialPermissions = {
  super_admin: {
    sales: { c: true, r: true, u: true, d: true },
    inventory: { c: true, r: true, u: true, d: true },
    hr: { c: true, r: true, u: true, d: true },
    settings: { c: true, r: true, u: true, d: true },
    analytics: { c: true, r: true, u: true, d: true }
  },
  admin: {
    sales: { c: true, r: true, u: true, d: false },
    inventory: { c: true, r: true, u: true, d: false },
    hr: { c: false, r: true, u: false, d: false },
    settings: { c: false, r: false, u: false, d: false },
    analytics: { c: false, r: true, u: false, d: false }
  },
  supervisor: {
    sales: { c: false, r: true, u: false, d: false },
    inventory: { c: false, r: true, u: false, d: false },
    hr: { c: false, r: true, u: false, d: false },
    settings: { c: false, r: false, u: false, d: false },
    analytics: { c: false, r: true, u: false, d: false }
  }
};

const RoleManagement = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("super_admin");
  const [permissions, setPermissions] = useState(initialPermissions);
  const [toggles, setToggles] = useState({ multiDevice: true, vpnRequired: false });

  const currentPerms = permissions[activeRole] || {};

  const togglePermission = (moduleId, action) => {
    setPermissions((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [moduleId]: {
          ...prev[activeRole][moduleId],
          [action]: !prev[activeRole][moduleId]?.[action]
        }
      }
    }));
  };

  const selectAll = (checked) => {
    const updated = {};
    modules.forEach((m) => {
      updated[m.id] = { c: checked, r: checked, u: checked, d: checked };
    });
    setPermissions((prev) => ({ ...prev, [activeRole]: updated }));
  };

  const allSelected = modules.every((m) => {
    const p = currentPerms[m.id];
    return p && p.c && p.r && p.u && p.d;
  });

  const roleList = [...roles, { id: "add", type: "add" }];

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <button
              onClick={() => navigate("/user-list")}
              className="hover:text-primary transition-colors">
              Kelola Admin
            </button>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="text-primary font-semibold">Manajemen Role & Izin</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Manajemen Role & Izin
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Konfigurasikan tingkat akses dan hak istimewa untuk setiap peran pengguna di sistem.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <span className="material-symbols-outlined text-lg">history</span>
            Log Perubahan
          </Button>
          <Button className="gap-2">
            <span className="material-symbols-outlined text-lg">save</span>
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-base font-semibold text-foreground">Daftar Role</h3>
            </div>
            <div className="p-2">
              {roles.map((role) => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 text-left transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted text-muted-foreground border border-transparent"
                    }`}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined ${isActive ? "text-primary" : "text-muted-foreground"}`}
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {role.icon}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                          {role.label}
                        </p>
                        <p className="text-[10px] opacity-60 uppercase tracking-wider">
                          {role.subtitle}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-border">
              <button
                onClick={() => navigate("/add-role")}
                className="w-full py-2 border-2 border-dashed border-border rounded-lg text-muted-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-all">
                <span className="material-symbols-outlined text-lg">add</span>
                Tambah Role Baru
              </button>
            </div>
          </div>

          <div className="bg-primary p-5 rounded-xl shadow-sm text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">
                Total Pengguna
              </p>
              <h4 className="text-2xl font-bold mt-1">12 Admin</h4>
              <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-2 py-1 rounded">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="text-xs font-bold">+2 bulan ini</span>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">
              shield_person
            </span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Matrix Izin: {roles.find((r) => r.id === activeRole)?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tentukan hak akses CRUD untuk setiap modul sistem.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => selectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  Pilih Semua
                </span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Modul Sistem
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">
                      Create
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">
                      Read
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">
                      Update
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modules.map((mod) => {
                    const perm = currentPerms[mod.id] || {};
                    return (
                      <tr key={mod.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${mod.color}`}>
                              <span className="material-symbols-outlined text-lg">{mod.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                              <p className="text-xs text-muted-foreground">{mod.desc}</p>
                            </div>
                          </div>
                        </td>
                        {["c", "r", "u", "d"].map((action) => (
                          <td key={action} className="px-4 text-center">
                            <input
                              type="checkbox"
                              checked={!!perm[action]}
                              onChange={() => togglePermission(mod.id, action)}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-muted/20 flex items-start gap-3 border-t border-border">
              <span className="material-symbols-outlined text-primary mt-0.5 text-base">info</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Catatan Penting</p>
                <p className="text-sm text-muted-foreground">
                  Perubahan pada role <strong>Super Admin</strong> akan berdampak langsung pada
                  keamanan inti sistem. Pastikan setidaknya satu akun tetap memiliki akses penuh ke
                  Pengaturan Sistem.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <h4 className="text-base font-semibold text-foreground mb-4">Batasan Login</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-muted-foreground">devices</span>
                    <span className="text-sm">Multi-device Login</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToggles((p) => ({ ...p, multiDevice: !p.multiDevice }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      toggles.multiDevice ? "bg-primary" : "bg-border"
                    }`}>
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        toggles.multiDevice ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-muted-foreground">
                      vpn_lock
                    </span>
                    <span className="text-sm">Wajib Gunakan VPN</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToggles((p) => ({ ...p, vpnRequired: !p.vpnRequired }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      toggles.vpnRequired ? "bg-primary" : "bg-border"
                    }`}>
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        toggles.vpnRequired ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
              <h4 className="text-base font-semibold text-foreground mb-3">Kloning Konfigurasi</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Salin setelan izin dari role Super Admin ke role lain dengan cepat.
              </p>
              <select className="w-full mb-3 p-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                <option>Pilih Role Tujuan...</option>
                <option>Admin Toko</option>
                <option>Supervisor</option>
              </select>
              <Button className="w-full gap-2">
                <span className="material-symbols-outlined text-lg">content_copy</span>
                Duplikat Izin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
