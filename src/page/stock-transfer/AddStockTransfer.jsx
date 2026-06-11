import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { transferStock } from "@/services/stock-transfer";
import { getAllLocation } from "@/services/location";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const AddStockTransfer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;

  const [fromStore, setFromStore] = useState(user?.store || "");
  const [toStore, setToStore] = useState("");
  const [notes, setNotes] = useState("");
  const [transferredBy, setTransferredBy] = useState(user?.name || "");
  const [items, setItems] = useState([{ productId: "", qty: "", unit: "pcs", notes: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { data: locData } = useQuery(["locations-for-transfer"], getAllLocation, {
    staleTime: 60000
  });
  const locations = locData?.data || locData?.locations || locData || [];

  const { data: prodData } = useQuery(["products-for-transfer"], () => getAllProduct({}), {
    staleTime: 60000
  });
  const products = prodData?.data || [];

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", qty: "", unit: "pcs", notes: "" }]);
  const removeItem = (idx) => {
    if (items.length > 1) setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateItem = (idx, field, value) =>
    setItems((prev) => prev.map((it, i) => (i !== idx ? it : { ...it, [field]: value })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromStore || !toStore || fromStore === toStore) {
      toast.error("Validasi", { description: "Toko asal dan tujuan harus berbeda" });
      return;
    }
    if (!items[0].productId) {
      toast.error("Validasi", { description: "Minimal 1 item harus diisi" });
      return;
    }
    setIsSubmitting(true);
    try {
      await transferStock({
        fromStore: parseInt(fromStore),
        toStore: parseInt(toStore),
        notes,
        transferredBy,
        items: items
          .filter((it) => it.productId && parseInt(it.qty) > 0)
          .map((it) => ({
            productId: parseInt(it.productId),
            qty: parseInt(it.qty),
            unit: it.unit,
            notes: it.notes
          }))
      });
      toast.success("Berhasil", { description: "Stock transfer dibuat" });
      queryClient.invalidateQueries(["stock-transfers"]);
      navigate("/stock-transfer");
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
        <button onClick={() => navigate("/stock-transfer")} className="hover:text-foreground">
          Stock Transfer
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold">Tambah Stock Transfer</h1>
        <p className="text-sm text-muted-foreground mt-1">Transfer stok antar toko</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-xl border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Toko Asal <span className="text-destructive">*</span>
            </Label>
            <select
              value={fromStore}
              onChange={(e) => setFromStore(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Pilih Toko</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              Toko Tujuan <span className="text-destructive">*</span>
            </Label>
            <select
              value={toStore}
              onChange={(e) => setToStore(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Pilih Toko</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dikirim Oleh</Label>
          <Input
            value={transferredBy}
            onChange={(e) => setTransferredBy(e.target.value)}
            placeholder="Nama pengirim"
          />
        </div>

        <div className="space-y-2">
          <Label>Items</Label>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                    Produk
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
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-muted/20">
                    <td className="px-3 py-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(idx, "productId", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                        <option value="">Pilih Produk</option>
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
                        value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", e.target.value)}
                        className="h-8 text-xs text-right"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                        <option value="box">box</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.notes}
                        onChange={(e) => updateItem(idx, "notes", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Catatan"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => removeItem(idx)}
                        className="text-muted-foreground/30 hover:text-destructive disabled:opacity-20">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus size={14} /> Tambah Item
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Catatan</Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan transfer (opsional)"
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
          navigate("/stock-transfer");
        }}
      />
    </div>
  );
};

export default AddStockTransfer;
