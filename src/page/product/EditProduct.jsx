import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Save,
  X,
  Plus,
  Package,
  Tag,
  Layers,
  DollarSign,
  Info,
  Trash2,
  GripVertical,
  TrendingUp,
  Store,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useCookies } from "react-cookie";
import PageHeader from "@/components/ui/PageHeader";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { getProductById, editProduct } from "@/services/product";
import { getAllCategoryActive } from "@/services/category";
import { getAllSupplier } from "@/services/supplier";
import { getAllTaxConfig } from "@/services/tax-config";

import { getAllLocation } from "@/services/location";
import { getProductPriceByStore, updateProductPriceByStore } from "@/services/price-store";
import { checkStockOpnameExists, getStockOpnameCompositionItems } from "@/services/stock";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import UserGuide from "@/components/organism/UserGuide";
import StoreSelectCard from "@/components/organism/StoreSelectCard";
import AbortController from "@/components/organism/abort-controller";

const EditProduct = () => {
  const { t } = useTranslation();
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [cookies] = useCookies();
  const user = cookies?.user;
  const role = user?.roleType || "";
  const productId = searchParams.get("id");

  const [draftModal, setDraftModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [variantGroups, setVariantGroups] = useState([]);
  const [modifierItems, setModifierItems] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [storePrices, setStorePrices] = useState([]);
  const [savingStoreId, setSavingStoreId] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [allStores, setAllStores] = useState(false);
  const [noStockOpname, setNoStockOpname] = useState(false);
  const [composition, setComposition] = useState([]);
  const [compositionOptions, setCompositionOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const {
    data: productData,
    isLoading: loadingProduct,
    isError,
    refetch
  } = useQuery(["product-edit", productId], () => getProductById(productId), {
    enabled: !!productId,
    refetchOnMount: true
  });
  const product = productData?.data || {};

  const productStore = product?.store || "";
  const { data: categoriesData } = useQuery(
    ["categories-for-edit", productStore],
    () => getAllCategoryActive({ location: productStore }),
    { enabled: !!productStore }
  );
  const categories = categoriesData?.data || categoriesData?.categories || [];

  const isSuperAdmin = role === "super_admin";

  const editStore = selectedStores[0] || user?.store || "";
  const { data: suppliersData } = useQuery(
    ["suppliers-for-edit", editStore],
    () => getAllSupplier({ limit: 100, store: editStore }),
    { enabled: isSuperAdmin }
  );
  const supplierOptions = (suppliersData?.data || []).filter((s) => s.status === "active");

  const { data: taxData } = useQuery(
    ["tax-configs-for-edit"],
    () => getAllTaxConfig({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const taxOptions = (taxData?.data || []).filter((t) => t.status === "active");

  const {
    data: locationsData,
    isLoading: locsLoading,
    isFetching: locsFetching
  } = useQuery(["allLocations"], getAllLocation, {
    enabled: isSuperAdmin
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const storeIds = locations.map((l) => l.id);
  const { data: storePricesData } = useQuery(
    ["product-store-prices", productId],
    () => getProductPriceByStore({ productId, storeIds }),
    { enabled: isSuperAdmin && !!productId && storeIds.length > 0 }
  );

  useEffect(() => {
    if (storePricesData?.data) {
      const prices = storePricesData.data.storePrices || storePricesData.data;
      setStorePrices(Array.isArray(prices) ? prices : []);
    }
  }, [storePricesData]);

  const formSchema = useMemo(() => {
    return z.object({
      nameProduct: z.string().min(1, t("page.product.form.requiredName")),
      barcode: z.string().optional().or(z.literal("")),
      brand: z.string().optional().or(z.literal("")),
      sku: z.string().optional().or(z.literal("")),
      category: z.string().min(1, t("page.product.form.requiredCategory")),
      tipeProduk: z.string().default("menu"),
      supplier: z.string().optional().or(z.literal("")),
      tax: z.string().optional().or(z.literal("")),
      description: z.string().optional().or(z.literal("")),
      price: z.coerce.number().min(1, t("page.product.form.requiredPrice")),
      costPrice: z.coerce.number().min(0).optional().or(z.literal("")),
      stock: z.coerce.number().min(0).optional().or(z.literal("")),
      minStock: z.coerce.number().min(0).optional().or(z.literal("")),
      unit: z.string().default("pcs"),
      baseUnit: z.string().default("pcs"),
      conversionFactor: z.coerce.number().min(1).default(1),
      point: z.coerce.number().min(0).optional().or(z.literal("")),
      redeemPoints: z.coerce.number().min(0).optional().or(z.literal("")),
      status: z.boolean().default(true),
      isAvailable: z.boolean().default(true),
      isOption: z.boolean().default(false),
      hasModifiers: z.boolean().default(false),
      store: z.string().optional()
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameProduct: "",
      barcode: "",
      brand: "",
      sku: "",
      category: "",
      tipeProduk: "menu",
      supplier: "",
      tax: "",
      description: "",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "",
      unit: "pcs",
      baseUnit: "pcs",
      conversionFactor: 1,
      point: "",
      redeemPoints: "",
      status: true,
      isAvailable: true,
      isOption: false,
      hasModifiers: false,
      store: ""
    }
  });

  const parseJsonOrId = (val) => {
    if (!val) return "";
    const t =
      typeof val === "string"
        ? (() => {
            try {
              return JSON.parse(val);
            } catch {
              return val;
            }
          })()
        : val;
    return String(t?.id ?? t);
  };

  useEffect(() => {
    if (product.id) {
      form.reset({
        nameProduct: product.nameProduct || "",
        barcode: product.barcode || "",
        brand: product.brand || "",
        sku: product.sku || "",
        category: parseJsonOrId(product.category),
        tipeProduk: product.tipeProduk || "menu",
        supplier: parseJsonOrId(product.supplier),
        tax: parseJsonOrId(product.tax),
        description: product.description || "",
        price: product.price || "",
        costPrice: product.costPrice || "",
        stock: product.stock ?? "",
        minStock: product.minStock ?? "",
        unit: product.unit || "pcs",
        baseUnit: product.baseUnit || product.unit || "pcs",
        conversionFactor: product.conversionFactor ?? 1,
        point: product.point ?? "",
        redeemPoints: product.redeemPoints ?? "",
        status: product.status === "active" || product.status === true,
        isAvailable: product.isAvailable ?? true,
        isOption: !!product.isOption,
        hasModifiers: !!product.hasModifiers
      });
      if (product.isOption && product.options) {
        const parsed =
          typeof product.options === "string" ? JSON.parse(product.options) : product.options;
        setVariantGroups(Array.isArray(parsed) ? parsed : []);
      }
      if (product.hasModifiers && product.modifiers) {
        const parsed =
          typeof product.modifiers === "string" ? JSON.parse(product.modifiers) : product.modifiers;
        setModifierItems(Array.isArray(parsed) ? parsed : []);
      }
      if (product.priceTiers) {
        const parsed =
          typeof product.priceTiers === "string"
            ? JSON.parse(product.priceTiers)
            : product.priceTiers;
        setPriceTiers(Array.isArray(parsed) ? parsed : []);
      }
      if (product.image) {
        setPreviewImage(product.image);
      }
      if (product.store !== undefined) {
        const storeArr = Array.isArray(product.store) ? product.store : [];
        if (storeArr.length === 0) {
          setAllStores(true);
          setSelectedStores([]);
        } else {
          setAllStores(false);
          setSelectedStores(storeArr.map((s) => (typeof s === "object" ? s.id : s)));
        }
      }
    }
  }, [product, form]);

  useEffect(() => {
    if (product.id && categories.length > 0 && product.category) {
      form.setValue("category", parseJsonOrId(product.category));
    }
  }, [categories, product.id, product.category, form]);

  useEffect(() => {
    if (product.id && taxOptions.length > 0 && product.tax) {
      const t =
        typeof product.tax === "string"
          ? (() => {
              try {
                return JSON.parse(product.tax);
              } catch {
                return product.tax;
              }
            })()
          : product.tax;
      const id = String(t?.id ?? t);
      form.setValue("tax", id);
    }
  }, [taxOptions, product.id, product.tax, form]);

  const isOption = form.watch("isOption");
  const hasModifiers = form.watch("hasModifiers");
  const tipeProduk = form.watch("tipeProduk");

  useEffect(() => {
    if (tipeProduk === "bahan_baku") {
      const store =
        Array.isArray(product.store) && product.store.length > 0 ? product.store[0] : null;
      if (store) {
        checkStockOpnameExists(store)
          .then((res) => setNoStockOpname(!res?.data?.exists))
          .catch(() => setNoStockOpname(false));
      }
    } else {
      setNoStockOpname(false);
    }
  }, [tipeProduk, product.store]);

  useEffect(() => {
    const store =
      Array.isArray(product.store) && product.store.length > 0 ? product.store[0] : null;
    if (store) {
      getStockOpnameCompositionItems(store)
        .then((res) => setCompositionOptions(res?.data || []))
        .catch(() => setCompositionOptions([]));
    }
  }, [product.store]);

  useEffect(() => {
    if (product.id && product.composition) {
      const parsed =
        typeof product.composition === "string"
          ? JSON.parse(product.composition)
          : product.composition;
      setComposition(Array.isArray(parsed) ? parsed : []);
    }
  }, [product]);

  const editMutation = useMutation(editProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["product-detail"]);
      queryClient.invalidateQueries(["product-edit", productId]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.product.form.failed"), {
        description:
          err?.response?.data?.message || err.message || t("page.product.form.failedEditProduct")
      });
      setIsSubmitting(false);
    }
  });

  const updateStorePriceMutation = useMutation(updateProductPriceByStore, {
    onSuccess: () => {
      toast.success(t("page.product.form.success"), {
        description: t("page.product.form.storePriceUpdated")
      });
      queryClient.invalidateQueries(["product-store-prices"]);
      setSavingStoreId(null);
    },
    onError: (err) => {
      toast.error(t("page.product.form.failed"), {
        description: err?.response?.data?.message || t("page.product.form.storePriceUpdateFailed")
      });
      setSavingStoreId(null);
    }
  });

  const handleSaveStorePrice = (storeId, price) => {
    setSavingStoreId(storeId);
    const payload = new FormData();
    payload.append("productId", productId);
    payload.append("storeId", storeId);
    payload.append("price", price);
    updateStorePriceMutation.mutate(payload);
  };

  const addVariantGroup = () => {
    setVariantGroups((prev) => [
      ...prev,
      { id: Date.now(), name: "", options: [{ name: "", price: 0, stock: 0 }] }
    ]);
    form.setValue("isOption", true);
  };

  const removeVariantGroup = (id) => {
    setVariantGroups((prev) => prev.filter((g) => g.id !== id));
    if (variantGroups.length <= 1) form.setValue("isOption", false);
  };

  const updateVariantGroup = (id, field, value) => {
    setVariantGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const addVariantOption = (groupId) => {
    setVariantGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, options: [...g.options, { name: "", price: 0, stock: 0 }] } : g
      )
    );
  };

  const updateVariantOption = (groupId, index, field, value) => {
    setVariantGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
            }
          : g
      )
    );
  };

  const removeVariantOption = (groupId, index) => {
    setVariantGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((_, i) => i !== index) } : g
      )
    );
  };

  const addModifierItem = () => {
    setModifierItems((prev) => [...prev, { id: Date.now(), name: "", price: 0 }]);
    form.setValue("hasModifiers", true);
  };

  const updateModifierItem = (id, field, value) => {
    setModifierItems((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeModifierItem = (id) => {
    setModifierItems((prev) => prev.filter((m) => m.id !== id));
    if (modifierItems.length <= 1) form.setValue("hasModifiers", false);
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      const values = form.getValues();
      if (values.tipeProduk === "bahan_baku" && composition.length === 0) return false;
      return !!values.nameProduct && !!values.category;
    }
    if (currentStep === 2) {
      const values = form.getValues();
      return !!values.price;
    }
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) {
      const values = form.getValues();
      let msg =
        currentStep === 1
          ? t("page.product.form.requiredStep1Edit")
          : t("page.product.form.requiredStep2Edit");
      if (currentStep === 1 && values.tipeProduk === "bahan_baku" && composition.length === 0) {
        msg = t("page.product.form.requiredComposition");
      }
      toast.error(t("page.product.form.completeData"), { description: msg });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleToggleOption = (checked) => {
    form.setValue("isOption", checked);
    if (!checked) setVariantGroups([]);
  };

  const handleToggleModifier = (checked) => {
    form.setValue("hasModifiers", checked);
    if (!checked) setModifierItems([]);
  };

  const addPriceTier = () => {
    setPriceTiers((prev) => [...prev, { id: Date.now(), name: "", price: 0 }]);
  };

  const updatePriceTier = (id, field, value) => {
    setPriceTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const removePriceTier = (id) => {
    setPriceTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const addComposition = () => {
    setComposition((prev) => [...prev, { id: Date.now(), name: "", qty: 1, unit: "" }]);
  };

  const updateComposition = (id, field, value) => {
    setComposition((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeComposition = (id) => {
    setComposition((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCompositionSelect = (id, selectedName) => {
    const opt = compositionOptions.find((o) => o.name === selectedName);
    setComposition((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: selectedName, unit: opt?.unit || c.unit } : c))
    );
  };

  const handleSave = async (values, saveAsDraft = false) => {
    if (!allStores && selectedStores.length === 0 && !saveAsDraft) {
      form.setError("store", { message: t("page.product.form.selectStoreError") });
      return;
    }
    form.clearErrors("store");
    if (values.tipeProduk === "bahan_baku" && !saveAsDraft) {
      if (composition.length === 0) {
        toast.error(t("page.product.form.compositionRequired"), {
          description: t("page.product.form.compositionRequiredDesc")
        });
        return;
      }
      try {
        const store =
          Array.isArray(product.store) && product.store.length > 0
            ? product.store[0]
            : product.store || null;
        if (store) {
          const res = await checkStockOpnameExists(store);
          if (!res?.data?.exists) {
            toast.warning(t("page.product.form.noStockOpname"), {
              description: t("page.product.form.noStockOpnameDesc")
            });
          }
        }
      } catch {
        // silent - non-blocking check
      }
    }

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("id", productId);
    payload.append("nameProduct", values.nameProduct);
    if (values.barcode) payload.append("barcode", values.barcode);
    if (values.brand) payload.append("brand", values.brand);
    if (values.sku) payload.append("sku", values.sku);
    payload.append("category", values.category);
    if (values.supplier) payload.append("supplier", values.supplier);
    if (values.tax) payload.append("tax", values.tax);
    payload.append("price", values.price);
    if (values.costPrice) payload.append("costPrice", values.costPrice);
    if (priceTiers.length > 0) {
      payload.append("priceTiers", JSON.stringify(priceTiers));
    }
    if (values.stock) payload.append("stock", values.stock);
    if (values.minStock) payload.append("minStock", values.minStock);
    payload.append("unit", values.unit);
    payload.append("baseUnit", values.baseUnit);
    payload.append("conversionFactor", values.conversionFactor || 1);
    if (values.point) payload.append("point", values.point);
    if (values.redeemPoints) payload.append("redeemPoints", values.redeemPoints);
    if (values.description) payload.append("description", values.description);
    payload.append("status", saveAsDraft ? "draft" : values.status ? "active" : "inactive");
    payload.append("isAvailable", values.isAvailable);
    payload.append("tipeProduk", values.tipeProduk);
    payload.append("isOption", !!isOption);
    payload.append("hasModifiers", !!hasModifiers);

    if (isOption && variantGroups.length > 0) {
      payload.append("options", JSON.stringify(variantGroups));
    }
    if (hasModifiers && modifierItems.length > 0) {
      payload.append("modifiers", JSON.stringify(modifierItems));
    }

    if (composition.length > 0) {
      payload.append("composition", JSON.stringify(composition));
    }

    if (imageFile) payload.append("image", imageFile);

    payload.append("stores", JSON.stringify(selectedStores));
    if (user?.id) {
      payload.append("createdBy", user.id);
      payload.append("modifiedBy", user.id);
    }

    editMutation.mutate(payload);
  };

  const onSubmit = (values) => handleSave(values, false);
  const { handleSubmit, confirmModal } = useConfirmSubmit(form, onSubmit);

  if (isError) return <AbortController refetch={refetch} />;

  if (loadingProduct) {
    return <Loading fullscreen size="lg" label={t("common.loading")} />;
  }

  if (!productId || (!loadingProduct && !product.id)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Info size={48} className="opacity-30" />
        <p>{t("page.product.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/product-list")}>
          {t("page.product.form.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              {
                label: t("breadcrumb.dashboard"),
                href: role === "super_admin" ? "/dashboard-super-admin" : "/dashboard-admin"
              },
              { label: t("breadcrumb.product"), href: "/product-list" },
              { label: product.nameProduct || t("page.product.edit.title") }
            ]}
            title={`${t("page.product.edit.editLabel")} ${product.nameProduct || t("page.product.edit.title")}`}
            description={t("page.product.edit.description")}
            backLink="/product-list">
            <UserGuide guideKey="add-product" />
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          <Form {...form}>
            <form onSubmit={handleSubmit}>
              {/* Stepper */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  {[
                    {
                      num: 1,
                      title: t("page.product.step.info"),
                      desc: t("page.product.step.infoDesc")
                    },
                    {
                      num: 2,
                      title: t("page.product.step.price"),
                      desc: t("page.product.step.priceDesc")
                    },
                    {
                      num: 3,
                      title: t("page.product.step.media"),
                      desc: t("page.product.step.mediaDesc")
                    }
                  ].map((s, i) => (
                    <React.Fragment key={s.num}>
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setCurrentStep(s.num)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer ${
                            currentStep === s.num
                              ? "bg-primary text-primary-foreground"
                              : currentStep > s.num
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                          }`}>
                          {currentStep > s.num ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            s.num
                          )}
                        </div>
                        <div className="hidden sm:block">
                          <p
                            className={`text-sm font-semibold ${currentStep >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                            {s.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                      {i < 2 && (
                        <div
                          className={`flex-1 h-px mx-4 ${currentStep > s.num ? "bg-green-500" : "bg-border"}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className={`${currentStep === 3 ? "" : "lg:col-span-2"} space-y-6`}>
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="store"
                        render={() => (
                          <FormItem>
                            <FormControl>
                              <StoreSelectCard
                                locations={locations}
                                selectedStores={selectedStores}
                                onChange={(stores) => {
                                  setSelectedStores(stores);
                                  form.clearErrors("store");
                                }}
                                isSuperAdmin={isSuperAdmin}
                                user={user}
                                t={t}
                                title={t("page.product.add.storeSection.title")}
                                description={t("page.product.add.storeSection.desc")}
                                noStoreLabel={t("page.product.add.storeSection.noStore")}
                                addStoreLabel={t("page.product.add.storeSection.addStore")}
                                storeInfoLabel={t("page.product.add.storeInfo")}
                                allStores={allStores}
                                onAllStoresChange={(val) => {
                                  setAllStores(val);
                                  form.clearErrors("store");
                                }}
                                navigate={navigate}
                                mandatory={true}
                                locationsLoading={locsLoading || locsFetching}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Informasi Produk */}
                      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                          <Info size={18} className="text-primary" />
                          <h3 className="text-base font-semibold text-foreground">
                            {t("page.product.add.productInfoSection")}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="nameProduct"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>
                                  {t("page.product.form.nameProduct")}{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Input
                                  placeholder={t("page.product.form.namePlaceholder")}
                                  {...field}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("page.product.form.category")}{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Combobox
                                  options={categories.map((c) => ({
                                    value: String(c.id),
                                    label: c.name
                                  }))}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder={t("page.product.form.categoryPlaceholder")}
                                  searchPlaceholder={t("page.product.form.categorySearch")}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="tipeProduk"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.tipeProduk")}</FormLabel>
                                <select
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none">
                                  <option value="menu">
                                    {t("page.product.form.tipeProdukMenu")}
                                  </option>
                                  <option value="bahan_baku">
                                    {t("page.product.form.tipeProdukBahanBaku")}
                                  </option>
                                </select>
                                <FormMessage />
                                {noStockOpname && (
                                  <div className="flex items-start gap-2.5 mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">
                                      warning
                                    </span>
                                    <div>
                                      <p className="text-xs font-semibold text-amber-800">
                                        {t("page.product.form.noStockOpname")}
                                      </p>
                                      <p className="text-[11px] text-amber-700 mt-0.5">
                                        {t("page.product.form.noStockOpnameWarning")}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.brand")}</FormLabel>
                                <Input
                                  placeholder={t("page.product.form.brandPlaceholder")}
                                  {...field}
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {t("page.product.form.brandOptional")}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="barcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.barcode")}</FormLabel>
                                <Input
                                  placeholder={t("page.product.form.barcodePlaceholder")}
                                  {...field}
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {t("page.product.form.barcodeInfo")}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.sku")}</FormLabel>
                                <Input
                                  placeholder={t("page.product.form.skuPlaceholder2")}
                                  {...field}
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {t("page.product.form.skuOptional")}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.unit")}</FormLabel>
                                <Combobox
                                  options={unitOptions}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder={t("page.product.form.unitPlaceholder")}
                                  searchPlaceholder={t("page.product.form.unitSearch")}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="baseUnit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.baseUnit")}</FormLabel>
                                <Combobox
                                  options={[
                                    { value: "pcs", label: t("page.product.form.baseUnitPcs") },
                                    { value: "gram", label: t("page.product.form.baseUnitGram") },
                                    { value: "ml", label: t("page.product.form.baseUnitMl") },
                                    { value: "cm", label: t("page.product.form.baseUnitCm") },
                                    { value: "buah", label: t("page.product.form.baseUnitBuah") },
                                    {
                                      value: "lembar",
                                      label: t("page.product.form.baseUnitLembar")
                                    }
                                  ]}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder={t("page.product.form.baseUnitPlaceholder")}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t("page.product.form.baseUnitHelper")}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="conversionFactor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.conversionFactor")}</FormLabel>
                                <Input type="number" min="1" {...field} />
                                <p className="text-xs text-muted-foreground">
                                  {t("page.product.form.conversionFactorHelper", {
                                    value: field.value
                                  })}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {isSuperAdmin && (
                            <FormField
                              control={form.control}
                              name="supplier"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("page.product.form.supplier")}</FormLabel>
                                  <Combobox
                                    options={supplierOptions.map((sOpt) => ({
                                      value: String(sOpt.id),
                                      label: sOpt.name
                                    }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t("page.product.form.supplierPlaceholder")}
                                    searchPlaceholder={t("page.product.form.supplierSearch")}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          {isSuperAdmin && (
                            <FormField
                              control={form.control}
                              name="tax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("page.product.form.tax")}</FormLabel>
                                  {taxOptions.length === 0 ? (
                                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg bg-muted/20">
                                      <div className="text-center flex flex-col items-center gap-2">
                                        <Package size={28} className="text-muted-foreground/60" />
                                        <p className="text-sm font-medium text-foreground">
                                          {t("page.product.form.noTax")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {t("page.product.form.noTaxDesc")}
                                        </p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate("/tax-list")}
                                        className="gap-2">
                                        <span className="material-symbols-outlined text-base">
                                          add
                                        </span>
                                        {t("page.product.form.addTax")}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Combobox
                                      options={taxOptions.map((tOpt) => ({
                                        value: String(tOpt.id),
                                        label: `${tOpt.name} (${tOpt.rate}%)`
                                      }))}
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder={t("page.product.form.taxPlaceholder")}
                                      searchPlaceholder={t("page.product.form.taxSearch")}
                                    />
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>{t("page.product.form.description")}</FormLabel>
                                <Textarea
                                  placeholder={t("page.product.form.descPlaceholder")}
                                  rows={3}
                                  {...field}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {form.watch("tipeProduk") === "bahan_baku" && (
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                          <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                            <Package size={18} className="text-primary" />
                            <h3 className="text-base font-semibold text-foreground">
                              {t("page.product.form.composition")}{" "}
                              <span className="text-destructive">*</span>
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {composition.length > 0 ? (
                              composition.map((c) => (
                                <div key={c.id} className="bg-muted/30 rounded-lg p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <select
                                        value={c.name}
                                        onChange={(e) =>
                                          handleCompositionSelect(c.id, e.target.value)
                                        }
                                        className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                                        <option value="">
                                          {t("page.product.form.selectIngredient")}
                                        </option>
                                        {compositionOptions.map((opt, i) => (
                                          <option key={i} value={opt.name}>
                                            {opt.name} {opt.unit ? `(${opt.unit})` : ""}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="w-24 shrink-0">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder={t("page.product.form.qty")}
                                        value={c.qty}
                                        onChange={(e) =>
                                          updateComposition(c.id, "qty", e.target.value)
                                        }
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <div className="w-20 shrink-0">
                                      <Input
                                        placeholder={t("page.product.form.unitLabel")}
                                        value={c.unit}
                                        onChange={(e) =>
                                          updateComposition(c.id, "unit", e.target.value)
                                        }
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive shrink-0"
                                      onClick={() => removeComposition(c.id)}>
                                      <Trash2 size={18} />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {t("page.product.form.compositionEmpty")}
                              </p>
                            )}
                            {compositionOptions.length === 0 ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => navigate("/add-stock-opname")}>
                                <Plus size={18} /> {t("page.product.form.addStockOpnameFirst")}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={addComposition}>
                                <Plus size={18} /> {t("page.product.form.addIngredient")}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <>
                      {/* Harga & Stok */}
                      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                          <DollarSign size={18} className="text-primary" />
                          <h3 className="text-base font-semibold text-foreground">
                            {t("page.product.step.price")}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("page.product.form.price")}{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                    Rp
                                  </span>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    className="pl-10"
                                    value={
                                      field.value ? Number(field.value).toLocaleString("id-ID") : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/[^0-9]/g, "");
                                      field.onChange(raw ? Number(raw) : "");
                                    }}
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="costPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.costPrice")}</FormLabel>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                    Rp
                                  </span>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    className="pl-10"
                                    value={
                                      field.value ? Number(field.value).toLocaleString("id-ID") : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/[^0-9]/g, "");
                                      field.onChange(raw ? Number(raw) : "");
                                    }}
                                  />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.stock")}</FormLabel>
                                <Input type="number" placeholder="0" {...field} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="minStock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.minStock")}</FormLabel>
                                <Input type="number" placeholder="0" {...field} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="point"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.point")}</FormLabel>
                                <Input type="number" placeholder="0" {...field} />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {t("page.product.form.pointInfo")}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="redeemPoints"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("page.product.form.redeemPoints")}</FormLabel>
                                <Input type="number" placeholder="0" {...field} />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {t("page.product.form.redeemPointsInfo")}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Harga Berjenjang */}
                      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                          <TrendingUp size={18} className="text-primary" />
                          <h3 className="text-base font-semibold text-foreground">
                            {t("page.product.form.tierSection")}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {priceTiers.map((tier) => (
                            <div key={tier.id} className="bg-muted/30 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder={t("page.product.form.tierNamePlaceholder")}
                                  value={tier.name}
                                  onChange={(e) => updatePriceTier(tier.id, "name", e.target.value)}
                                  className="h-9 text-sm flex-1"
                                />
                                <div className="relative w-40 shrink-0">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    Rp
                                  </span>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={Number(tier.price).toLocaleString("id-ID")}
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/[^0-9]/g, "");
                                      updatePriceTier(tier.id, "price", raw ? Number(raw) : 0);
                                    }}
                                    className="h-9 text-sm pl-8"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive shrink-0"
                                  onClick={() => removePriceTier(tier.id)}>
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={addPriceTier}>
                            <Plus size={18} />
                            {t("page.product.form.addTier")}
                          </Button>
                          {priceTiers.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              {t("page.product.form.tierEmpty")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Harga per Toko */}
                      {isSuperAdmin && (
                        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                          <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                            <Store size={18} className="text-primary" />
                            <h3 className="text-base font-semibold text-foreground">
                              {t("page.product.form.storePriceSection")}
                            </h3>
                          </div>
                          {locations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {t("page.product.form.loadingStores")}
                            </p>
                          ) : storePrices.length === 0 && storeIds.length > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {t("page.product.form.loadingStorePrices")}
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {storePrices.map((sp) => (
                                <div key={sp.storeId} className="bg-muted/30 rounded-lg p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">
                                        {sp.storeName}
                                      </p>
                                    </div>
                                    <div className="relative w-40 shrink-0">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        Rp
                                      </span>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={sp.price || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setStorePrices((prev) =>
                                            prev.map((p) =>
                                              p.storeId === sp.storeId ? { ...p, price: val } : p
                                            )
                                          );
                                        }}
                                        className="h-9 text-sm pl-8"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={savingStoreId === sp.storeId}
                                      onClick={() => handleSaveStorePrice(sp.storeId, sp.price)}
                                      className="h-9 shrink-0">
                                      {t("page.product.form.saveStorePrice")}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      {/* Varian & Opsi + Modifiers */}
                      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                          <Layers size={18} className="text-primary" />
                          <h3 className="text-base font-semibold text-foreground">
                            {t("page.product.form.variantSection")}
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {t("page.product.form.hasVariant")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t("page.product.form.hasVariantDesc")}
                              </p>
                            </div>
                            <Switch
                              checked={form.watch("isOption") || variantGroups.length > 0}
                              onCheckedChange={handleToggleOption}
                            />
                          </div>
                          {isOption && (
                            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                              {variantGroups.map((group) => (
                                <div
                                  key={group.id}
                                  className="bg-muted/30 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <GripVertical
                                        size={16}
                                        className="text-muted-foreground shrink-0"
                                      />
                                      <Input
                                        placeholder={t("page.product.form.variantNamePlaceholder")}
                                        value={group.name}
                                        onChange={(e) =>
                                          updateVariantGroup(group.id, "name", e.target.value)
                                        }
                                        className="h-9 text-sm flex-1"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive shrink-0"
                                      onClick={() => removeVariantGroup(group.id)}>
                                      <Trash2 size={18} />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {group.options.map((opt, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <Input
                                          placeholder={t("page.product.form.optionPlaceholder", {
                                            number: idx + 1
                                          })}
                                          value={opt.name}
                                          onChange={(e) =>
                                            updateVariantOption(
                                              group.id,
                                              idx,
                                              "name",
                                              e.target.value
                                            )
                                          }
                                          className="h-9 text-sm flex-1"
                                        />
                                        <div className="relative w-28 shrink-0">
                                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                            Rp
                                          </span>
                                          <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            value={Number(opt.price || 0).toLocaleString("id-ID")}
                                            onChange={(e) => {
                                              const raw = e.target.value.replace(/[^0-9]/g, "");
                                              updateVariantOption(
                                                group.id,
                                                idx,
                                                "price",
                                                raw ? Number(raw) : 0
                                              );
                                            }}
                                            className="h-9 text-sm pl-8"
                                          />
                                        </div>
                                        <Input
                                          type="number"
                                          placeholder={t(
                                            "page.product.form.variantStockPlaceholder"
                                          )}
                                          value={opt.stock ?? 0}
                                          onChange={(e) =>
                                            updateVariantOption(
                                              group.id,
                                              idx,
                                              "stock",
                                              e.target.value
                                            )
                                          }
                                          className="h-9 text-sm w-20 shrink-0"
                                        />
                                        {group.options.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive shrink-0"
                                            onClick={() => removeVariantOption(group.id, idx)}>
                                            <Trash2 size={14} />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addVariantOption(group.id)}
                                    className="gap-1 h-8 text-xs">
                                    <Plus size={14} /> {t("page.product.form.addOption")}
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addVariantGroup}
                                className="gap-2">
                                <Plus size={16} /> {t("page.product.form.addVariantGroup")}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Separator */}
                        <div className="border-t border-border my-6" />

                        {/* Modifiers */}
                        <div>
                          <div className="flex items-center gap-2 pb-4 mb-5">
                            <Tag size={18} className="text-primary" />
                            <h3 className="text-base font-semibold text-foreground">
                              {t("page.product.form.modifierSection")}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {t("page.product.form.hasModifier")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t("page.product.form.hasModifierDesc")}
                              </p>
                            </div>
                            <Switch
                              checked={form.watch("hasModifiers") || modifierItems.length > 0}
                              onCheckedChange={handleToggleModifier}
                            />
                          </div>
                          {hasModifiers && (
                            <div className="space-y-3 mt-4">
                              {compositionOptions.length > 0 && (
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <select
                                    onChange={(e) => {
                                      const opt = compositionOptions.find(
                                        (o) => o.name === e.target.value
                                      );
                                      if (opt) {
                                        setModifierItems((prev) => [
                                          ...prev,
                                          { id: Date.now(), name: opt.name, price: 0 }
                                        ]);
                                        form.setValue("hasModifiers", true);
                                      }
                                      e.target.value = "";
                                    }}
                                    className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                                    <option value="">
                                      {t("page.product.form.fromStockOpname")}
                                    </option>
                                    {compositionOptions.map((opt, i) => (
                                      <option key={i} value={opt.name}>
                                        {opt.name} {opt.unit ? `(${opt.unit})` : ""}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {modifierItems.map((mod) => (
                                <div key={mod.id} className="bg-muted/30 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input
                                      placeholder={t("page.product.form.modifierNamePlaceholder")}
                                      value={mod.name}
                                      onChange={(e) =>
                                        updateModifierItem(mod.id, "name", e.target.value)
                                      }
                                      className="h-9 text-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                          Rp
                                        </span>
                                        <Input
                                          type="text"
                                          inputMode="numeric"
                                          placeholder="0"
                                          value={Number(mod.price).toLocaleString("id-ID")}
                                          onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9]/g, "");
                                            updateModifierItem(
                                              mod.id,
                                              "price",
                                              raw ? Number(raw) : 0
                                            );
                                          }}
                                          className="h-9 text-sm pl-10"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive shrink-0"
                                        onClick={() => removeModifierItem(mod.id)}>
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addModifierItem}
                                className="gap-2">
                                <Plus size={16} /> {t("page.product.form.addModifier")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {currentStep === 3 && (
                    <>
                      {/* Image Upload */}
                      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
                          <CloudUpload size={18} className="text-primary" />
                          <h3 className="text-base font-semibold text-foreground">
                            {t("page.product.form.imageSection")}
                          </h3>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />

                        {previewImage ? (
                          <div className="relative rounded-lg overflow-hidden border border-border">
                            <img
                              src={previewImage}
                              alt={t("page.product.form.previewAlt")}
                              className="w-full aspect-square object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearImage();
                              }}
                              className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-lg p-8 text-center cursor-pointer transition-all group">
                            <CloudUpload
                              size={48}
                              className="mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors"
                            />
                            <p className="text-sm font-medium text-foreground">
                              {t("page.product.form.uploadImage")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("page.product.form.clickToSelect")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("page.product.form.imageFormat")}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
                          <Tag size={18} className="text-primary" />
                          <h3 className="text-base font-semibold text-foreground">
                            {t("page.product.form.statusSection")}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <div
                                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                    field.value
                                      ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                      : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                  }`}>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        field.value
                                          ? "bg-green-600 text-white"
                                          : "bg-destructive/10 text-destructive"
                                      }`}>
                                      {field.value ? (
                                        <CheckCircle2 size={20} />
                                      ) : (
                                        <XCircle size={20} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">
                                        {t("page.product.form.statusLabel")}{" "}
                                        {field.value
                                          ? t("page.product.form.active")
                                          : t("page.product.form.inactive")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {field.value
                                          ? t("page.product.form.activeDesc")
                                          : t("page.product.form.inactiveDesc")}
                                      </p>
                                    </div>
                                  </div>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isAvailable"
                            render={({ field }) => (
                              <FormItem>
                                <div
                                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                    field.value
                                      ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                      : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                  }`}>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        field.value
                                          ? "bg-green-600 text-white"
                                          : "bg-destructive/10 text-destructive"
                                      }`}>
                                      {field.value ? (
                                        <CheckCircle2 size={20} />
                                      ) : (
                                        <XCircle size={20} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">
                                        {field.value
                                          ? t("page.product.form.yes")
                                          : t("page.product.form.no")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {field.value
                                          ? t("page.product.form.availableDesc")
                                          : t("page.product.form.unavailableDesc")}
                                      </p>
                                    </div>
                                  </div>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelModal(true)}
                  className="gap-2 w-full sm:w-auto">
                  <X size={18} /> {t("page.product.form.cancel")}
                </Button>
                <div className="flex items-center gap-3">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                      <ChevronLeft size={18} /> {t("page.product.form.prev")}
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button type="button" onClick={handleNext} className="gap-2 shadow-md">
                      {t("page.product.form.next")} <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDraftModal(true)}
                        disabled={isSubmitting}
                        className="gap-2 shadow-md">
                        <Save size={18} />
                        {t("page.product.form.saveDraft")}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!allStores && selectedStores.length === 0) {
                            form.setError("store", {
                              message: t("page.product.form.selectStoreError")
                            });
                            return;
                          }
                          form.clearErrors("store");
                          handleSubmit();
                        }}
                        disabled={isSubmitting}
                        className="gap-2 shadow-md">
                        <Save size={18} />
                        {t("page.product.form.saveEdit")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label={t("page.product.form.savingEdit")} />}
      {savingStoreId && <Loading fullscreen size="lg" label={t("common.saving")} />}

      <Modal type="confirm" {...confirmModal()} />

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.product.form.successEditTitle")}
        description={t("page.product.form.successEditDesc")}
        onConfirm={() => navigate("/product-list")}
      />

      <Modal
        type="confirm"
        open={cancelModal}
        onCancel={() => setCancelModal(false)}
        onOpenChange={setCancelModal}
        title={t("page.product.form.cancelEditTitle")}
        description={t("page.product.form.cancelDesc")}
        confirmText={t("page.product.form.cancelConfirm")}
        cancelText={t("page.product.form.cancelBack")}
        onConfirm={() => navigate("/product-list")}
      />

      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.product.form.saveDraftTitle")}
        description={t("page.product.form.saveDraftDesc")}
        confirmText={t("page.product.form.saveDraftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          handleSave(values, true);
        }}
      />
    </div>
  );
};

export default EditProduct;
