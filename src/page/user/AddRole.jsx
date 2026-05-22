/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { addRole } from "@/services/role";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const modules = [
  {
    icon: "receipt_long",
    label: "Penjualan & Transaksi",
    desc: "POS, Refund, Riwayat Transaksi",
    iconBg: "bg-emerald-100 text-emerald-600"
  },
  {
    icon: "inventory_2",
    label: "Inventori & Stok",
    desc: "Manajemen Produk, Stok Opname",
    iconBg: "bg-blue-100 text-blue-600"
  },
  {
    icon: "groups",
    label: "Karyawan & Payroll",
    desc: "Absensi, Gaji, Jadwal Shift",
    iconBg: "bg-amber-100 text-amber-600"
  },
  {
    icon: "settings_applications",
    label: "Pengaturan Sistem",
    desc: "Integrasi API, Konfigurasi Pajak",
    iconBg: "bg-slate-100 text-slate-600"
  },
  {
    icon: "monitoring",
    label: "Laporan & Analitik",
    desc: "Profit/Loss, Data Pelanggan",
    iconBg: "bg-purple-100 text-purple-600"
  }
];

const initialPermissions = modules.reduce((acc, mod) => {
  acc[mod.label] = { c: false, r: false, u: false, d: false };
  return acc;
}, {});

const AddRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState(initialPermissions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const createMutation = useMutation(addRole, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roles-all"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const togglePermission = (moduleLabel, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleLabel]: {
        ...prev[moduleLabel],
        [action]: !prev[moduleLabel][action]
      }
    }));
  };

  const allSelected = Object.values(permissions).every((p) => p.c && p.r && p.u && p.d);

  const selectAll = (checked) => {
    const updated = {};
    Object.keys(permissions).forEach((key) => {
      updated[key] = { c: checked, r: checked, u: checked, d: checked };
    });
    setPermissions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Validation", { description: "Nama role wajib diisi" });
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({ name, description, permissions });
  };

  return (
    <div>
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/user-list")}
          className="hover:text-primary transition-colors">
          Kelola Admin
        </button>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <button
          onClick={() => navigate("/global-setting")}
          className="hover:text-primary transition-colors">
          Pengaturan Sistem
        </button>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-foreground font-bold">Tambah Role Baru</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Tambah Role Baru</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Definisikan tanggung jawab dan izin akses untuk tingkat otoritas baru.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            Simpan Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-foreground">Informasi Role</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nama Role
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Contoh: Cashier, Inventory Manager"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Deskripsi Role
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Jelaskan cakupan tugas role ini..."
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <h4 className="text-base font-semibold text-primary mb-2">Panduan Izin</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Izin 'Create' memungkinkan pengguna menambahkan data baru. 'Read' untuk melihat data.
              'Update' untuk mengubah data yang ada, dan 'Delete' untuk menghapus record secara
              permanen.
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rule</span>
                <h3 className="text-base font-semibold text-foreground">Matriks Hak Akses</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => selectAll(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  Pilih Semua Hak Akses
                </span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Modul Sistem
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      Create
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      Read
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      Update
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modules.map((mod) => {
                    const perm = permissions[mod.label] || {};
                    return (
                      <tr key={mod.label} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${mod.iconBg}`}>
                              <span className="material-symbols-outlined text-lg">{mod.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {mod.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{mod.desc}</p>
                            </div>
                          </div>
                        </td>
                        {["c", "r", "u", "d"].map((action) => (
                          <td key={action} className="px-4 py-5 text-center">
                            <input
                              type="checkbox"
                              checked={!!perm[action]}
                              onChange={() => togglePermission(mod.label, action)}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-muted/20 text-right border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                * Perubahan hak akses akan segera berlaku bagi pengguna dengan role ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Data Berhasil Ditambahkan"
        onConfirm={() => navigate("/role-management")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/global-setting")}
      />
    </div>
  );
};

export default AddRole;
