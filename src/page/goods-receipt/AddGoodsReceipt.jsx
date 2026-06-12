import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addGoodsReceipt } from "@/services/goods-receipt";
import { getAllPurchaseOrder } from "@/services/purchase-order";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const AddGoodsReceipt = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [poId, setPoId] = useState(searchParams.get("poId") || "");
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product: "", qtyReceived: "", unit: "pcs", conditionNotes: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { data: poData } = useQuery(["pos-for-gr"], () => getAllPurchaseOrder({ limit: 50 }), {
    staleTime: 60000
  });
  const purchaseOrders = poData?.data || [];

  const { data: productsData } = useQuery(["products-for-gr"], () => getAllProduct({}), {
    staleTime: 60000
  });
  const products = productsData?.data || [];

  const selectedPO = purchaseOrders.find((po) => po.id === parseInt(poId));

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { product: "", qtyReceived: "", unit: "pcs", conditionNotes: "" }
    ]);

  const removeItem = (idx) => {
    if (items.length > 1) setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i !== idx ? item : { ...item, [field]: value })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poId || items.length === 0 || !items[0].product) {
      toast.error("Validasi", { description: "PO dan minimal 1 item harus diisi" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        purchaseOrderId: parseInt(poId),
        receivedDate:
          receivedDate instanceof Date ? receivedDate.toISOString().split("T")[0] : receivedDate,
        notes,
        items: items
          .filter((it) => it.product && parseInt(it.qtyReceived) > 0)
          .map((it) => ({
            product: parseInt(it.product),
            qtyReceived: parseInt(it.qtyReceived),
            unit: it.unit,
            conditionNotes: it.conditionNotes
          }))
      };
      await addGoodsReceipt(payload);
      toast.success("Berhasil", { description: "Goods receipt berhasil dibuat" });
      queryClient.invalidateQueries(["goods-receipts"]);
      navigate("/goods-receipt");
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
        <button onClick={() => navigate("/goods-receipt")} className="hover:text-foreground">
          Goods Receipt
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">Tambah Goods Receipt</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Catat penerimaan barang dari purchase order
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-xl border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Purchase Order <span className="text-destructive">*</span>
            </Label>
            <select
              value={poId}
              onChange={(e) => setPoId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Pilih PO</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.orderNumber}
                </option>
              ))}
            </select>
            {selectedPO && (
              <p className="text-xs text-muted-foreground">Status: {selectedPO.status}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tanggal Diterima</Label>
            <DatePicker date={receivedDate} setDate={setReceivedDate} />
          </div>
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
                        value={item.product}
                        onChange={(e) => updateItem(idx, "product", e.target.value)}
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
                        value={item.qtyReceived}
                        onChange={(e) => updateItem(idx, "qtyReceived", e.target.value)}
                        className="h-8 text-xs text-right"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                        <option value="pcs">Pcs</option>
                        <option value="buah">Buah</option>
                        <option value="kg">Kg</option>
                        <option value="gram">Gram</option>
                        <option value="liter">Liter</option>
                        <option value="ml">Ml</option>
                        <option value="meter">Meter</option>
                        <option value="cm">Cm</option>
                        <option value="lusin">Lusin</option>
                        <option value="box">Box</option>
                        <option value="pack">Pack</option>
                        <option value="karton">Karton</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={item.conditionNotes}
                        onChange={(e) => updateItem(idx, "conditionNotes", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Kondisi (opsional)"
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
            placeholder="Catatan penerimaan (opsional)"
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
          navigate("/goods-receipt");
        }}
      />
    </div>
  );
};

export default AddGoodsReceipt;
