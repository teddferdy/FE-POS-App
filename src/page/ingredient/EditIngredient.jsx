import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { getIngredientById, editIngredient } from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const EditIngredient = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);

  const [form, setForm] = useState({
    name: "", unit: "pcs", baseUnit: "pcs", conversionFactor: 1,
    stock: 0, minStock: 0, costPrice: 0, supplier: "", category: "", status: "active"
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
        status: d.status || "active"
      });
    }
  }, [data]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

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
    mutation.mutate(form);
  };

  if (loadingData) return <Loading fullscreen size="lg" label="Memuat data..." />;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground">Dashboard</button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/ingredient")} className="hover:text-foreground">Bahan Baku</button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">Edit Bahan Baku</h1>
        <p className="text-sm text-muted-foreground mt-1">{form.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Nama Bahan Baku <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Input value={form.category} onChange={(e) => update("category", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Unit Pembelian</Label>
            <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              {unitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Base Unit</Label>
            <select value={form.baseUnit} onChange={(e) => update("baseUnit", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              {baseUnitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Faktor Konversi</Label>
            <Input
              type="text" inputMode="numeric"
              value={form.conversionFactor}
              onChange={(e) => update("conversionFactor", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)}
            />
            <p className="text-xs text-muted-foreground">1 {form.unit} = {form.conversionFactor} {form.baseUnit}</p>
          </div>

          <div className="space-y-2">
            <Label>Stok</Label>
            <Input type="text" inputMode="numeric" value={form.stock} onChange={(e) => update("stock", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
          </div>

          <div className="space-y-2">
            <Label>Minimal Stok</Label>
            <Input type="text" inputMode="numeric" value={form.minStock} onChange={(e) => update("minStock", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
          </div>

          <div className="space-y-2">
            <Label>Harga Beli (Rp)</Label>
            <Input type="text" inputMode="numeric" value={form.costPrice} onChange={(e) => update("costPrice", parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
            <X size={16} className="mr-1" /> Batal
          </Button>
          <Button type="submit" disabled={mutation.isLoading}>
            <Save size={16} className="mr-1" /> {mutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>

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
