import React, { useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Save,
  X,
  Plus,
  CloudUpload,
  Tag,
  Layers,
  DollarSign,
  Info,
  Trash2,
  GripVertical,
  Store,
  Package,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

import PageHeader from "@/components/ui/PageHeader";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { addProduct } from "@/services/product";
import { getAllCategory } from "@/services/category";
import { getAllLocation } from "@/services/location";
import { getAllSupplier } from "@/services/supplier";
import { getAllTaxConfig } from "@/services/tax-config";
import { getAllPriceListTemplate, getPriceListTemplateById } from "@/services/price-list-template";

const AddProduct = () => {
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

  const [selectedStores, setSelectedStores] = useState(
    searchParams.get("location") ? [searchParams.get("location")] : user?.store ? [user?.store] : []
  );
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [variantGroups, setVariantGroups] = useState([]);
  const [modifierItems, setModifierItems] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [hasBatch, setHasBatch] = useState(false);
  const [batches, setBatches] = useState([]);

  const isSuperAdmin = role === "super_admin";

  const { data: locationsData } = useQuery(["locations"], getAllLocation, {
    enabled: isSuperAdmin
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const firstStore = selectedStores[0] || "";
  const { data: categoriesData } = useQuery(
    ["categories-for-product"],
    () => getAllCategory({ location: firstStore }),
    { staleTime: 30000 }
  );
  const categories = categoriesData?.data || categoriesData?.categories || [];

  const { data: suppliersData } = useQuery(
    ["suppliers-for-product"],
    () => getAllSupplier({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const supplierOptions = suppliersData?.data || [];

  const { data: taxData } = useQuery(
    ["tax-configs-for-product"],
    () => getAllTaxConfig({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const taxOptions = taxData?.data || [];

  const { data: priceListTemplatesData } = useQuery(
    ["price-list-templates-for-product"],
    () => getAllPriceListTemplate({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const priceListTemplates = priceListTemplatesData?.data || [];

  const handleSelectPriceTemplate = async (templateId) => {
    if (!templateId) return;
    try {
      const res = await getPriceListTemplateById({ id: templateId });
      const template = res?.data;
      if (template?.tiers) {
        setPriceTiers(
          template.tiers.map((t) => ({
            id: Date.now() + Math.random(),
            name: t.name,
            price: t.price || 0
          }))
        );
      }
    } catch {
      toast.error(t("page.product.form.failed"), {
        description: t("page.product.form.failedLoadTemplate")
      });
    }
  };

  const formSchema = useMemo(() => {
    return z.object({
      nameProduct: z.string().min(1, t("page.product.form.requiredName")),
      productType: z.string().default("simple"),
      sku: z.string().optional().or(z.literal("")),
      barcode: z.string().optional().or(z.literal("")),
      brand: z.string().optional().or(z.literal("")),
      category: z.string().min(1, t("page.product.form.requiredCategory")),
      supplier: z.string().optional().or(z.literal("")),
      tax: z.string().optional().or(z.literal("")),
      price: z.coerce.number().min(1, t("page.product.form.requiredPrice")),
      costPrice: z.coerce.number().min(0).optional().or(z.literal("")),
      stock: z.coerce.number().min(0).optional().or(z.literal("")),
      minStock: z.coerce.number().min(0).optional().or(z.literal("")),
      unit: z.string().default("pcs"),
      preparationTime: z.coerce.number().min(0).optional().or(z.literal("")),
      point: z.coerce.number().min(0).optional().or(z.literal("")),
      status: z.boolean().default(true),
      isAvailable: z.boolean().default(true)
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameProduct: "",
      productType: "simple",
      sku: "",
      barcode: "",
      brand: "",
      category: "",
      supplier: "",
      tax: "",
      priceTemplate: "",
      description: "",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "",
      unit: "pcs",
      preparationTime: "15",
      point: "",
      status: true,
      isAvailable: true
    }
  });

  const isOption = form.watch("isOption");
  const hasModifiers = form.watch("hasModifiers");

  const createMutation = useMutation(addProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.product.form.failed"), {
        description:
          err?.response?.data?.message || err.message || t("page.product.form.failedAddProduct")
      });
      setIsSubmitting(false);
    }
  });

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

  const addVariantGroup = () => {
    setVariantGroups((prev) => [
      ...prev,
      { id: Date.now(), name: "", options: [{ name: "", price: 0, stock: 0 }] }
    ]);
    form.setValue("isOption", true);
  };

  const removeVariantGroup = (id) => {
    setVariantGroups((prev) => prev.filter((g) => g.id !== id));
    if (variantGroups.length <= 1) {
      form.setValue("isOption", false);
    }
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
    if (modifierItems.length <= 1) {
      form.setValue("hasModifiers", false);
    }
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

  const canGoNext = () => {
    if (currentStep === 1) {
      const values = form.getValues();
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
      const msg =
        currentStep === 1
          ? t("page.product.form.requiredStep1")
          : t("page.product.form.requiredStep2");
      toast.error(t("page.product.form.completeData"), { description: msg });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleToggleOption = (checked) => {
    form.setValue("isOption", checked);
    if (!checked) setVariantGroups([]);
  };

  const handleToggleModifier = (checked) => {
    form.setValue("hasModifiers", checked);
    if (!checked) setModifierItems([]);
  };

  const onSubmit = (values) => {
    if (selectedStores.length === 0) {
      toast.error(t("page.product.form.selectStoreError"), {
        description: t("page.product.form.selectStoreErrorDesc")
      });
      return;
    }
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("nameProduct", values.nameProduct);
    payload.append("productType", values.productType);
    if (values.sku) payload.append("sku", values.sku);
    if (values.barcode) payload.append("barcode", values.barcode);
    if (values.brand) payload.append("brand", values.brand);
    payload.append("category", values.category);
    if (values.supplier) payload.append("supplier", values.supplier);
    if (values.tax) payload.append("tax", values.tax);
    payload.append("stores", JSON.stringify(selectedStores));
    payload.append("price", values.price);
    if (values.costPrice !== "") payload.append("costPrice", values.costPrice);
    if (priceTiers.length > 0) {
      payload.append("priceTiers", JSON.stringify(priceTiers));
    }
    if (values.stock !== "") payload.append("stock", values.stock);
    if (values.minStock !== "") payload.append("minStock", values.minStock);
    payload.append("unit", values.unit);
    if (values.point !== "") payload.append("point", values.point);
    if (values.preparationTime !== "") payload.append("preparationTime", values.preparationTime);
    if (values.description) payload.append("description", values.description);
    payload.append("status", values.status);
    payload.append("isAvailable", values.isAvailable);
    payload.append("isOption", !!isOption);
    payload.append("hasModifiers", !!hasModifiers);

    if (isOption && variantGroups.length > 0) {
      payload.append("options", JSON.stringify(variantGroups));
    }

    if (hasModifiers && modifierItems.length > 0) {
      payload.append("modifiers", JSON.stringify(modifierItems));
    }

    if (hasBatch && batches.length > 0) {
      payload.append("batches", JSON.stringify(batches));
    }

    if (user?.id) payload.append("createdBy", user.id);
    if (imageFile) payload.append("image", imageFile);

    createMutation.mutate(payload);
  };

  const steps = [
    { num: 1, title: t("page.product.step.info"), desc: t("page.product.step.infoDesc") },
    { num: 2, title: t("page.product.step.price"), desc: t("page.product.step.priceDesc") },
    { num: 3, title: t("page.product.step.media"), desc: t("page.product.step.mediaDesc") }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.home", href: "/dashboard-super-admin" },
          { i18nKey: "breadcrumb.product", href: "/product-list" },
          { i18nKey: "breadcrumb.add" }
        ]}
        title={t("page.product.add.title")}
        description={t("page.product.add.description")}></PageHeader>

      {/* Stepper */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
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
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-4 ${currentStep > s.num ? "bg-green-500" : "bg-border"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className={`${currentStep === 3 ? "" : "lg:col-span-2"} space-y-6`}>
              {currentStep === 1 && (
                <div className="grid grid-cols-1 gap-6">
                  {isSuperAdmin ? (
                    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Store size={20} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {t("page.product.add.storeSection.title")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("page.product.add.storeSection.desc")}
                          </p>
                        </div>
                        {locations.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {t("page.product.add.storeSection.selected", {
                              count: selectedStores.length
                            })}
                          </span>
                        )}
                      </div>
                      {locations.length === 0 ? (
                        <div className="flex items-center gap-3 pl-9">
                          <p className="text-sm text-muted-foreground">
                            {t("page.product.add.storeSection.noStore")}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => navigate("/add-location")}
                            className="gap-1.5 shrink-0">
                            <Plus size={16} />
                            {t("page.product.add.storeSection.addStore")}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pl-9">
                          {locations.map((loc) => {
                            const isChecked = selectedStores.includes(loc.id);
                            return (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStores((prev) =>
                                    isChecked
                                      ? prev.filter((id) => id !== loc.id)
                                      : [...prev, loc.id]
                                  );
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                  isChecked
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}>
                                {loc.name}
                                {isChecked && (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : selectedStores.length > 0 ? (
                    <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Store size={16} className="shrink-0" />
                      <span>
                        {t("page.product.add.storeInfo")}{" "}
                        <strong className="text-foreground">
                          {user?.storeName || `Toko #${selectedStores[0]}`}
                        </strong>
                      </span>
                    </div>
                  ) : null}

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <Info size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.product.add.productInfoSection")}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                      <span className="text-sm font-medium text-foreground shrink-0">
                        {t("page.product.add.productType")}
                      </span>
                      <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
                        {["simple", "service"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => form.setValue("productType", type)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              form.watch("productType") === type
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}>
                            {type === "simple"
                              ? t("page.product.add.productType.simple")
                              : t("page.product.add.productType.service")}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {form.watch("productType") === "service"
                          ? t("page.product.add.productType.serviceDesc")
                          : t("page.product.add.productType.simpleDesc")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nameProduct"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              {t("page.product.form.name")}{" "}
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
                              searchPlaceholder={t("page.product.form.categoryPlaceholder") + "..."}
                            />
                            <FormMessage />
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
                              {t("page.product.form.barcodeOptional")}
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
                              searchPlaceholder={t("page.product.form.unitPlaceholder") + "..."}
                            />
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
                                options={supplierOptions.map((s) => ({
                                  value: String(s.id),
                                  label: s.name
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={t("page.product.form.supplierPlaceholder")}
                                searchPlaceholder={
                                  t("page.product.form.supplierPlaceholder") + "..."
                                }
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="preparationTime"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("page.product.form.preparationTime")}</FormLabel>
                            <div className="relative w-48">
                              <Input
                                type="number"
                                placeholder={t("page.product.form.preparationTimePlaceholder")}
                                className="pr-14"
                                {...field}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {t("page.product.form.preparationTimeUnit")}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {t("page.product.form.preparationTimeInfo")}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t("page.product.form.description")}</FormLabel>
                            <Textarea
                              placeholder={t("page.product.form.descriptionPlaceholder")}
                              className="min-h-[80px] resize-y"
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <>
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <DollarSign size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.product.form.priceSection")}
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
                              <Input type="number" placeholder="0" className="pl-10" {...field} />
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
                              <Input type="number" placeholder="0" className="pl-10" {...field} />
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
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {t("page.product.form.minStockInfo")}
                            </p>
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
                    </div>
                  </div>

                  {/* Batch & Expiry */}
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <Package size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.product.form.batchSection")}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {t("page.product.form.hasBatch")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("page.product.form.hasBatchDesc")}
                          </p>
                        </div>
                        <Switch checked={hasBatch} onCheckedChange={setHasBatch} />
                      </div>
                      {hasBatch && (
                        <div className="space-y-3">
                          {batches.map((batch, idx) => (
                            <div key={batch.id} className="bg-muted/30 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder={t("page.product.form.batchNumberPlaceholder")}
                                  value={batch.batchNumber}
                                  onChange={(e) => {
                                    setBatches((prev) =>
                                      prev.map((b, i) =>
                                        i === idx ? { ...b, batchNumber: e.target.value } : b
                                      )
                                    );
                                  }}
                                  className="h-9 text-sm flex-1"
                                />
                                <Input
                                  type="date"
                                  value={batch.expiryDate}
                                  onChange={(e) => {
                                    setBatches((prev) =>
                                      prev.map((b, i) =>
                                        i === idx ? { ...b, expiryDate: e.target.value } : b
                                      )
                                    );
                                  }}
                                  className="h-9 text-sm w-40 shrink-0"
                                />
                                <Input
                                  type="number"
                                  placeholder={t("page.product.form.batchStockPlaceholder")}
                                  value={batch.stock}
                                  onChange={(e) => {
                                    setBatches((prev) =>
                                      prev.map((b, i) =>
                                        i === idx ? { ...b, stock: e.target.value } : b
                                      )
                                    );
                                  }}
                                  className="h-9 text-sm w-24 shrink-0"
                                />
                                {batches.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive shrink-0"
                                    onClick={() =>
                                      setBatches((prev) => prev.filter((_, i) => i !== idx))
                                    }>
                                    <Trash2 size={15} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              setBatches((prev) => [
                                ...prev,
                                { id: Date.now(), batchNumber: "", expiryDate: "", stock: "" }
                              ])
                            }>
                            <Plus size={15} /> {t("page.product.form.addBatch")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <TrendingUp size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.product.form.tierSection")}
                      </h3>
                    </div>
                    {isSuperAdmin && (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="priceTemplate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("page.product.form.priceTemplate")}</FormLabel>
                              <Combobox
                                options={priceListTemplates.map((tOpt) => ({
                                  value: String(tOpt.id),
                                  label: tOpt.name
                                }))}
                                value={field.value}
                                onChange={(value) => {
                                  field.onChange(value);
                                  if (value) handleSelectPriceTemplate(value);
                                }}
                                placeholder={t("page.product.form.priceTemplatePlaceholder")}
                                searchPlaceholder={t("page.product.form.priceTemplateSearch")}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
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
                                type="number"
                                placeholder="0"
                                value={tier.price}
                                onChange={(e) => updatePriceTier(tier.id, "price", e.target.value)}
                                className="h-9 text-sm pl-8"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive shrink-0"
                              onClick={() => removePriceTier(tier.id)}>
                              <Trash2 size={15} />
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
                        <Plus size={15} /> {t("page.product.form.addTier")}
                      </Button>
                      {priceTiers.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t("page.product.form.tierEmpty")}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
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
                            <div key={group.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
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
                                  <Trash2 size={15} />
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
                                        updateVariantOption(group.id, idx, "name", e.target.value)
                                      }
                                      className="h-9 text-sm flex-1"
                                    />
                                    <div className="relative w-28 shrink-0">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        Rp
                                      </span>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={opt.price}
                                        onChange={(e) =>
                                          updateVariantOption(
                                            group.id,
                                            idx,
                                            "price",
                                            e.target.value
                                          )
                                        }
                                        className="h-9 text-sm pl-8"
                                      />
                                    </div>
                                    <Input
                                      type="number"
                                      placeholder={t("page.product.form.variantStockPlaceholder")}
                                      value={opt.stock}
                                      onChange={(e) =>
                                        updateVariantOption(group.id, idx, "stock", e.target.value)
                                      }
                                      className="h-9 text-sm w-20 shrink-0"
                                    />
                                    {group.options.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground shrink-0"
                                        onClick={() => removeVariantOption(group.id, idx)}>
                                        <X size={15} />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1 h-8 text-xs"
                                onClick={() => addVariantOption(group.id)}>
                                <Plus size={14} /> {t("page.product.form.addOption")}
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={addVariantGroup}>
                            <Plus size={15} /> {t("page.product.form.addVariantGroup")}
                          </Button>
                        </div>
                      )}

                      <div className="border-t border-border pt-5">
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
                          <div className="space-y-3 pl-4 border-l-2 border-primary/20 mt-4">
                            {modifierItems.map((mod) => (
                              <div key={mod.id} className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Input
                                    placeholder={t("page.product.form.modifierNamePlaceholder")}
                                    value={mod.name}
                                    onChange={(e) =>
                                      updateModifierItem(mod.id, "name", e.target.value)
                                    }
                                    className="h-9 text-sm flex-1"
                                  />
                                  <div className="relative w-32 shrink-0">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      Rp
                                    </span>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={mod.price}
                                      onChange={(e) =>
                                        updateModifierItem(mod.id, "price", e.target.value)
                                      }
                                      className="h-9 text-sm pl-8"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive shrink-0"
                                    onClick={() => removeModifierItem(mod.id)}>
                                    <Trash2 size={15} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={addModifierItem}>
                              <Plus size={15} /> {t("page.product.form.addModifier")}
                            </Button>
                          </div>
                        )}
                      </div>
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
                                  {field.value ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    Status{" "}
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
                                  {field.value ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelModal(true)}
              className="gap-2 w-full sm:w-auto">
              <X size={18} />
              {t("page.product.form.cancel")}
            </Button>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                  <ChevronLeft size={18} />
                  {t("page.product.form.prev")}
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="gap-2 shadow-md">
                  {t("page.product.form.next")}
                  <ChevronRight size={18} />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-md">
                  {isSubmitting ? <Loading size="sm" className="text-white" /> : <Save size={18} />}
                  {t("page.product.form.save")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.product.form.successAddTitle")}
        description={t("page.product.form.successAddDesc")}
        onConfirm={() => navigate("/product-list")}
      />

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.product.form.cancelTitle")}
        description={t("page.product.form.cancelDesc")}
        confirmText={t("page.product.form.cancelConfirm")}
        cancelText={t("page.product.form.cancelBack")}
        onConfirm={() => navigate("/product-list")}
      />

      {isSubmitting && <Loading fullscreen size="lg" label={t("page.product.form.saving")} />}
    </div>
  );
};

export default AddProduct;
