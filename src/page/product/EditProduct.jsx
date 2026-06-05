import React, { useState, useMemo, useEffect } from "react";
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
  Tag,
  Layers,
  DollarSign,
  Info,
  Trash2,
  GripVertical,
  TrendingUp,
  Store,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useCookies } from "react-cookie";
import PageHeader from "@/components/ui/PageHeader";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import { getProductById, editProduct } from "@/services/product";
import { getAllCategory } from "@/services/category";
import { getAllSupplier } from "@/services/supplier";
import { getAllTaxConfig } from "@/services/tax-config";
import { getAllPriceListTemplate, getPriceListTemplateById } from "@/services/price-list-template";
import { getAllLocation } from "@/services/location";
import { getProductPriceByStore, updateProductPriceByStore } from "@/services/price-store";

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

  const { data: productData, isLoading: loadingProduct } = useQuery(
    ["product-edit", productId],
    () => getProductById(productId),
    { enabled: !!productId }
  );
  const product = productData?.data || {};

  const { data: categoriesData } = useQuery(
    ["categories-for-edit"],
    () => getAllCategory({ location: product.store || "" }),
    { enabled: !!product.store }
  );
  const categories = categoriesData?.data || categoriesData?.categories || [];

  const isSuperAdmin = role === "super_admin";

  const { data: suppliersData } = useQuery(
    ["suppliers-for-edit"],
    () => getAllSupplier({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const supplierOptions = suppliersData?.data || [];

  const { data: taxData } = useQuery(
    ["tax-configs-for-edit"],
    () => getAllTaxConfig({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const taxOptions = taxData?.data || [];

  const { data: priceListTemplatesData } = useQuery(
    ["price-list-templates-for-edit"],
    () => getAllPriceListTemplate({ limit: 100 }),
    { enabled: isSuperAdmin }
  );
  const priceListTemplates = priceListTemplatesData?.data || [];

  const { data: locationsData } = useQuery(["locations-for-edit"], getAllLocation, {
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
      setStorePrices(storePricesData.data);
    }
  }, [storePricesData]);

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
      nameProduct: z.string().min(1, "Nama produk wajib diisi"),
      barcode: z.string().optional().or(z.literal("")),
      brand: z.string().optional().or(z.literal("")),
      category: z.string().min(1, "Kategori wajib dipilih"),
      supplier: z.string().optional().or(z.literal("")),
      tax: z.string().optional().or(z.literal("")),
      priceTemplate: z.string().optional().or(z.literal("")),
      description: z.string().optional().or(z.literal("")),
      price: z.coerce.number().min(1, "Harga jual harus diisi"),
      costPrice: z.coerce.number().min(0).optional().or(z.literal("")),
      stock: z.coerce.number().min(0).optional().or(z.literal("")),
      minStock: z.coerce.number().min(0).optional().or(z.literal("")),
      unit: z.string().default("pcs"),
      point: z.coerce.number().min(0).optional().or(z.literal("")),
      preparationTime: z.coerce.number().min(0).optional().or(z.literal("")),
      status: z.boolean().default(true),
      isAvailable: z.boolean().default(true)
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameProduct: "",
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
      point: "",
      preparationTime: "15",
      status: true,
      isAvailable: true
    }
  });

  useEffect(() => {
    if (product.id) {
      form.reset({
        nameProduct: product.nameProduct || "",
        barcode: product.barcode || "",
        brand: product.brand || "",
        category: String(product.category || ""),
        supplier: product.supplier ? String(product.supplier) : "",
        tax: product.tax ? String(product.tax) : "",
        priceTemplate: product.priceTemplate ? String(product.priceTemplate) : "",
        description: product.description || "",
        price: product.price || "",
        costPrice: product.costPrice || "",
        stock: product.stock ?? "",
        minStock: product.minStock ?? "",
        unit: product.unit || "pcs",
        point: product.point ?? "",
        preparationTime: product.preparationTime ?? "15",
        status: product.status === "active" || product.status === true,
        isAvailable: product.isAvailable ?? true
      });
      if (product.isOption && product.options) {
        setVariantGroups(product.options);
      }
      if (product.hasModifiers && product.modifiers) {
        setModifierItems(product.modifiers);
      }
      if (product.priceTiers) {
        setPriceTiers(product.priceTiers);
      }
    }
  }, [product, form]);

  const isOption = form.watch("isOption");
  const hasModifiers = form.watch("hasModifiers");

  const editMutation = useMutation(editProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["product-detail"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengubah produk"
      });
      setIsSubmitting(false);
    }
  });

  const updateStorePriceMutation = useMutation(updateProductPriceByStore, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Harga toko berhasil diperbarui" });
      queryClient.invalidateQueries(["product-store-prices"]);
      setSavingStoreId(null);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || "Gagal memperbarui harga toko"
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
    setVariantGroups((prev) => [...prev, { id: Date.now(), name: "", options: [""] }]);
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
      prev.map((g) => (g.id === groupId ? { ...g, options: [...g.options, ""] } : g))
    );
  };

  const updateVariantOption = (groupId, index, value) => {
    setVariantGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.map((opt, i) => (i === index ? value : opt)) }
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
          ? "Lengkapi field wajib (Nama Produk & Kategori) sebelum lanjut."
          : "Lengkapi field wajib (Harga Jual) sebelum lanjut.";
      toast.error("Lengkapi Data", { description: msg });
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

  const onSubmit = (values, saveAsDraft = false) => {
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("id", productId);
    payload.append("nameProduct", values.nameProduct);
    if (values.barcode) payload.append("barcode", values.barcode);
    if (values.brand) payload.append("brand", values.brand);
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
    if (values.point) payload.append("point", values.point);
    if (values.preparationTime) payload.append("preparationTime", values.preparationTime);
    if (values.description) payload.append("description", values.description);
    payload.append("status", saveAsDraft ? "draft" : values.status ? "active" : "inactive");
    payload.append("isAvailable", values.isAvailable);
    payload.append("isOption", !!isOption);
    payload.append("hasModifiers", !!hasModifiers);

    if (isOption && variantGroups.length > 0) {
      payload.append("options", JSON.stringify(variantGroups));
    }
    if (hasModifiers && modifierItems.length > 0) {
      payload.append("modifiers", JSON.stringify(modifierItems));
    }

    editMutation.mutate(payload);
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
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
        description={t("page.product.edit.description")}>
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <X size={18} /> {t("page.product.form.cancel")}
        </Button>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Stepper Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
              {[
                { step: 1, label: t("page.product.step.info") },
                { step: 2, label: t("page.product.step.price") },
                { step: 3, label: t("page.product.step.media") }
              ].map((s, i) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        currentStep > s.step
                          ? "bg-primary text-primary-foreground"
                          : currentStep === s.step
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}>
                      {currentStep > s.step ? (
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
                        s.step
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium hidden sm:inline ${currentStep >= s.step ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 rounded transition-colors ${currentStep > s.step ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 1 && (
                <>
                  {/* Informasi Produk */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <Info size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.product.step.info")}
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
                  </Card>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {/* Harga & Stok */}
                  <Card className="p-6">
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
                        name="preparationTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("page.product.form.preparationTime")}</FormLabel>
                            <div className="relative">
                              <Input type="number" placeholder="15" className="pr-14" {...field} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {t("page.product.form.minutes")}
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>

                  {/* Harga Berjenjang */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <TrendingUp size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.product.form.tierSection")}
                      </h3>
                    </div>
                    {isSuperAdmin && (
                      <FormField
                        control={form.control}
                        name="priceTemplate"
                        render={({ field }) => (
                          <FormItem className="mb-4">
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
                        <Plus size={15} />
                        {t("page.product.form.addTier")}
                      </Button>
                      {priceTiers.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          {t("page.product.form.tierEmpty")}
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Harga per Toko */}
                  {isSuperAdmin && (
                    <Card className="p-6">
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
                                  {savingStoreId === sp.storeId ? (
                                    <Loading size="sm" />
                                  ) : (
                                    t("page.product.form.saveStorePrice")
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}
                </>
              )}

              {currentStep === 3 && (
                <>
                  {/* Varian & Opsi */}
                  <Card className="p-6">
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
                                      value={opt}
                                      onChange={(e) =>
                                        updateVariantOption(group.id, idx, e.target.value)
                                      }
                                      className="h-9 text-sm"
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
                  </Card>

                  {/* Modifiers */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
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
                        {modifierItems.map((mod) => (
                          <div key={mod.id} className="bg-muted/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                placeholder={t("page.product.form.modifierNamePlaceholder")}
                                value={mod.name}
                                onChange={(e) => updateModifierItem(mod.id, "name", e.target.value)}
                                className="h-9 text-sm"
                              />
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                    Rp
                                  </span>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={mod.price}
                                    onChange={(e) =>
                                      updateModifierItem(mod.id, "price", e.target.value)
                                    }
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
                  </Card>

                  {/* Status */}
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <div
                              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${field.value ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2 h-2 rounded-full ${field.value ? "bg-green-500" : "bg-red-500"}`}
                                />
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
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
                              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${field.value ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2 h-2 rounded-full ${field.value ? "bg-green-500" : "bg-red-500"}`}
                                />
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
                  </Card>
                </>
              )}
            </div>

            {/* Right Column - Tips */}
            <div className="space-y-6">
              {currentStep === 3 && (
                <>
                  <Card className="p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      {t("page.product.form.productInfo")}
                    </h3>
                    <div className="space-y-3 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-primary shrink-0">
                          badge
                        </span>
                        <span>
                          {t("page.product.form.skuLabel")}:{" "}
                          <strong className="text-foreground font-mono">
                            {product.sku || "-"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-primary shrink-0">
                          calendar_today
                        </span>
                        <span>
                          {t("page.product.form.createdAtLabel")}:{" "}
                          {new Date(product.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border mt-6">
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
                    Simpan sebagai Draft
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-md">
                    {isSubmitting ? (
                      <Loading size="sm" className="text-white" />
                    ) : (
                      <Save size={18} />
                    )}
                    {t("page.product.form.saveEdit")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </Form>

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
        title="Simpan sebagai Draft?"
        description="Data yang belum lengkap bisa dilengkapi nanti"
        confirmText="Ya, Simpan Draft"
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />

      {isSubmitting && <Loading fullscreen size="lg" label={t("page.product.form.savingEdit")} />}
    </div>
  );
};

export default EditProduct;
