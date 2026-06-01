import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Plus, Trash2, TrendingUp } from "lucide-react";
import { addPriceListTemplate } from "@/services/price-list-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  name: z.string().min(1, "Nama template wajib diisi"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const AddPriceListTemplate = () => {
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [tiers, setTiers] = useState([{ id: Date.now(), name: "", price: 0 }]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", isActive: true }
  });

  const createMutation = useMutation(addPriceListTemplate, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan template"
      });
    }
  });

  const onSubmit = (values) => {
    const payload = { ...values, tiers: tiers.map(({ id, ...t }) => t) };
    createMutation.mutate(payload);
  };

  const addTier = () => {
    setTiers((prev) => [...prev, { id: Date.now(), name: "", price: 0 }]);
  };

  const updateTier = (id, field, value) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const removeTier = (id) => {
    if (tiers.length <= 1) return;
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/price-list-template")} className="hover:text-foreground transition-colors">
          Template Harga
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah Template</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Template Harga</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat template tingkatan harga untuk digunakan di produk.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} /> Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={createMutation.isLoading} className="gap-2">
            <Save size={18} />
            {createMutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Template <span className="text-destructive">*</span></FormLabel>
                      <Input placeholder="Contoh: Harga Retail" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <Textarea placeholder="Deskripsi template" rows={3} {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm text-muted-foreground">{field.value ? "Aktif" : "Tidak Aktif"}</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Tingkatan Harga</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Definisikan nama tingkatan yang akan muncul di produk
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                  <Input
                    placeholder="Nama tingkat (contoh: Grosir)"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                    className="h-9 text-sm flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Urutan"
                    value={tier.sortOrder ?? ""}
                    onChange={(e) => updateTier(tier.id, "sortOrder", Number(e.target.value))}
                    className="h-9 text-sm w-20"
                  />
                  {tiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => removeTier(tier.id)}>
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addTier}>
                <Plus size={15} />
                Tambah Tingkatan
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Tingkatan yang sudah dibuat akan muncul sebagai input harga di halaman produk.
            </p>
            <div className="space-y-2">
              {tiers.filter((t) => t.name).length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada tingkatan</p>
              ) : (
                tiers.filter((t) => t.name).map((tier, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <span className="font-medium text-foreground">{tier.name}</span>
                    <span className="text-muted-foreground">Rp ...</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/price-list-template")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Template harga berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/price-list-template")}
      />
    </div>
  );
};

export default AddPriceListTemplate;
