import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { createUser } from "@/services/user";
import { getAllLocation } from "@/services/location";
import { getAllRole } from "@/services/role";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

const AddAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    locationId: "",
    role: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: locationsData } = useQuery(["locations-all"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const { data: rolesData } = useQuery(["roles-all"], () => getAllRole(), {
    staleTime: 5 * 60 * 1000
  });
  const roles = rolesData?.data || rolesData?.roles || [];

  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      toast.success("Success", { description: "Admin berhasil ditambahkan" });
      queryClient.invalidateQueries(["admins", "users"]);
      navigate("/user-list");
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error("Validation", { description: "Harap isi semua field yang wajib" });
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate(form);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>Manajemen</span>
            <span>/</span>
            <button
              onClick={() => navigate("/user-list")}
              className="hover:text-primary transition-colors">
              Kelola Admin
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">Registrasi Admin Baru</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Registrasi Admin Baru
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Lengkapi informasi di bawah ini untuk menambahkan hak akses administrator baru ke
            sistem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/user-list")} className="gap-2">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            <span className="material-symbols-outlined text-lg">save</span>
            Simpan Admin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-card rounded-xl shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  Alamat Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                  placeholder="email@domain.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password Akun
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
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
                  placeholder="0812-xxxx-xxxx"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pilih Toko / Cabang
                </label>
                <div className="relative">
                  <select
                    name="locationId"
                    value={form.locationId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all appearance-none bg-background text-sm">
                    <option value="">Pilih Lokasi Penugasan</option>
                    {locations.map((loc) => (
                      <option key={loc.id || loc._id} value={loc.id || loc._id}>
                        {loc.name}
                      </option>
                    ))}
                    <option value="all">Semua Cabang (Global)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pilih Peran (Role)
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all appearance-none bg-background text-sm">
                    <option value="">Tentukan Level Akses</option>
                    {roles.map((role) => (
                      <option key={role.id || role._id} value={role.name || role.role}>
                        {(role.name || role.role)
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-start gap-3 bg-muted p-4 rounded-lg">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">
                  info
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Konfirmasi Email</p>
                  <p className="text-sm text-muted-foreground">
                    Sistem akan mengirimkan email instruksi aktivasi kepada admin baru setelah form
                    ini disimpan.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="bg-primary/10 text-primary-foreground p-6 rounded-xl shadow-sm border border-primary/20 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-base font-semibold text-primary mb-2">Panduan Hak Akses</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pastikan role yang diberikan sesuai dengan tanggung jawab operasional karyawan di
                lapangan.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  <span>Super Admin: Akses penuh seluruh sistem.</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  <span>Finance: Laporan penjualan & pajak.</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <span>Inventory: Manajemen stok & supplier.</span>
                </li>
              </ul>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[200px] text-primary">
                admin_panel_settings
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
              <span className="material-symbols-outlined text-5xl">image</span>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Keamanan Data
              </p>
              <p className="text-sm text-muted-foreground">
                Seluruh data administrator dienkripsi menggunakan standar industri AES-256 untuk
                menjamin kerahasiaan informasi perusahaan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}
    </div>
  );
};

export default AddAdmin;
