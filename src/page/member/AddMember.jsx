import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { addMember } from "@/services/member";
import { getAllMemberTier } from "@/services/member-tier";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const AddMember = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies(["user"]);
  const user = cookie?.user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    gender: "male",
    address: "",
    tier: "",
    initialPoints: 0
  });

  const { data: tiersData } = useQuery(["member-tiers-all"], () => getAllMemberTier(), {
    staleTime: 5 * 60 * 1000
  });
  const tiers = tiersData?.data || tiersData?.tiers || [];

  const createMutation = useMutation(addMember, {
    onSuccess: () => {
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
      setIsSubmitting(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "tier" ? Number(value) : value }));
  };

  const handleSubmit = (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!form.name || !form.phoneNumber) {
      toast.error("Validasi", { description: "Nama dan nomor telepon wajib diisi" });
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({
      nameMember: form.name,
      phoneNumber: form.phoneNumber,
      email: form.email,
      birthDate: form.birthDate,
      gender: form.gender,
      address: form.address,
      tier: form.tier,
      point: form.initialPoints,
      createdBy: user?.id,
      status: saveAsDraft ? "draft" : "active"
    });
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>{t("breadcrumb.home")}</span>
            <span>/</span>
            <button
              onClick={() => navigate("/member-list")}
              className="hover:text-primary transition-colors">
              {t("breadcrumb.management")}
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("breadcrumb.add")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("page.member.add.description")}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <span className="material-symbols-outlined">person</span>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("page.member.form.personalInfo")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Nama Lengkap
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                      placeholder="budi.santoso@email.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Nomor Telepon
                    </label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                      placeholder="0812-XXXX-XXXX"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tanggal Lahir
                    </label>
                    <input
                      name="birthDate"
                      type="date"
                      value={form.birthDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Jenis Kelamin
                    </label>
                    <div className="flex gap-4">
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={form.gender === "male"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-primary">man</span>
                        <span className="text-sm font-medium">Laki-laki</span>
                      </label>
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={form.gender === "female"}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-primary">woman</span>
                        <span className="text-sm font-medium">Perempuan</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <span className="material-symbols-outlined">location_on</span>
                  <h3 className="text-base font-semibold text-foreground">Alamat Lengkap</h3>
                </div>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-4 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm resize-none"
                  placeholder="Masukkan alamat lengkap pelanggan..."
                  rows={4}
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                <div className="flex items-center gap-2 mb-6 text-primary relative">
                  <span className="material-symbols-outlined">military_tech</span>
                  <h3 className="text-base font-semibold text-foreground">Membership Tier</h3>
                </div>
                <div className="space-y-3 relative">
                  {tiers.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-3xl text-muted-foreground block mb-2">
                        military_tech
                      </span>
                      <p className="text-sm text-muted-foreground">Belum ada tier member.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Buat tier terlebih dahulu di halaman Member Tier.
                      </p>
                    </div>
                  ) : (
                    tiers.map((tier) => (
                      <label
                        key={tier.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          form.tier === tier.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        }`}>
                        <input
                          type="radio"
                          name="tier"
                          value={tier.id}
                          checked={form.tier === tier.id}
                          onChange={handleChange}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                        </div>
                        <span className="material-symbols-outlined text-outline">
                          workspace_premium
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <span className="material-symbols-outlined">stars</span>
                  <h3 className="text-base font-semibold text-foreground">Initial Points</h3>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Saldo Awal
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    0 <span className="text-sm font-semibold text-muted-foreground">PTS</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Poin member dimulai dari 0 dan akan bertambah secara otomatis saat pelanggan
                  melakukan transaksi pembelian produk.
                </p>
              </div>

              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex gap-3">
                <span className="material-symbols-outlined text-secondary mt-0.5 text-base">
                  info
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pastikan data email dan nomor telepon sudah benar. Sistem akan mengirimkan link
                  aktivasi otomatis ke pelanggan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 mt-8 bg-card border border-border rounded-xl p-4">
            <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              {t("breadcrumb.back")}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftModal(true)}
                disabled={isSubmitting}>
                Simpan sebagai Draft
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <span className="material-symbols-outlined text-lg">save</span>
                {t("page.member.button.save")}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Data Berhasil Ditambahkan"
        onConfirm={() => navigate("/member-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/member-list")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title="Simpan sebagai Draft?"
        description="Data yang belum lengkap bisa dilengkapi nanti"
        confirmText="Ya, Simpan Draft"
        onConfirm={() => {
          setDraftModal(false);
          setIsSubmitting(true);
          createMutation.mutate({
            nameMember: form.name,
            phoneNumber: form.phoneNumber,
            email: form.email,
            birthDate: form.birthDate,
            gender: form.gender,
            address: form.address,
            tier: form.tier,
            point: form.initialPoints,
            createdBy: user?.id,
            status: "draft"
          });
        }}
      />
    </div>
  );
};

export default AddMember;
