import React, { useState, useMemo, useEffect } from "react";
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
  Tag,
  Layers,
  DollarSign,
  Info,
  Trash2,
  GripVertical,
  TrendingUp,
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

const EditProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [cookies] = useCookies();
  const user = cookies?.user;
  const role = user?.roleType || "";
  const productId = searchParams.get("id");

  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [variantGroups, setVariantGroups] = useState([]);
  const [modifierItems, setModifierItems] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

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
      toast.error("Gagal", { description: "Gagal memuat template harga" });
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
        status: product.status ?? true,
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

  const onSubmit = (values) => {
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
        <p>Produk tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/product-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: "Dashboard",
            href: role === "super_admin" ? "/dashboard-super-admin" : "/dashboard-admin"
          },
          { label: "Produk", href: "/product-list" },
          { label: product.nameProduct || "Edit Produk" }
        ]}
        title={`Edit ${product.nameProduct || "Produk"}`}
        description="Ubah informasi detail produk inventaris toko Anda.">
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <X size={18} /> Batal
        </Button>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Stepper Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
              {[
                { step: 1, label: "Informasi Produk" },
                { step: 2, label: "Harga & Stok" },
                { step: 3, label: "Varian & Lainnya" }
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
                      <h3 className="text-base font-semibold text-foreground">Informasi Produk</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nameProduct"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              Nama Produk <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input placeholder="Masukkan nama produk" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode</FormLabel>
                            <Input placeholder="Scan atau masukkan barcode" {...field} />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Kode barcode produk (opsional)
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
                            <FormLabel>Merek / Brand</FormLabel>
                            <Input placeholder="Contoh: Nike, Samsung, Aqua" {...field} />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Merek produk (opsional)
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
                              <FormLabel>Supplier</FormLabel>
                              <Combobox
                                options={supplierOptions.map((s) => ({
                                  value: String(s.id),
                                  label: s.name
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Pilih Supplier"
                                searchPlaceholder="Cari supplier..."
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
                              <FormLabel>Pajak</FormLabel>
                              <Combobox
                                options={taxOptions.map((t) => ({
                                  value: String(t.id),
                                  label: `${t.name} (${t.rate}%)`
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Pilih Pajak"
                                searchPlaceholder="Cari pajak..."
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
                              Kategori <span className="text-destructive">*</span>
                            </FormLabel>
                            <Combobox
                              options={categories.map((c) => ({
                                value: String(c.id),
                                label: c.name
                              }))}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Pilih Kategori"
                              searchPlaceholder="Cari kategori..."
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
                            <FormLabel>Satuan</FormLabel>
                            <Combobox
                              options={unitOptions}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Pilih Satuan"
                              searchPlaceholder="Cari satuan..."
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
                            <FormLabel>Deskripsi</FormLabel>
                            <Textarea
                              placeholder="Deskripsi produk (opsional)"
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
                      <h3 className="text-base font-semibold text-foreground">Harga & Stok</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Harga Jual <span className="text-destructive">*</span>
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
                            <FormLabel>Harga Modal</FormLabel>
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
                            <FormLabel>Stok</FormLabel>
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
                            <FormLabel>Min. Stok</FormLabel>
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
                            <FormLabel>Poin Member</FormLabel>
                            <Input type="number" placeholder="0" {...field} />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Poin yang didapat member saat membeli produk ini
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
                            <FormLabel>Waktu Persiapan</FormLabel>
                            <div className="relative">
                              <Input type="number" placeholder="15" className="pr-14" {...field} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                menit
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
                      <h3 className="text-base font-semibold text-foreground">Harga Berjenjang</h3>
                    </div>
                    {isSuperAdmin && (
                      <FormField
                        control={form.control}
                        name="priceTemplate"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Template Harga</FormLabel>
                            <Combobox
                              options={priceListTemplates.map((t) => ({
                                value: String(t.id),
                                label: t.name
                              }))}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                if (value) handleSelectPriceTemplate(value);
                              }}
                              placeholder="Pilih Template Harga"
                              searchPlaceholder="Cari template..."
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
                              placeholder="Nama tingkat (contoh: Grosir, Member)"
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
                        Tambah Tingkat Harga
                      </Button>
                      {priceTiers.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Tambahkan harga khusus untuk pelanggan grosir, member, atau tingkat
                          lainnya.
                        </p>
                      )}
                    </div>
                  </Card>
                </>
              )}

              {currentStep === 3 && (
                <>
                  {/* Varian & Opsi */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <Layers size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">Varian & Opsi</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Punya Varian</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Aktifkan jika produk memiliki varian (ukuran, warna, rasa, dll.)
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
                                    placeholder="Nama varian (contoh: Ukuran)"
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
                                      placeholder={`Opsi ${idx + 1}`}
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
                                <Plus size={14} /> Tambah Opsi
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addVariantGroup}
                            className="gap-2">
                            <Plus size={16} /> Tambah Grup Varian
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
                        Modifier / Tambahan
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Punya Modifier</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tambahan seperti topping, garansi, gift wrap, dll.
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
                                placeholder="Nama modifier"
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
                          <Plus size={16} /> Tambah Modifier
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
                                    {field.value ? "Aktif" : "Nonaktif"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.value
                                      ? "Produk aktif dan bisa dijual"
                                      : "Produk tidak aktif"}
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
                                    {field.value ? "Tersedia" : "Tidak Tersedia"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.value
                                      ? "Produk tersedia untuk dipesan"
                                      : "Produk tidak tersedia"}
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
                    <h3 className="text-sm font-semibold text-foreground mb-3">Informasi Produk</h3>
                    <div className="space-y-3 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-primary shrink-0">
                          badge
                        </span>
                        <span>
                          SKU:{" "}
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
                          Dibuat: {new Date(product.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-lg">lightbulb</span>
                      <h4 className="text-sm font-semibold">Tips Pengisian</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base shrink-0">
                          check_circle
                        </span>
                        <span>Gunakan foto produk yang jelas dan menarik</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base shrink-0">
                          check_circle
                        </span>
                        <span>Isi harga jual dan stok dengan benar untuk kelancaran transaksi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base shrink-0">
                          check_circle
                        </span>
                        <span>Scan barcode untuk mempercepat proses di kasir</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base shrink-0">
                          check_circle
                        </span>
                        <span>Atur stok minimal untuk notifikasi ketika stok menipis</span>
                      </li>
                    </ul>
                  </div>
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
              <X size={18} /> Batal
            </Button>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                  <ChevronLeft size={18} /> Sebelumnya
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="gap-2 shadow-md">
                  Selanjutnya <ChevronRight size={18} />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-md">
                  {isSubmitting ? <Loading size="sm" className="text-white" /> : <Save size={18} />}
                  Simpan Perubahan
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
        title="Produk Berhasil Diubah"
        description="Perubahan produk telah berhasil disimpan."
        onConfirm={() => navigate("/product-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onCancel={() => setCancelModal(false)}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        description="Data yang sudah diisi tidak akan disimpan."
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
        onConfirm={() => navigate("/product-list")}
      />
      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan perubahan..." />}
    </div>
  );
};

export default EditProduct;
