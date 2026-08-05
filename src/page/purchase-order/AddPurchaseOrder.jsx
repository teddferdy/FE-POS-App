import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useStore } from "@/contexts/StoreContext";
import { toast } from "sonner";
import { Save, X, Plus, ShoppingCart } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Combobox } from "@/components/ui/combobox";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import Modal from "@/components/organism/modal";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import OrderItemsCard from "@/components/organism/OrderItemsCard";
import { getMissingFields } from "@/lib/validation";
const AddPurchaseOrder = () => {
  const { t } = useTranslation();

  const poFieldLabels = {
    store: t("page.purchaseOrder.add.store"),
    pic: t("page.purchaseOrder.add.pic"),
    orderDate: t("page.purchaseOrder.add.poDate"),
    orderTime: t("page.purchaseOrder.add.time"),
    dueDate: t("page.purchaseOrder.add.dueDate"),
    items: t("page.purchaseOrder.add.itemSection")
  };

  const poSchema = z.object({
    store: z.number().min(1, t("page.purchaseOrder.add.validation.store")),
    pic: z.number().min(1, t("page.purchaseOrder.add.validation.pic")),
    orderDate: z.date({ required_error: t("page.purchaseOrder.add.validation.orderDate") }),
    orderTime: z.string().min(1, t("page.purchaseOrder.add.validation.orderTime")),
    dueDate: z.date().nullable().optional(),
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
  const isSuperAdmin = user?.roleType === "super_admin";
  const [selectedStore, setSelectedStore] = useState(isSuperAdmin ? "" : user?.store || "");
  const locationParam = selectedStore;

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { name: "", ingredientId: null, qty: 1, price: 0, unit: "pcs", supplierId: null }
  ]);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const raw = searchParams.get("ingredients");
    if (raw) {
      const names = raw
        .split(",")
        .filter(Boolean)
        .map((n) => ({
          name: decodeURIComponent(n.trim()),
          ingredientId: null,
          qty: 1,
          price: 0,
          unit: "pcs",
          supplierId: null
        }));
      if (names.length > 0) setItems(names);
    }
  }, [searchParams]);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [orderTime, setOrderTime] = useState(format(new Date(), "HH:mm"));
  const [dueDate, setDueDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [tenor, setTenor] = useState(0);
  const [dpPercent, setDpPercent] = useState(0);
  const [picSearch, setPicSearch] = useState("");
  const [picId, setPicId] = useState(null);
  const [showPicList, setShowPicList] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [addSupplierItemIdx, setAddSupplierItemIdx] = useState(null);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");

  const { data: suppliersData } = useQuery(
    ["suppliers-dropdown", selectedStore],
    () =>
      getAllSupplier({ limit: 999, store: selectedStore, status: "active", includeProducts: true }),
    { enabled: !!selectedStore, staleTime: 30000 }
  );
  const suppliers = suppliersData?.data || [];

  const { data: employeesData, isLoading: employeesLoading } = useQuery(
    ["employees-dropdown", selectedStore],
    () => getAllEmployee({ limit: 999, status: "active", location: selectedStore || undefined }),
    {
      enabled: !!selectedStore,
      staleTime: 30000
    }
  );
  const employees = employeesData?.data || [];

  const filteredEmployees = employees.filter((e) =>
    (e.fullName || e.userName)?.toLowerCase().includes(picSearch.toLowerCase())
  );

  const { data: locationsData, isLoading: locationsLoading } = useQuery(
    ["locations-for-po"],
    () => getAllLocation(),
    { staleTime: 30000 }
  );
  const locations = locationsData?.data || [];

  const { data: ingredientsData } = useQuery(
    ["ingredients-po", selectedStore],
    () => getAllIngredients({ store: locationParam, limit: 999, status: "active" }),
    { enabled: !!selectedStore, staleTime: 30000 }
  );
  const ingredients = ingredientsData?.data || [];
  const activeIngredients = ingredients;
  useEffect(() => {
    setPicSearch("");
    setPicId(null);
    setShowPicList(false);
  }, [selectedStore]);

  const headerReady = !locationsLoading;
  const [ingredientsReady, setIngredientsReady] = useState(false);
  const prevStoreRef = useRef(selectedStore);
  useEffect(() => {
    if (prevStoreRef.current !== selectedStore) {
      setIngredientsReady(false);
      prevStoreRef.current = selectedStore;
    }
    if (ingredientsData) setIngredientsReady(true);
  }, [selectedStore, ingredientsData]);
  const itemsLoading = !!selectedStore && !ingredientsReady;

  const ingredientSuppliersMap = useMemo(() => {
    const map = {};
    for (const sp of suppliers) {
      const sid = sp.id || sp._id;
      const sname = sp.name;
      const products = (sp.products || []).filter((p) => !p.status || p.status === "active");
      for (const prod of products) {
        const pname = (prod.name || "").toLowerCase().trim();
        if (!map[pname]) map[pname] = [];
        map[pname].push({ supplierId: sid, supplierName: sname, price: prod.price });
      }
    }
    return map;
  }, [suppliers]);

  const supplierProductsMap = useMemo(() => {
    const map = {};
    for (const sp of suppliers) {
      const sid = sp.id || sp._id;
      map[sid] = (sp.products || []).filter((p) => !p.status || p.status === "active");
    }
    return map;
  }, [suppliers]);

  const getSuppliersForIngredientName = (ingredientId) => {
    if (!ingredientId) return [];
    const ing = activeIngredients.find((i) => i.id === ingredientId);
    if (!ing) return [];
    return ingredientSuppliersMap[(ing.name || "").toLowerCase().trim()] || [];
  };

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
  const { setActiveStore } = useStore();

  const addSupplierMutation = useMutation(addSupplier, {
    onSuccess: (res) => {
      const newSupplier = res.data || res;
      if (addSupplierItemIdx !== null) {
        updateItem(addSupplierItemIdx, "supplierId", newSupplier.id || newSupplier._id);
      }
      setShowAddSupplierModal(false);
      setAddSupplierItemIdx(null);
      toast.success(t("page.purchaseOrder.add.toast.supplierAdded"));
      queryClient.invalidateQueries(["suppliers-dropdown"]);
      queryClient.invalidateQueries(["all-supplier-details"]);
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
      setShowSuccessModal(true);
    },
    onError: (err) => {
      setModalMessage(err?.response?.data?.message || err.message);
      setErrorModal(true);
    }
  });

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
    setItems((prev) => [
      ...prev,
      {
        name: "",
        ingredientId: null,
        qty: 1,
        price: 0,
        unit: "pcs",
        supplierId: null,
        conversionToBase: 1
      }
    ]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const [discount, setDiscount] = useState(0);
  const [additionalCost, setAdditionalCost] = useState(0);
  const [overDeliveryTolerance, setOverDeliveryTolerance] = useState(10);
  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const finalAmount = totalAmount - discount + additionalCost;

  const [errors, setErrors] = useState({});

  const hasDuplicateItems = useMemo(() => {
    return items.some((item, i) => {
      if (!item.ingredientId) return false;
      return items.some(
        (other, j) =>
          i !== j &&
          other.ingredientId === item.ingredientId &&
          (other.supplierId || null) === (item.supplierId || null)
      );
    });
  }, [items]);

  const handleSubmit = (e, saveAsDraft = false) => {
    if (e?.preventDefault) e.preventDefault();
    setErrors({});

    if (!saveAsDraft) {
      if (hasDuplicateItems) {
        toast.error(t("page.purchaseOrder.add.validation.duplicateItems"), {
          description: t("page.purchaseOrder.add.validation.duplicateItemsDesc")
        });
        return;
      }

      if (paymentMethod === "credit" && !dueDate) {
        setErrors((prev) => ({ ...prev, dueDate: t("page.purchaseOrder.add.validation.dueDate") }));
        toast.error(t("page.purchaseOrder.add.validation.validationFailed"), {
          description: t("page.purchaseOrder.add.validation.dueDate")
        });
        return;
      }

      const result = poSchema.safeParse({
        store: Number(selectedStore) || 0,
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
    }

    createMutation.mutate({
      store: locationParam,
      notes,
      discount,
      additionalCost,
      overDeliveryTolerance,
      status: saveAsDraft ? "draft" : "pending",
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      pic: picId,
      paymentMethod,
      tenor: paymentMethod === "credit" ? tenor : 0,
      dpPercent: paymentMethod === "credit" ? dpPercent : 0,
      orderDate: (() => {
        const d = new Date(orderDate);
        const [hours, minutes] = (orderTime || "00:00").split(":");
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return d;
      })(),
      items: items
        .filter((i) => (saveAsDraft ? true : i.name?.trim()))
        .map(({ name, ingredientId, qty, price, unit, supplierId, conversionToBase }) => ({
          product: null,
          ingredient: ingredientId || null,
          ingredientName: name,
          quantity: qty,
          price,
          unit: unit || "pcs",
          conversionToBase: conversionToBase || 1,
          supplier: supplierId || null
        })),
      createdBy: user?.id
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
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
            description={t("page.purchaseOrder.add.description")}
            backLink="/purchase-order"
            onBack={() => setCancelModal(true)}>
            <UserGuide guideKey="add-purchase-order" />
          </PageHeader>
        </div>
      </div>

      {!headerReady ? (
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 shadow-md rounded-xl">
            <Skeleton className="h-14 rounded-none" />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md rounded-xl">
            <Skeleton className="h-14 rounded-none" />
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md rounded-xl">
            <Skeleton className="h-20 rounded-none" />
          </Card>
        </div>
      ) : (
        <div>
          <div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                      <Combobox
                        options={[
                          { value: "", label: t("page.purchaseOrder.add.selectStore") },
                          ...locations.map((loc) => ({ value: loc.id, label: loc.name }))
                        ]}
                        value={selectedStore}
                        onChange={(val) => {
                          setSelectedStore(val);
                          setErrors((prev) => ({ ...prev, store: undefined }));
                        }}
                        disabled={!isSuperAdmin}
                        placeholder={t("page.purchaseOrder.add.selectStore")}
                        searchPlaceholder={t("page.purchaseOrder.add.selectStore")}
                      />
                      {errors.store && (
                        <p className="text-xs text-destructive mt-1">{errors.store}</p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        {t("page.purchaseOrder.add.pic")}{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      {!selectedStore ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/30">
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                              {t("page.purchaseOrder.add.selectStoreFirst") ||
                                "Pilih toko terlebih dahulu"}
                            </p>
                          </div>
                        </div>
                      ) : employeesLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : employees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/30">
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                              {t("page.purchaseOrder.add.noEmployee")}{" "}
                              {selectedStore && locations.length > 0 && (
                                <span className="text-muted-foreground">
                                  {t("page.purchaseOrder.add.inStore", {
                                    storeName:
                                      locations.find((l) => String(l.id) === String(selectedStore))
                                        ?.name || ""
                                  })}
                                </span>
                              )}
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
                            <Plus size={18} />
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
                        {t("page.purchaseOrder.add.time")}{" "}
                        <span className="text-destructive">*</span>
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
                        {t("page.purchaseOrder.add.paymentMethod")}{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Combobox
                        options={[
                          { value: "cash", label: t("page.purchaseOrder.add.paymentMethodCash") },
                          {
                            value: "credit",
                            label: t("page.purchaseOrder.add.paymentMethodCredit")
                          }
                        ]}
                        value={paymentMethod}
                        onChange={(val) => {
                          setPaymentMethod(val);
                          if (val === "cash") {
                            setTenor(0);
                            setDpPercent(0);
                            setDueDate(null);
                          }
                        }}
                        placeholder={t("page.purchaseOrder.add.paymentMethodCash")}
                        searchPlaceholder={t("page.purchaseOrder.add.paymentMethodCash")}
                      />
                    </div>
                    {paymentMethod === "credit" && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {t("page.purchaseOrder.add.dpPercent")}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder={t("page.purchaseOrder.add.dpPercentPlaceholder")}
                          value={dpPercent || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 0 && val <= 100) setDpPercent(val);
                          }}
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("page.purchaseOrder.add.dpPercentHint")}
                        </p>
                        {dpPercent > 0 && (
                          <p className="text-xs text-primary font-medium mt-1">
                            {t("page.purchaseOrder.add.dpAmount")}: Rp{" "}
                            {((finalAmount * dpPercent) / 100).toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                    )}
                    {paymentMethod === "credit" && (
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
                    )}
                    {paymentMethod === "credit" && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          {t("page.purchaseOrder.add.tenor")}{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          placeholder={t("page.purchaseOrder.add.tenorPlaceholder")}
                          value={tenor || ""}
                          onChange={(e) => setTenor(Number(e.target.value) || 0)}
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("page.purchaseOrder.add.tenorHint")}
                        </p>
                      </div>
                    )}
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

              <OrderItemsCard
                items={items}
                suppliers={suppliers}
                supplierProductsMap={supplierProductsMap}
                getSuppliersForIngredientName={getSuppliersForIngredientName}
                unitOptions={unitOptions}
                discount={discount}
                totalAmount={totalAmount}
                finalAmount={finalAmount}
                additionalCost={additionalCost}
                overDeliveryTolerance={overDeliveryTolerance}
                errors={errors}
                hasDuplicateItems={hasDuplicateItems}
                itemsLoading={itemsLoading}
                selectedStore={selectedStore}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onUpdateItem={updateItem}
                onDiscountChange={(val) => setDiscount(val)}
                onAdditionalCostChange={(val) => setAdditionalCost(val)}
                onOverDeliveryToleranceChange={(val) => setOverDeliveryTolerance(val)}
                formatIDR={formatIDR}
                parseIDR={parseIDR}
                t={t}
              />

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
                    {itemsLoading ? (
                      <Skeleton className="h-4 w-28 ml-auto" />
                    ) : (
                      <p className="text-sm font-semibold">
                        Rp{" "}
                        {(discount > 0 || additionalCost > 0
                          ? finalAmount
                          : totalAmount
                        ).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDraftModal(true)}
                      disabled={createMutation.isLoading}>
                      Simpan sebagai Draft
                    </Button>
                    <Button
                      type="button"
                      disabled={createMutation.isLoading}
                      className="gap-2 min-w-[140px] shadow-md"
                      onClick={() => {
                        const missing = getMissingFields(
                          {
                            store: Number(selectedStore) || 0,
                            pic: picId,
                            orderDate,
                            orderTime,
                            dueDate,
                            items: items.filter((i) => i.name?.trim())
                          },
                          poSchema,
                          poFieldLabels
                        );
                        if (missing.length > 0) {
                          setMissingFieldsList(missing);
                          setMissingFieldsModal(true);
                          return;
                        }
                        setConfirmModal(true);
                      }}>
                      <Save size={18} />
                      {createMutation.isLoading
                        ? t("common.saving")
                        : t("page.purchaseOrder.add.savePo")}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {addSupplierMutation.isLoading && <Loading fullscreen size="lg" label={t("common.saving")} />}
      {createMutation.isLoading && <Loading fullscreen size="lg" label={t("common.saving")} />}

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("modal.cancelTitle")}
        description={t("modal.cancelDescription")}
        confirmText={t("modal.yesCancel")}
        onConfirm={() => navigate("/purchase-order")}
      />

      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title="Simpan sebagai Draft"
        description="Data PO akan disimpan sebagai draft"
        confirmText="Ya, Simpan Draft"
        onConfirm={() => {
          setDraftModal(false);
          handleSubmit(null, true);
        }}
      />

      <Modal
        type="confirm"
        open={confirmModal}
        onOpenChange={setConfirmModal}
        title={t("page.purchaseOrder.add.confirmTitle") || "Buat Purchase Order?"}
        description={
          t("page.purchaseOrder.add.confirmDesc") ||
          "Pastikan data yang diisi sudah benar sebelum menyimpan."
        }
        confirmText={t("common.yes") || "Ya"}
        cancelText={t("common.no") || "Batal"}
        onConfirm={() => {
          setConfirmModal(false);
          handleSubmit(null, false);
        }}
      />

      <Modal
        type="form"
        open={showAddSupplierModal}
        onOpenChange={setShowAddSupplierModal}
        title={t("page.purchaseOrder.add.addSupplier")}
        confirmText={t("common.save")}
        loading={addSupplierMutation.isLoading}
        onConfirm={() => {
          if (!newSupplierName.trim() || !newSupplierPhone.trim()) return;
          if (newSupplierPhone.trim().length > 14) return;
          addSupplierMutation.mutate({
            name: newSupplierName.trim(),
            phone: newSupplierPhone.trim(),
            status: "active"
          });
        }}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("page.purchaseOrder.add.supplierName")} <span className="text-destructive">*</span>
            </label>
            <Input
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              placeholder={t("page.purchaseOrder.add.supplierNamePlaceholder")}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("page.purchaseOrder.add.supplierPhone")}{" "}
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={newSupplierPhone}
              onChange={(e) => setNewSupplierPhone(e.target.value)}
              placeholder={t("page.purchaseOrder.add.supplierPhonePlaceholder")}
              maxLength={14}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.purchaseOrder.add.supplierPhoneHint")}
            </p>
          </div>
        </div>
      </Modal>
      <MissingFieldsModal
        open={missingFieldsModal}
        onOpenChange={setMissingFieldsModal}
        fields={missingFieldsList}
      />

      <Modal
        type="error"
        open={errorModal}
        onOpenChange={setErrorModal}
        title={t("common.error")}
        description={modalMessage}
        onConfirm={() => setErrorModal(false)}
      />

      <Modal
        type="success"
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title={t("common.success")}
        description={t("page.purchaseOrder.add.toast.poCreated")}
        onConfirm={() => {
          if (isSuperAdmin && selectedStore) {
            const storeName =
              locations.find((l) => String(l.id) === String(selectedStore))?.name || "";
            setActiveStore(selectedStore, storeName);
          }
          navigate("/purchase-order");
        }}
      />
    </div>
  );
};

export default AddPurchaseOrder;
