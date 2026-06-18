import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Save, X, Plus, Trash2, ShoppingCart, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { z } from "zod";
import { addPurchaseOrder } from "@/services/purchase-order";
import { getAllSupplier, addSupplier } from "@/services/supplier";
import { getAllEmployee } from "@/services/employee";
import { getAllIngredients } from "@/services/ingredient";
import { getAllLocation } from "@/services/location";
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
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AddPurchaseOrder = () => {
  const { t } = useTranslation();

  const poSchema = z.object({
    store: z.number().min(1, t("page.purchaseOrder.add.validation.store")),
    supplier: z.number().min(1, t("page.purchaseOrder.add.validation.supplier")),
    pic: z.number().min(1, t("page.purchaseOrder.add.validation.pic")),
    orderDate: z.date({ required_error: t("page.purchaseOrder.add.validation.orderDate") }),
    orderTime: z.string().min(1, t("page.purchaseOrder.add.validation.orderTime")),
    dueDate: z.date({ required_error: t("page.purchaseOrder.add.validation.dueDate") }),
    items: z
      .array(
        z.object({
          name: z.string().min(1, t("page.purchaseOrder.add.validation.itemName")),
          qty: z.number().min(1, t("page.purchaseOrder.add.validation.qty")),
          price: z.number().min(0, t("page.purchaseOrder.add.validation.price")),
          unit: z.string().min(1)
        })
      )
      .min(1, t("page.purchaseOrder.add.validation.minItem"))
  });
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const [selectedStore, setSelectedStore] = useState(user?.store || "");
  const locationParam = selectedStore;

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
  const [dueDate, setDueDate] = useState(null);
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

  const { data: locationsData } = useQuery(["locations-for-po"], () => getAllLocation(), {
    staleTime: 60000
  });
  const locations = locationsData?.data || [];

  const { data: ingredientsData } = useQuery(
    ["ingredients-po", selectedStore],
    () => getAllIngredients({ store: locationParam, limit: 999 }),
    { staleTime: 30000, enabled: !!selectedStore }
  );
  const ingredients = ingredientsData?.data || [];
  const [ingredientFocusIdx, setIngredientFocusIdx] = useState(null);

  const getFilteredIngredients = (search) =>
    ingredients.filter((i) => i.name?.toLowerCase().includes((search || "").toLowerCase()));

  const unitOptions = [
    { value: "pcs", label: t("page.product.form.unit.pcs") },
    { value: "item", label: t("page.product.form.unit.item") },
    { value: "unit", label: t("page.product.form.unit.unit") },
    { value: "buah", label: t("page.product.form.unit.buah") },
    { value: "pasang", label: t("page.product.form.unit.pasang") },
    { value: "set", label: t("page.product.form.unit.set") },
    { value: "lusin", label: t("page.product.form.unit.lusin") },
    { value: "pack", label: t("page.product.form.unit.pack") },
    { value: "box", label: t("page.product.form.unit.box") },
    { value: "karton", label: t("page.product.form.unit.karton") },
    { value: "kg", label: t("page.product.form.unit.kg") },
    { value: "gram", label: t("page.product.form.unit.gram") },
    { value: "liter", label: t("page.product.form.unit.liter") },
    { value: "ml", label: t("page.product.form.unit.ml") },
    { value: "meter", label: t("page.product.form.unit.meter") },
    { value: "cm", label: t("page.product.form.unit.cm") },
    { value: "cup", label: t("page.product.form.unit.cup") },
    { value: "gelas", label: t("page.product.form.unit.gelas") },
    { value: "porsi", label: t("page.product.form.unit.porsi") }
  ];

  const queryClient = useQueryClient();

  const addSupplierMutation = useMutation(addSupplier, {
    onSuccess: (res) => {
      const newSupplier = res.data || res;
      setSupplierSearch(newSupplier.name);
      setSupplierId(newSupplier.id || newSupplier._id);
      setShowSupplierList(false);
      toast.success(t("page.purchaseOrder.add.toast.supplierAdded"));
    },
    onError: (err) => {
      toast.error(t("page.purchaseOrder.add.toast.supplierAddFailed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const createMutation = useMutation(addPurchaseOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(["purchase-orders"]);
      toast.success(t("common.success"), {
        description: t("page.purchaseOrder.add.toast.poCreated")
      });
      navigate("/purchase-order");
    },
    onError: (err) => {
      toast.error(t("common.failed"), { description: err?.response?.data?.message || err.message });
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

  const [discount, setDiscount] = useState(0);
  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const finalAmount = totalAmount - discount;

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const result = poSchema.safeParse({
      store: selectedStore,
      supplier: supplierId,
      pic: picId,
      orderDate,
      orderTime,
      dueDate,
      items: items.filter((i) => i.name?.trim())
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0];
        if (!fieldErrors[path]) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("page.purchaseOrder.add.validation.validationFailed"), {
        description: fieldErrors[Object.keys(fieldErrors)[0]]
      });
      return;
    }

    createMutation.mutate({
      store: locationParam,
      supplier: supplierId,
      notes,
      discount,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
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
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
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
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-md rounded-xl">
              <div className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <ShoppingCart size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {t("page.purchaseOrder.add.supplierSection")}
                    </h3>
                    <p className="text-xs text-blue-100">
                      {t("page.purchaseOrder.add.supplierSectionDesc")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.store")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={selectedStore}
                      onChange={(e) => {
                        setSelectedStore(e.target.value);
                        setErrors((prev) => ({ ...prev, store: undefined }));
                      }}
                      className={`w-full h-10 px-3 rounded-lg border text-sm outline-none focus:ring-1 transition-colors ${
                        errors.store
                          ? "border-destructive focus:ring-destructive/20"
                          : "border-border focus:ring-primary/20 focus:border-primary"
                      } bg-background`}>
                      <option value="">{t("page.purchaseOrder.add.selectStore")}</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    {errors.store && (
                      <p className="text-xs text-destructive mt-1">{errors.store}</p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.supplier")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder={t("page.purchaseOrder.add.supplierPlaceholder")}
                      value={supplierSearch}
                      onChange={(e) => {
                        setSupplierSearch(e.target.value);
                        setSupplierId(null);
                        setShowSupplierList(true);
                        setErrors((prev) => ({ ...prev, supplier: undefined }));
                      }}
                      onFocus={() => setShowSupplierList(true)}
                      onBlur={() => setTimeout(() => setShowSupplierList(false), 200)}
                      className={`h-10 ${errors.supplier ? "border-destructive" : ""}`}
                    />
                    {errors.supplier && (
                      <p className="text-xs text-destructive mt-1">{errors.supplier}</p>
                    )}
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
                            {t("page.purchaseOrder.add.noSupplierFound")}
                          </p>
                        ) : (
                          <p className="p-3 text-xs text-muted-foreground text-center">
                            {t("page.purchaseOrder.add.typeToSearchSupplier")}
                          </p>
                        )}
                        {supplierSearch &&
                          !filteredSuppliers.some((s) => s.name === supplierSearch) && (
                            <button
                              type="button"
                              onMouseDown={() => {
                                addSupplierMutation.mutate({
                                  name: supplierSearch,
                                  isActive: true
                                });
                              }}
                              disabled={addSupplierMutation.isLoading}
                              className="w-full text-left px-3 py-2 text-sm text-primary font-medium hover:bg-accent/50 transition-colors border-t border-border flex items-center gap-2">
                              <Plus size={15} />
                              {t("page.purchaseOrder.add.addSupplier")} &quot;{supplierSearch}&quot;
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.pic")} <span className="text-destructive">*</span>
                    </label>
                    {employees.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/30">
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">
                            {t("page.purchaseOrder.add.noEmployee")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("page.purchaseOrder.add.addEmployeeFirst")}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/add-employee")}
                          className="gap-2">
                          <Plus size={15} />
                          {t("page.purchaseOrder.add.addEmployee")}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder={t("page.purchaseOrder.add.picPlaceholder")}
                          value={picSearch}
                          onChange={(e) => {
                            setPicSearch(e.target.value);
                            setPicId(null);
                            setShowPicList(true);
                            setErrors((prev) => ({ ...prev, pic: undefined }));
                          }}
                          onFocus={() => setShowPicList(true)}
                          onBlur={() => setTimeout(() => setShowPicList(false), 200)}
                          className={`h-10 ${errors.pic ? "border-destructive" : ""}`}
                        />
                        {errors.pic && (
                          <p className="text-xs text-destructive mt-1">{errors.pic}</p>
                        )}
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
                                {t("page.purchaseOrder.add.noEmployeeFound")}
                              </p>
                            ) : (
                              <p className="p-3 text-xs text-muted-foreground text-center">
                                {t("page.purchaseOrder.add.typeToSearchPic")}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.poDate")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <DatePicker
                      date={orderDate}
                      setDate={(d) => {
                        setOrderDate(d);
                        setErrors((prev) => ({ ...prev, orderDate: undefined }));
                      }}
                    />
                    {errors.orderDate && (
                      <p className="text-xs text-destructive mt-1">{errors.orderDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.time")} <span className="text-destructive">*</span>
                    </label>
                    <TimePicker
                      value={orderTime}
                      onChange={(v) => {
                        setOrderTime(v);
                        setErrors((prev) => ({ ...prev, orderTime: undefined }));
                      }}
                    />
                    {errors.orderTime && (
                      <p className="text-xs text-destructive mt-1">{errors.orderTime}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.dueDate")}{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <DatePicker
                      date={dueDate}
                      setDate={(d) => {
                        setDueDate(d);
                        setErrors((prev) => ({ ...prev, dueDate: undefined }));
                      }}
                    />
                    {errors.dueDate && (
                      <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("page.purchaseOrder.add.notes")}
                    </label>
                    <Textarea
                      placeholder={t("page.purchaseOrder.add.notesPlaceholder")}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-0 shadow-md rounded-xl">
              <div className="bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                      <Package size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {t("page.purchaseOrder.add.itemSection")}
                      </h3>
                      <p className="text-xs text-emerald-100">
                        {t("page.purchaseOrder.add.itemSectionDesc")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 bg-white/20 text-white hover:bg-white/30 border-0"
                    onClick={addItem}>
                    <Plus size={15} />
                    {t("page.purchaseOrder.add.addItem")}
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {errors.items && <p className="text-xs text-destructive mb-3">{errors.items}</p>}

                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t("page.purchaseOrder.add.noItem")}
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
                            placeholder={t("page.purchaseOrder.add.itemNamePlaceholder")}
                            value={item.name}
                            onChange={(e) => {
                              updateItem(idx, "name", e.target.value);
                              updateItem(idx, "ingredientId", null);
                              setIngredientFocusIdx(idx);
                              setErrors((prev) => ({ ...prev, items: undefined }));
                            }}
                            onFocus={() => setIngredientFocusIdx(idx)}
                            onBlur={() => setTimeout(() => setIngredientFocusIdx(null), 200)}
                            className="h-9 text-sm w-full"
                          />
                          {ingredientFocusIdx === idx && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {!item.name ? (
                                <p className="p-3 text-xs text-muted-foreground text-center">
                                  {t("page.purchaseOrder.add.typeToSearchIngredient")}
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
                                  {t("page.purchaseOrder.add.noIngredientFound")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <Input
                          placeholder={t("page.purchaseOrder.add.qty")}
                          value={item.qty || ""}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "qty",
                              Number(e.target.value.replace(/[^0-9]/g, "")) || 0
                            )
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
                          placeholder={t("page.purchaseOrder.add.rpPlaceholder")}
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

                <div className="bg-muted/40 rounded-xl p-5 mt-4">
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-muted-foreground font-medium">
                        {t("page.purchaseOrder.add.discount")}
                      </label>
                      <Input
                        placeholder={t("page.purchaseOrder.add.rpPlaceholder")}
                        value={discount ? formatIDR(discount) : ""}
                        onChange={(e) => setDiscount(parseIDR(e.target.value))}
                        className="h-9 text-sm w-36 text-right"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t("page.purchaseOrder.add.totalPrice")}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </p>
                    </div>
                    {discount > 0 && (
                      <>
                        <div className="w-full border-t border-border my-1" />
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-500">
                            {t("page.purchaseOrder.add.discountLabel")} - Rp{" "}
                            {discount.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xl font-bold text-foreground">
                            Rp {finalAmount.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="sticky bottom-4 flex justify-between items-center gap-4 bg-card border border-border/60 shadow-lg rounded-xl p-4 backdrop-blur-sm">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelModal(true)}
                className="gap-2">
                <X size={18} />
                {t("common.cancel")}
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">
                    {t("page.purchaseOrder.add.totalAfterDiscount")}
                  </p>
                  <p className="text-sm font-semibold">
                    Rp {(discount > 0 ? finalAmount : totalAmount).toLocaleString("id-ID")}
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="gap-2 min-w-[140px] shadow-md">
                  <Save size={18} />
                  {createMutation.isLoading
                    ? t("common.saving")
                    : t("page.purchaseOrder.add.savePo")}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.purchaseOrder.add.cancelModalTitle")}
        description={t("page.purchaseOrder.add.cancelModalDesc")}
        confirmText={t("page.purchaseOrder.add.cancelModalConfirm")}
        cancelText={t("page.purchaseOrder.add.cancelModalBack")}
        onConfirm={() => navigate("/purchase-order")}
      />
      {createMutation.isLoading && <Loading fullscreen size="lg" label={t("common.saving")} />}
    </div>
  );
};

export default AddPurchaseOrder;
