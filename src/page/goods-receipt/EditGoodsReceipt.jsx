import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Save, X, Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { editGoodsReceipt, getGoodsReceiptById } from "@/services/goods-receipt";
import { getAllPurchaseOrder, getPurchaseOrderById } from "@/services/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const EditGoodsReceipt = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [poId, setPoId] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data: receiptData, isLoading: loadingReceipt } = useQuery(
    ["goods-receipt-edit", id],
    () => getGoodsReceiptById(id),
    { enabled: !!id }
  );

  const { data: poData } = useQuery(["pos-for-gr-edit"], () => getAllPurchaseOrder({ limit: 50 }), {
    staleTime: 60000
  });
  const purchaseOrders = poData?.data || [];

  useEffect(() => {
    const receipt = receiptData?.data;
    if (!receipt || loaded) return;
    setPoId(receipt.purchaseOrderId || "");
    setReceivedDate(receipt.receivedDate ? new Date(receipt.receivedDate) : new Date());
    setNotes(receipt.notes || "");
    if (receipt.items) {
      setItems(
        receipt.items.map((item) => ({
          id: item.id,
          ingredient: item.product || null,
          ingredientName: item.productData?.nameProduct || "",
          product: item.product || null,
          qty: item.qtyReceived || 0,
          unit: item.unit || "pcs",
          qtyReceived: String(item.qtyReceived || 0),
          conditionNotes: item.conditionNotes || "",
          isFromPo: true
        }))
      );
    }
    setLoaded(true);
  }, [receiptData, loaded]);

  const { data: poDetail, isLoading: loadingPo } = useQuery(
    ["po-detail-edit", poId],
    () => getPurchaseOrderById(poId),
    { enabled: !!poId }
  );

  useEffect(() => {
    if (poDetail?.data?.items && items.length === 0 && !loaded) {
      const poItems = poDetail.data.items;
      const mapped = poItems.map((item) => ({
        ingredient: item.ingredient || null,
        ingredientName: item.ingredientName || item.productData?.nameProduct || "",
        product: item.product || null,
        qty: item.quantity,
        unit: item.unit || "pcs",
        qtyReceived: "0",
        conditionNotes: "",
        isFromPo: true
      }));
      setItems(mapped);
    }
  }, [poDetail, items.length, loaded]);

  const selectedPO = purchaseOrders.find((po) => po.id === parseInt(poId));

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        ingredient: null,
        ingredientName: "",
        product: null,
        qty: 0,
        unit: "pcs",
        qtyReceived: "0",
        conditionNotes: "",
        isFromPo: false
      }
    ]);

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i !== idx ? item : { ...item, [field]: value })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poId || items.length === 0) {
      toast.error("Validasi", { description: "PO dan minimal 1 item harus diisi" });
      return;
    }
    const validItems = items.filter(
      (it) => parseFloat(it.qtyReceived) > 0 && (it.ingredientName || it.ingredient)
    );
    if (validItems.length === 0) {
      toast.error("Validasi", {
        description: "Setidaknya 1 item dengan nama dan qty diterima > 0"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await editGoodsReceipt(id, {
        receivedDate:
          receivedDate instanceof Date ? receivedDate.toISOString().split("T")[0] : receivedDate,
        notes,
        items: validItems.map((it) => ({
          ingredient: it.ingredient,
          ingredientName: it.ingredientName,
          product: it.product,
          qtyReceived: parseFloat(it.qtyReceived),
          unit: it.unit,
          conditionNotes: it.conditionNotes
        }))
      });
      toast.success("Berhasil", { description: "Goods receipt berhasil diperbarui" });
      queryClient.invalidateQueries(["goods-receipts"]);
      navigate("/goods-receipt");
    } catch (err) {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID tidak ditemukan</p>
      </div>
    );
  }

  if (loadingReceipt) {
    return (
      <Loading fullscreen size="lg" label="Memuat data..." />
    );
  }

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
        <span className="text-primary font-semibold">Edit</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">Edit Goods Receipt</h1>
        <p className="text-sm text-muted-foreground mt-1">Perbarui penerimaan barang</p>
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
              onChange={(e) => {
                setPoId(e.target.value);
                setItems([]);
                setLoaded(false);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Pilih PO</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.orderNumber}
                </option>
              ))}
            </select>
            {selectedPO && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">Status: {selectedPO.status}</span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground">
                  Store: {selectedPO.storeData?.name || "-"}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tanggal Diterima</Label>
            <DatePicker date={receivedDate} setDate={setReceivedDate} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Items</Label>
          {loadingPo ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Memuat items...
            </div>
          ) : poId ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                      Nama
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                      Qty PO
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                      Qty Diterima
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
                        {item.isFromPo ? (
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium">{item.ingredientName}</span>
                          </div>
                        ) : (
                          <Input
                            type="text"
                            value={item.ingredientName}
                            onChange={(e) => updateItem(idx, "ingredientName", e.target.value)}
                            className="h-8 text-xs"
                            placeholder="Nama barang"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.isFromPo ? (
                          <span className="text-sm text-muted-foreground">{item.qty}</span>
                        ) : (
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={item.qty || ""}
                            onChange={(e) =>
                              updateItem(idx, "qty", e.target.value.replace(/[^0-9]/g, ""))
                            }
                            className="h-8 text-xs text-center w-16 mx-auto"
                            placeholder="0"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          {item.isFromPo ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs bg-muted capitalize">
                              {item.unit}
                            </span>
                          ) : (
                            <select
                              value={item.unit}
                              onChange={(e) => updateItem(idx, "unit", e.target.value)}
                              className="h-8 px-2 rounded border border-input bg-background text-xs">
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
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={item.qtyReceived === "0" ? "" : item.qtyReceived}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "qtyReceived",
                              e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                            )
                          }
                          className="h-8 text-xs text-right w-24 ml-auto"
                          placeholder="0"
                        />
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
                        {!item.isFromPo && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-muted-foreground/30 hover:text-destructive">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Pilih purchase order terlebih dahulu
            </div>
          )}
          {poId && (
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus size={14} /> Tambah Item
            </Button>
          )}
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
          <Button type="submit" disabled={isSubmitting || items.length === 0}>
            <Save size={16} className="mr-1" /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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

export default EditGoodsReceipt;
