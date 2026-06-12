import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { getIngredientById, editIngredient } from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const unitOptions = [
  { value: "pcs", label: "Pcs" }, { value: "buah", label: "Buah" },
  { value: "kg", label: "Kg" }, { value: "gram", label: "Gram" },
  { value: "liter", label: "Liter" }, { value: "ml", label: "Ml" },
  { value: "meter", label: "Meter" }, { value: "cm", label: "Cm" },
  { value: "lusin", label: "Lusin" }, { value: "pack", label: "Pack" },
  { value: "box", label: "Box" }, { value: "karton", label: "Karton" }
];

const baseUnitOptions = [
  { value: "pcs", label: "Pcs" }, { value: "gram", label: "Gram" },
  { value: "ml", label: "Ml" }, { value: "cm", label: "Cm" },
  { value: "buah", label: "Buah" }, { value: "lembar", label: "Lembar" }
];

const conversionHints = {
  kg: { base: "gram", factor: 1000 },
  liter: { base: "ml", factor: 1000 },
  meter: { base: "cm", factor: 100 },
  lusin: { base: "pcs", factor: 12 },
  karton: { base: "pcs", factor: 50 },
  box: { base: "pcs", factor: 10 },
  pack: { base: "pcs", factor: 5 }
};

const EditIngredient = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);

  const [form, setForm] = useState({
    name: "", unit: "pcs", baseUnit: "pcs", conversionFactor: 1,
    stock: 0, minStock: 0, costPrice: 0, supplier: "", category: "", isActive: true
  });

  const { data, isLoading: loadingData } = useQuery(
    ["ingredient", id],
    () => getIngredientById(id),
    { enabled: !!id }
  );

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      setForm({
        name: d.name || "",
        unit: d.unit || "pcs",
        baseUnit: d.baseUnit || d.unit || "pcs",
        conversionFactor: d.conversionFactor ?? 1,
        stock: d.stock ?? 0,
        minStock: d.minStock ?? 0,
        costPrice: d.costPrice ?? 0,
        supplier: d.supplier || "",
        category: d.category || "",
        isActive: d.status !== "inactive"
      });
    }
  }, [data]);

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    if (field === "unit") {
      const hint = conversionHints[value];
      if (hint) {
        next.baseUnit = hint.base;
        next.conversionFactor = hint.factor;
      } else {
        next.baseUnit = value;
        next.conversionFactor = 1;
      }
    }
    setForm(next);
  };

  const mutation = useMutation((payload) => editIngredient(id, payload), {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Bahan baku berhasil diubah" });
      queryClient.invalidateQueries(["ingredients"]);
      navigate("/ingredient");
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Validasi", { description: "Nama bahan baku harus diisi" });
      return;
    }
    mutation.mutate({ ...form, status: form.isActive ? "active" : "inactive" });
  };

  if (loadingData) return <Loading fullscreen size="lg" label="Memuat data..." />;

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-primary transition-colors">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/ingredient")} className="hover:text-primary transition-colors">Bahan Baku</button>
            <span>/</span>
            <span className="text-primary font-semibold">Edit</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Edit Bahan Baku</h2>
          <p className="text-sm text-muted-foreground mt-1">{form.name}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-foreground mb-6">Informasi Bahan Baku</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Nama Bahan Baku <span className="text-destructive">*</span>
                    </Label>
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori</Label>
                      <Input value={form.category} onChange={(e) => update("category", e.target.value)} className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</Label>
                      <Input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} className="h-12" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-foreground mb-6">Konversi Satuan</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Pembelian</Label>
                      <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm">
                        {unitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Unit</Label>
                      <select value={form.baseUnit} onChange={(e) => update("baseUnit", e.target.value)} className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm">
                        {baseUnitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Faktor Konversi</Label>
                      <Input
                        type="text" inputMode="numeric" className="h-12"
                        value={form.conversionFactor}
                        onChange={(e) => update("conversionFactor", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                      />
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      1 <span className="font-semibold text-foreground">{form.unit}</span> = {form.conversionFactor} <span className="font-semibold text-foreground">{form.baseUnit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.unit === "kg" ? "Contoh: 1 Kg = 1000 Gram" :
                       form.unit === "liter" ? "Contoh: 1 Liter = 1000 Ml" :
                       form.unit === "meter" ? "Contoh: 1 Meter = 100 Cm" :
                       form.unit === "lusin" ? "Contoh: 1 Lusin = 12 Pcs" :
                       form.unit === "karton" ? "Contoh: 1 Karton = 50 Pcs" :
                       form.unit === "box" ? "Contoh: 1 Box = 10 Pcs" :
                       form.unit === "pack" ? "Contoh: 1 Pack = 5 Pcs" :
                       "Unit ini tidak memiliki konversi otomatis"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-foreground mb-6">Stok & Harga</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stok</Label>
                    <Input type="text" inputMode="numeric" className="h-12" value={form.stock} onChange={(e) => update("stock", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minimal Stok</Label>
                    <Input type="text" inputMode="numeric" className="h-12" value={form.minStock} onChange={(e) => update("minStock", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Harga Beli (Rp)</Label>
                    <Input type="text" inputMode="numeric" className="h-12" value={form.costPrice} onChange={(e) => update("costPrice", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-foreground mb-6">Status</h3>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                      form.isActive
                        ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                    }`}
                    onClick={() => update("isActive", !form.isActive)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          form.isActive
                            ? "bg-green-600 text-white"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {form.isActive ? "check" : "close"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {form.isActive ? "Aktif" : "Nonaktif"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {form.isActive
                            ? "Bahan baku ini aktif dan dapat digunakan"
                            : "Bahan baku ini tidak aktif"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={form.isActive} onCheckedChange={(v) => update("isActive", v)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-base">info</span>
                  <span className="text-sm font-semibold text-primary">Tips Penamaan</span>
                </div>
                <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>Gunakan nama yang spesifik dan mudah dikenali, contoh: <span className="text-foreground font-medium">"Tepung Terigu Protein Tinggi"</span> bukan hanya "Tepung".</p>
                  <p>Jika bahan baku memiliki varian (ukuran/warna), tambahkan informasi tersebut pada nama.</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-base">swap_horiz</span>
                  <span className="text-sm font-semibold text-foreground">Konversi Satuan</span>
                </div>
                <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p><span className="text-foreground font-medium">Unit Pembelian:</span> Satuan yang digunakan saat membeli dari supplier.</p>
                  <p><span className="text-foreground font-medium">Base Unit:</span> Satuan terkecil untuk perhitungan stok dan resep.</p>
                  <p><span className="text-foreground font-medium">Faktor Konversi:</span> Jumlah base unit per unit pembelian.</p>
                  <div className="bg-background rounded-lg p-3 border border-border mt-2">
                    <p className="text-foreground font-medium mb-1">Contoh:</p>
                    <p>1 Kg = 1000 Gram <span className="text-muted-foreground">(faktor: 1000)</span></p>
                    <p>1 Lusin = 12 Pcs <span className="text-muted-foreground">(faktor: 12)</span></p>
                    <p>1 Karton = 50 Pcs <span className="text-muted-foreground">(faktor: 50)</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-base">inventory_2</span>
                  <span className="text-sm font-semibold text-foreground">Manajemen Stok</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p>Atur <span className="text-foreground font-medium">Minimal Stok</span> untuk mendapatkan notifikasi saat stok menipis dan perlu dilakukan pemesanan ulang.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> Batal
            </Button>
            <Button type="submit" disabled={mutation.isLoading}>
              <Save size={16} className="mr-1" /> {mutation.isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>

      {mutation.isLoading && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="confirm" open={cancelModal}
        onOpenChange={(o) => !o && setCancelModal(false)}
        title="Batalkan?" description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => { setCancelModal(false); navigate("/ingredient"); }}
      />
    </div>
  );
};

export default EditIngredient;
