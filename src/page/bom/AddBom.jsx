import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { addBom } from "@/services/bom";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const AddBom = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ ingredientId: "", qty: "", unit: "pcs", notes: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { data: prodData } = useQuery(["products-for-bom"], () => getAllProduct({}), {
    staleTime: 60000
  });
  const products = prodData?.data || [];

  const addLine = () =>
    setLines((prev) => [...prev, { ingredientId: "", qty: "", unit: "pcs", notes: "" }]);
  const removeLine = (idx) => {
    if (lines.length > 1) setLines((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateLine = (idx, field, value) =>
    setLines((prev) => prev.map((it, i) => (i !== idx ? it : { ...it, [field]: value })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Validasi", { description: "Pilih produk" });
      return;
    }
    if (!lines[0].ingredientId) {
      toast.error("Validasi", { description: "Minimal 1 bahan baku" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addBom({
        productId: parseInt(productId),
        name: name || undefined,
        notes,
        lines: lines
          .filter((l) => l.ingredientId && parseInt(l.qty) > 0)
          .map((l) => ({
            ingredientId: parseInt(l.ingredientId),
            qty: parseInt(l.qty),
            unit: l.unit,
            notes: l.notes
          }))
      });
      toast.success("Berhasil", { description: "BOM dibuat" });
      queryClient.invalidateQueries(["bom-list"]);
      navigate("/bom");
    } catch (err) {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/bom")} className="hover:text-foreground">
          BOM
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold">Tambah BOM</h1>
        <p className="text-sm text-muted-foreground mt-1">Buat Bill of Materials untuk produk</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-xl border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Produk <span className="text-destructive">*</span>
            </Label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Pilih Produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameProduct} ({p.sku || "-"})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Nama BOM</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Auto-generated jika kosong"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bahan Baku</Label>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                    Bahan
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                    Catatan
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-b border-muted/20">
                    <td className="px-3 py-2">
                      <select
                        value={line.ingredientId}
                        onChange={(e) => updateLine(idx, "ingredientId", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                        <option value="">Pilih Bahan</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameProduct}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => updateLine(idx, "qty", e.target.value)}
                        className="h-8 text-xs text-right"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={line.unit}
                        onChange={(e) => updateLine(idx, "unit", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                        <option value="box">box</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={line.notes}
                        onChange={(e) => updateLine(idx, "notes", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Catatan"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        disabled={lines.length <= 1}
                        onClick={() => removeLine(idx)}
                        className="text-muted-foreground/30 hover:text-destructive disabled:opacity-20">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1">
            <Plus size={14} /> Tambah Baris
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Catatan</Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan (opsional)"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
            <X size={16} className="mr-1" /> Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} className="mr-1" /> {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={(o) => !o && setCancelModal(false)}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => {
          setCancelModal(false);
          navigate("/bom");
        }}
      />
    </div>
  );
};

export default AddBom;
