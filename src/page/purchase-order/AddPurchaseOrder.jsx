import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Save, X, Plus, Trash2, Search as SearchIcon } from "lucide-react";
import { addPurchaseOrder } from "@/services/purchase-order";
import { getAllSupplier } from "@/services/supplier";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const AddPurchaseOrder = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const locationParam = user?.store || "";

  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ productId: "", productName: "", qty: 1, price: 0 }]);
  const [cancelModal, setCancelModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");

  const { data: suppliersData } = useQuery(
    ["suppliers-dropdown"],
    () => getAllSupplier({ limit: 100 }),
    { staleTime: 30000 }
  );
  const suppliers = suppliersData?.data || [];

  const { data: productsData } = useQuery(
    ["products-for-po", searchProduct],
    () => getAllProduct({ location: locationParam, nameProduct: searchProduct, category: "" }),
    { enabled: searchOpen, staleTime: 30000 }
  );
  const products = productsData?.data || [];

  const createMutation = useMutation(addPurchaseOrder, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Purchase Order berhasil dibuat" });
      navigate("/purchase-order");
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", productName: "", qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const selectProduct = (product, idx) => {
    updateItem(idx, "productId", product.id || product._id);
    updateItem(idx, "productName", product.nameProduct || product.name);
    updateItem(idx, "price", product.price || 0);
    setSearchOpen(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier) {
      toast.error("Pilih supplier", { description: "Pilih supplier terlebih dahulu" });
      return;
    }
    if (items.length === 0 || !items[0].productId) {
      toast.error("Item kosong", { description: "Tambahkan minimal satu produk" });
      return;
    }
    createMutation.mutate({
      store: locationParam,
      supplier,
      notes,
      items: items.map(({ productId, qty, price }) => ({ product: productId, qty, price })),
      createdBy: user?.id
    });
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/purchase-order")}
          className="hover:text-foreground transition-colors">
          Purchase Order
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Buat PO</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buat Purchase Order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat pemesanan pembelian barang ke supplier.
          </p>
        </div>
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <X size={18} />
          Batal
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Informasi Supplier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Supplier <span className="text-destructive">*</span>
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors">
                <option value="">Pilih Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Catatan</label>
              <Textarea
                placeholder="Catatan untuk supplier (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Item Barang</h3>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addItem}>
              <Plus size={15} />
              Tambah Item
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada item. Klik &quot;Tambah Item&quot; untuk menambahkan produk.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="flex-1 min-w-0 relative">
                    <Input
                      placeholder="Cari produk..."
                      value={item.productName}
                      onFocus={() => {
                        setSearchOpen(true);
                        setSearchProduct("");
                      }}
                      readOnly
                      className="h-9 text-sm cursor-pointer pr-8"
                    />
                    <SearchIcon
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    {searchOpen && !item.productName && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <Input
                          placeholder="Cari produk..."
                          value={searchProduct}
                          onChange={(e) => setSearchProduct(e.target.value)}
                          className="border-0 border-b border-border rounded-none h-9 text-sm"
                          autoFocus
                        />
                        {products.length === 0 ? (
                          <p className="p-3 text-xs text-muted-foreground text-center">
                            Tidak ada produk
                          </p>
                        ) : (
                          products.map((p) => (
                            <button
                              key={p.id || p._id}
                              type="button"
                              onClick={() => selectProduct(p, idx)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2">
                              <span className="flex-1 truncate">{p.nameProduct || p.name}</span>
                              {p.barcode && (
                                <span className="text-[10px] text-muted-foreground">
                                  {p.barcode}
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    min={1}
                    onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                    className="h-9 text-sm w-20 shrink-0"
                  />
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                      className="h-9 text-sm pl-8"
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-28 text-right shrink-0">
                    Rp {(item.qty * item.price).toLocaleString("id-ID")}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => removeItem(idx)}>
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t border-border">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">
                Rp {totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCancelModal(true)}
            className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isLoading} className="gap-2 shadow-md">
            {createMutation.isLoading ? (
              <Loading size="sm" className="text-white" />
            ) : (
              <Save size={18} />
            )}
            Simpan PO
          </Button>
        </div>
      </form>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan?"
        description="Data yang sudah diisi tidak akan disimpan."
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan"
        onConfirm={() => navigate("/purchase-order")}
      />
    </div>
  );
};

export default AddPurchaseOrder;
