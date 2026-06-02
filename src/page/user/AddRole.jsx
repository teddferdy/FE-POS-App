import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
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
      toast.error(t("common.error"), {
        description: t("page.user.addRole.validationNameRequired")
      });
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
          {t("page.user.adminList.title")}
        </button>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <button
          onClick={() => navigate("/global-setting")}
          className="hover:text-primary transition-colors">
          {t("page.user.addRole.systemSettings")}
        </button>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-foreground font-bold">{t("page.user.addRole.title")}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.user.addRole.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("page.user.addRole.description")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {t("page.user.button.save")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.user.addRole.roleInfo")}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.user.addRole.roleName")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder={t("page.user.addRole.roleNamePlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.user.addRole.roleDescription")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder={t("page.user.addRole.roleDescriptionPlaceholder")}
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <h4 className="text-base font-semibold text-primary mb-2">
              {t("page.user.addRole.permissionGuide")}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("page.user.addRole.permissionGuideDesc")}
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rule</span>
                <h3 className="text-base font-semibold text-foreground">
                  {t("page.user.addRole.accessMatrix")}
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => selectAll(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {t("page.user.addRole.selectAll")}
                </span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.user.addRole.moduleSystem")}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      {t("page.user.addRole.create")}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      {t("page.user.addRole.read")}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      {t("page.user.addRole.update")}
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                      {t("page.user.addRole.delete")}
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
                {t("page.user.addRole.changesNote")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label={t("common.saving")} />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("common.success")}
        onConfirm={() => navigate("/add-role")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("modal.cancelTitle")}
        confirmText={t("modal.yesCancel")}
        onConfirm={() => navigate("/global-setting")}
      />
    </div>
  );
};

export default AddRole;
