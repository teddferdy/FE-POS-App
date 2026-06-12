import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { addPurchaseOrder } from "@/services/purchase-order";
import { getAllSupplier, addSupplier } from "@/services/supplier";
import { getAllEmployee } from "@/services/employee";
import { getAllIngredients } from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import Modal from "@/components/organism/modal";

const AddPurchaseOrder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const locationParam = user?.store || "";

  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierId, setSupplierId] = useState(null);
  const [showSupplierList, setShowSupplierList] = useState(false);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { name: "", ingredientId: null, qty: 1, price: 0, unit: "pcs" }
  ]);
  const [cancelModal, setCancelModal] = useState(false);
  const [orderDate, setOrderDate] = useState(new Date());
  const [orderTime, setOrderTime] = useState(format(new Date(), "HH:mm"));
  const [picSearch, setPicSearch] = useState("");
  const [picId, setPicId] = useState(null);
  const [showPicList, setShowPicList] = useState(false);

  const { data: suppliersData } = useQuery(
    ["suppliers-dropdown"],
    () => getAllSupplier({ limit: 100 }),
    { staleTime: 30000 }
  );
  const suppliers = suppliersData?.data || [];

  const { data: employeesData } = useQuery(
    ["employees-for-po"],
    () => getAllEmployee({ limit: 100 }),
    { staleTime: 30000 }
  );
  const employees = employeesData?.data || [];

  const filteredSuppliers = suppliers.filter((s) =>
    s.name?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter((e) =>
    (e.fullName || e.userName)?.toLowerCase().includes(picSearch.toLowerCase())
  );

  const { data: ingredientsData } = useQuery(
    ["ingredients-po"],
    () => getAllIngredients({ store: locationParam, limit: 999 }),
    { staleTime: 30000 }
  );
  const ingredients = ingredientsData?.data || [];
  const [ingredientFocusIdx, setIngredientFocusIdx] = useState(null);

  const getFilteredIngredients = (search) =>
    ingredients.filter((i) => i.name?.toLowerCase().includes((search || "").toLowerCase()));

  const unitOptions = [
    { value: "pcs", label: "Pcs" },
    { value: "item", label: "Item" },
    { value: "unit", label: "Unit" },
    { value: "buah", label: "Buah" },
    { value: "pasang", label: "Pasang" },
    { value: "set", label: "Set" },
    { value: "lusin", label: "Lusin" },
    { value: "pack", label: "Pack" },
    { value: "box", label: "Box" },
    { value: "karton", label: "Karton" },
    { value: "kg", label: "Kg" },
    { value: "gram", label: "Gram" },
    { value: "liter", label: "Liter" },
    { value: "ml", label: "Ml" },
    { value: "meter", label: "Meter" },
    { value: "cm", label: "Cm" },
    { value: "cup", label: "Cup" },
    { value: "gelas", label: "Gelas" },
    { value: "porsi", label: "Porsi" }
  ];

  const addSupplierMutation = useMutation(addSupplier, {
    onSuccess: (res) => {
      const newSupplier = res.data || res;
      setSupplierSearch(newSupplier.name);
      setSupplierId(newSupplier.id || newSupplier._id);
      setShowSupplierList(false);
      toast.success("Supplier berhasil ditambahkan");
    },
    onError: (err) => {
      toast.error("Gagal tambah supplier", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const createMutation = useMutation(addPurchaseOrder, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Purchase Order berhasil dibuat" });
      navigate("/purchase-order");
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const selectSupplier = (s) => {
    setSupplierSearch(s.name);
    setSupplierId(s.id || s._id);
    setShowSupplierList(false);
  };

  const selectPic = (e) => {
    setPicSearch(e.fullName || e.userName);
    setPicId(e.id || e._id);
    setShowPicList(false);
  };
  const formatIDR = (num) => {
    if (!num && num !== 0) return "";
    return "Rp " + Number(num).toLocaleString("id-ID");
  };

  const parseIDR = (str) => {
    if (!str) return 0;
    return Number(str.replace(/[^0-9]/g, "")) || 0;
  };

  const addItem = () =>
    setItems((prev) => [...prev, { name: "", ingredientId: null, qty: 1, price: 0, unit: "pcs" }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Pilih atau tambah supplier", { description: "Pilih supplier terlebih dahulu" });
      return;
    }
    if (!picId) {
      toast.error("Pilih PIC", { description: "Pilih PIC yang bertugas terlebih dahulu" });
      return;
    }
    if (!orderDate) {
      toast.error("Pilih tanggal", { description: "Pilih tanggal purchase order" });
      return;
    }
    if (!orderTime) {
      toast.error("Pilih jam", { description: "Pilih jam purchase order" });
      return;
    }
    if (items.length === 0 || !items[0].name?.trim()) {
      toast.error("Item kosong", { description: "Tambahkan minimal satu item" });
      return;
    }
    createMutation.mutate({
      store: locationParam,
      supplier: supplierId,
      notes,
      pic: picId,
      orderDate: (() => {
        const d = new Date(orderDate);
        const [hours, minutes] = (orderTime || "00:00").split(":");
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return d;
      })(),
      items: items.map(({ name, ingredientId, qty, price, unit }) => ({
        product: null,
        ingredient: ingredientId || null,
        ingredientName: name,
        quantity: qty,
        price,
        unit: unit || "pcs"
      })),
      createdBy: user?.id
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          {
            label: t("page.purchaseOrder.list.title"),
            href: "/purchase-order",
            i18nKey: "page.purchaseOrder.list.title"
          },
          { label: t("page.purchaseOrder.add.title"), i18nKey: "page.purchaseOrder.add.title" }
        ]}
        title={t("page.purchaseOrder.add.title")}
        description={t("page.purchaseOrder.add.description")}>
        <UserGuide guideKey="add-purchase-order" />
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Informasi Supplier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Supplier <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Cari atau ketik nama supplier..."
                value={supplierSearch}
                onChange={(e) => {
                  setSupplierSearch(e.target.value);
                  setSupplierId(null);
                  setShowSupplierList(true);
                }}
                onFocus={() => setShowSupplierList(true)}
                onBlur={() => setTimeout(() => setShowSupplierList(false), 200)}
                className="h-10"
              />
              {showSupplierList && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((s) => (
                      <button
                        key={s.id || s._id}
                        type="button"
                        onMouseDown={() => selectSupplier(s)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                        {s.name}
                      </button>
                    ))
                  ) : supplierSearch ? (
                    <p className="p-3 text-xs text-muted-foreground text-center">
                      Tidak ada supplier ditemukan
                    </p>
                  ) : (
                    <p className="p-3 text-xs text-muted-foreground text-center">
                      Ketik untuk mencari supplier
                    </p>
                  )}
                  {supplierSearch && !filteredSuppliers.some((s) => s.name === supplierSearch) && (
                    <button
                      type="button"
                      onMouseDown={() => {
                        addSupplierMutation.mutate({ name: supplierSearch, isActive: true });
                      }}
                      disabled={addSupplierMutation.isLoading}
                      className="w-full text-left px-3 py-2 text-sm text-primary font-medium hover:bg-accent/50 transition-colors border-t border-border flex items-center gap-2">
                      <Plus size={15} />
                      Tambah &quot;{supplierSearch}&quot;
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                PIC <span className="text-destructive">*</span>
              </label>
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/30">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Belum ada pegawai</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tambah pegawai terlebih dahulu
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/add-employee")}
                    className="gap-2">
                    <Plus size={15} />
                    Tambah Pegawai
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Cari atau ketik nama PIC..."
                    value={picSearch}
                    onChange={(e) => {
                      setPicSearch(e.target.value);
                      setPicId(null);
                      setShowPicList(true);
                    }}
                    onFocus={() => setShowPicList(true)}
                    onBlur={() => setTimeout(() => setShowPicList(false), 200)}
                    className="h-10"
                  />
                  {showPicList && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((e) => (
                          <button
                            key={e.id || e._id}
                            type="button"
                            onMouseDown={() => selectPic(e)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                            {e.fullName || e.userName}
                          </button>
                        ))
                      ) : picSearch ? (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          Tidak ada pegawai ditemukan
                        </p>
                      ) : (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          Ketik untuk mencari pegawai
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Tanggal PO <span className="text-destructive">*</span>
              </label>
              <DatePicker date={orderDate} setDate={setOrderDate} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Jam <span className="text-destructive">*</span>
              </label>
              <TimePicker value={orderTime} onChange={setOrderTime} />
            </div>
            <div className="md:col-span-2">
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
              Belum ada item. Klik &quot;Tambah Item&quot; untuk menambahkan barang.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative flex-1 min-w-0">
                    <Input
                      placeholder="Nama barang / bahan baku"
                      value={item.name}
                      onChange={(e) => {
                        updateItem(idx, "name", e.target.value);
                        updateItem(idx, "ingredientId", null);
                        setIngredientFocusIdx(idx);
                      }}
                      onFocus={() => setIngredientFocusIdx(idx)}
                      onBlur={() => setTimeout(() => setIngredientFocusIdx(null), 200)}
                      className="h-9 text-sm w-full"
                    />
                    {ingredientFocusIdx === idx && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {!item.name ? (
                          <p className="p-3 text-xs text-muted-foreground text-center">
                            Ketik untuk mencari bahan baku
                          </p>
                        ) : getFilteredIngredients(item.name).length > 0 ? (
                          getFilteredIngredients(item.name).map((ing) => (
                            <button
                              key={ing.id}
                              type="button"
                              onMouseDown={() => {
                                updateItem(idx, "name", ing.name);
                                updateItem(idx, "ingredientId", ing.id);
                                updateItem(idx, "unit", ing.unit || "pcs");
                                setIngredientFocusIdx(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2">
                              <span>{ing.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {ing.unit || "pcs"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="p-3 text-xs text-muted-foreground text-center">
                            Tidak ada bahan baku ditemukan. Gunakan teks bebas.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Input
                    placeholder="Qty"
                    value={item.qty || ""}
                    onChange={(e) =>
                      updateItem(idx, "qty", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
                    }
                    className="h-9 text-sm w-20 shrink-0"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(idx, "unit", e.target.value)}
                    className="h-9 text-sm w-20 shrink-0 rounded-lg border border-border bg-background px-2 outline-none focus:border-primary transition-colors">
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Rp 0"
                    value={item.price ? formatIDR(item.price) : ""}
                    onChange={(e) => updateItem(idx, "price", parseIDR(e.target.value))}
                    className="h-9 text-sm w-36 shrink-0"
                  />
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

        <div className="flex justify-between items-center gap-4 bg-card border border-border rounded-xl p-4">
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
            {createMutation.isLoading ? "Menyimpan..." : "Simpan PO"}
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
