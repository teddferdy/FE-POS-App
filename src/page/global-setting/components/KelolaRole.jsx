import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    id: "R-001",
    name: "Super Admin",
    desc: "Akses penuh ke seluruh sistem dan pengaturan global.",
    users: "2 User",
    status: "active"
  },
  {
    id: "R-002",
    name: "Admin Toko",
    desc: "Mengelola operasional harian, stok, dan laporan toko spesifik.",
    users: "15 User",
    status: "active"
  },
  {
    id: "R-003",
    name: "Kasir",
    desc: "Akses modul POS, input transaksi, dan tutup shift kasir.",
    users: "42 User",
    status: "active"
  },
  {
    id: "R-004",
    name: "Staff Gudang",
    desc: "Manajemen stok masuk/keluar, opname, dan retur barang.",
    users: "8 User",
    status: "inactive"
  }
];

const KelolaRole = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(roles.length / itemsPerPage);

  const paginatedRoles = roles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusBadge = (status) => {
    const styles = {
      active: "bg-secondary/10 text-secondary",
      inactive: "bg-outline-variant/30 text-on-surface-variant"
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
        <span
          className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-secondary" : "bg-outline-variant"}`}
        />
        {status === "active" ? t("common.active") : t("common.inactive")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          {/* <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <span>Pengaturan Sistem</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-semibold">Kelola Role</span>
          </nav> */}
          <h2 className="text-2xl font-bold">{t("page.globalSetting.roleManagement.title")}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("page.globalSetting.roleManagement.description")}
          </p>
        </div>
        <button
          onClick={() => navigate("/add-role")}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
          <Plus size={18} />
          <span className="font-medium">{t("page.globalSetting.roleManagement.addRole")}</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="text-primary" size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("page.globalSetting.roleManagement.totalRoles")}
            </p>
            <p className="text-lg font-bold">12</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
            <ShieldCheck className="text-secondary" size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("page.globalSetting.roleManagement.activeRoles")}
            </p>
            <p className="text-lg font-bold">10</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-tertiary/20 flex items-center justify-center">
            <Plus className="text-tertiary" size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("page.globalSetting.roleManagement.newRegistrations")}
            </p>
            <p className="text-lg font-bold">+4</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
            <ShieldCheck className="text-destructive" size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("page.globalSetting.roleManagement.needsReview")}
            </p>
            <p className="text-lg font-bold">2</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {t("page.globalSetting.roleManagement.accessList")}
            </span>
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase">
              {t("page.globalSetting.roleManagement.masterList")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
            <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("page.globalSetting.roleManagement.table.id")}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("page.globalSetting.roleManagement.table.name")}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("page.globalSetting.roleManagement.table.description")}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("page.globalSetting.roleManagement.table.users")}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("common.status")}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRoles.map((role) => (
                <tr key={role.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{role.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="text-primary" size={14} />
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{role.desc}</td>
                  <td className="px-6 py-4 text-sm">{role.users}</td>
                  <td className="px-6 py-4">{statusBadge(role.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-primary/10 hover:text-primary transition-all rounded-lg text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button className="p-2 hover:bg-destructive/10 hover:text-destructive transition-all rounded-lg text-muted-foreground">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground">
            {t("page.globalSetting.roleManagement.showing", {
              count: paginatedRoles.length,
              total: roles.length
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-all disabled:opacity-30"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}>
              {t("page.globalSetting.roleManagement.previous")}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === i + 1
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-all disabled:opacity-30"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}>
              {t("page.globalSetting.roleManagement.next")}
            </button>
          </div>
        </div>
      </div>

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

export default KelolaRole;
