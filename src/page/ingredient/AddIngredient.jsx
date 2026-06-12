import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { addIngredient } from "@/services/ingredient";
import { getAllSupplier } from "@/services/supplier";
import { getAllIngredientCategory } from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import {
  Form, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import UserGuide from "@/components/organism/UserGuide";

const unitOptions = [
  { value: "pcs", label: "Pcs" }, { value: "buah", label: "Buah" },
  { value: "kg", label: "Kg" }, { value: "gram", label: "Gram" },
  { value: "liter", label: "Liter" }, { value: "ml", label: "Ml" },
  { value: "meter", label: "Meter" }, { value: "cm", label: "Cm" },
  { value: "lusin", label: "Lusin" }, { value: "pack", label: "Pack" },
  { value: "box", label: "Box" }, { value: "karton", label: "Karton" }
];

const baseUnitOptions = [
  { value: "pcs", label: "Pcs" },
  { value: "gram", label: "Gram" },
  { value: "ml", label: "Ml" },
  { value: "cm", label: "Cm" },
  { value: "buah", label: "Buah" },
  { value: "lembar", label: "Lembar" }
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

const formSchema = z.object({
  name: z.string().min(1, "Nama bahan baku harus diisi"),
  supplier: z.string().nullable(),
  category: z.string().nullable(),
  unit: z.string(),
  baseUnit: z.string(),
  conversionFactor: z.number(),
  stock: z.number(),
  minStock: z.number(),
  costPrice: z.number(),
  isActive: z.boolean()
});

const AddIngredient = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [cancelModal, setCancelModal] = React.useState(false);

  const { data: suppliersData } = useQuery(
    ["suppliers-dropdown"],
    () => getAllSupplier({ limit: 999 }),
    {}
  );
  const suppliers = suppliersData?.data || [];

  const { data: categoriesData } = useQuery(
    ["ingredient-categories-dropdown"],
    () => getAllIngredientCategory(),
    {}
  );
  const categories = categoriesData?.data || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unit: "pcs",
      baseUnit: "pcs",
      conversionFactor: 1,
      stock: 0,
      minStock: 0,
      costPrice: 0,
      supplier: null,
      category: null,
      isActive: true
    }
  });

  const watchUnit = form.watch("unit");
  const watchBaseUnit = form.watch("baseUnit");
  const watchConversionFactor = form.watch("conversionFactor");

  React.useEffect(() => {
    const hint = conversionHints[watchUnit];
    if (hint) {
      form.setValue("baseUnit", hint.base);
      form.setValue("conversionFactor", hint.factor);
    } else {
      form.setValue("baseUnit", watchUnit);
      form.setValue("conversionFactor", 1);
    }
  }, [watchUnit]);

  const mutation = useMutation(addIngredient, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Bahan baku berhasil ditambahkan" });
      queryClient.invalidateQueries(["ingredients"]);
      navigate("/ingredient");
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const onSubmit = (values) => {
    mutation.mutate({
      ...values,
      supplier: values.supplier ? parseInt(values.supplier) : null,
      category: values.category ? parseInt(values.category) : null,
      status: values.isActive ? "active" : "inactive",
      store: cookie?.user?.store
    });
  };

  const convLabel =
    watchUnit === "kg" ? "Contoh: 1 Kg = 1000 Gram" :
    watchUnit === "liter" ? "Contoh: 1 Liter = 1000 Ml" :
    watchUnit === "meter" ? "Contoh: 1 Meter = 100 Cm" :
    watchUnit === "lusin" ? "Contoh: 1 Lusin = 12 Pcs" :
    watchUnit === "karton" ? "Contoh: 1 Karton = 50 Pcs" :
    watchUnit === "box" ? "Contoh: 1 Box = 10 Pcs" :
    watchUnit === "pack" ? "Contoh: 1 Pack = 5 Pcs" :
    "Unit ini tidak memiliki konversi otomatis";

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-primary transition-colors">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/ingredient")} className="hover:text-primary transition-colors">Bahan Baku</button>
            <span>/</span>
            <span className="text-primary font-semibold">Tambah</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Tambah Bahan Baku</h2>
          <p className="text-sm text-muted-foreground mt-1">Tambahkan bahan baku atau material baru</p>
        </div>
        <UserGuide guideKey="add-ingredient" />
      </div>

      <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-base font-semibold text-foreground mb-6">Informasi Bahan Baku</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Nama Bahan Baku <span className="text-destructive">*</span>
                          </FormLabel>
                          <Input {...field} placeholder="Contoh: Tepung Terigu" className="h-12" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori</FormLabel>
                            <Combobox
                              options={categories.filter((c) => c.status === "active").map((c) => ({ value: String(c.id), label: c.name }))}
                              value={field.value || ""}
                              onChange={(v) => field.onChange(v || null)}
                              placeholder="Pilih kategori"
                              searchPlaceholder="Cari kategori..."
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</FormLabel>
                            <Combobox
                              options={suppliers.filter((s) => s.status === "active").map((s) => ({ value: String(s.id), label: s.name }))}
                              value={field.value || ""}
                              onChange={(v) => field.onChange(v || null)}
                              placeholder="Pilih supplier"
                              searchPlaceholder="Cari supplier..."
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-base font-semibold text-foreground mb-6">Konversi Satuan</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Pembelian</FormLabel>
                            <select
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm"
                            >
                              {unitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="baseUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Unit</FormLabel>
                            <select
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm"
                            >
                              {baseUnitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="conversionFactor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Faktor Konversi</FormLabel>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                              placeholder="1000"
                              className="h-12"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <p className="text-sm text-muted-foreground">
                        1 <span className="font-semibold text-foreground">{watchUnit}</span> = {watchConversionFactor} <span className="font-semibold text-foreground">{watchBaseUnit}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{convLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-base font-semibold text-foreground mb-6">Stok & Harga</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stok Awal</FormLabel>
                          <Input
                            type="text" inputMode="numeric" className="h-12"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                          />
                          <p className="text-xs text-muted-foreground">Jumlah stok masuk pertama kali</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minimal Stok</FormLabel>
                          <Input
                            type="text" inputMode="numeric" className="h-12"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                          />
                          <p className="text-xs text-muted-foreground">Notifikasi stok menipis jika di bawah batas ini</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Harga Beli (Rp)</FormLabel>
                          <Input
                            type="text" inputMode="numeric" className="h-12"
                            value={field.value ? field.value.toLocaleString("id-ID") : "0"}
                            onChange={(e) => field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-base font-semibold text-foreground mb-6">Status</h3>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <div
                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                            field.value
                              ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                          }`}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                field.value
                                  ? "bg-green-600 text-white"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {field.value ? "check" : "close"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {field.value ? "Aktif" : "Nonaktif"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {field.value
                                  ? "Bahan baku ini aktif dan dapat digunakan"
                                  : "Bahan baku ini tidak aktif"}
                              </p>
                            </div>
                          </div>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-base">info</span>
                    <span className="text-sm font-semibold text-primary">Tips Penamaan</span>
                  </div>
                  <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                    <p>Gunakan nama yang spesifik dan mudah dikenali, contoh: <span className="text-foreground font-medium">&quot;Tepung Terigu Protein Tinggi&quot;</span> bukan hanya &quot;Tepung&quot;.</p>
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
        </Form>
      </div>

      {mutation.isLoading && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={(o) => !o && setCancelModal(false)}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => { setCancelModal(false); navigate("/ingredient"); }}
      />
    </div>
  );
};

export default AddIngredient;
