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
  XCircle,
  Lightbulb
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
import Modal from "@/components/organism/modal";
import { addProduct } from "@/services/product";
import { getAllCategory } from "@/services/category";
import { getAllLocation } from "@/services/location";
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

const AddProduct = () => {
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
      toast.error("Gagal", { description: "Gagal memuat template harga" });
    }
  };

  const formSchema = useMemo(() => {
    return z.object({
      nameProduct: z.string().min(1, "Nama produk wajib diisi"),
      productType: z.string().default("simple"),
      sku: z.string().optional().or(z.literal("")),
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
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan produk"
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
          ? "Lengkapi field wajib (Nama Produk & Kategori) sebelum lanjut."
          : "Lengkapi field wajib (Harga Jual) sebelum lanjut.";
      toast.error("Lengkapi Data", { description: msg });
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
      toast.error("Pilih Toko", {
        description: "Silakan pilih minimal satu toko terlebih dahulu."
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
    { num: 1, title: "Informasi Produk", desc: "Nama, kategori, brand, satuan" },
    { num: 2, title: "Harga & Stok", desc: "Harga jual, stok, price tiers" },
    { num: 3, title: "Media & Status", desc: "Foto, varian, modifier, status" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard-super-admin" },
          { label: "Produk", href: "/product-list" },
          { label: "Tambah Produk" }
        ]}
        title="Tambah Produk"
        description="Lengkapi informasi detail produk untuk inventaris toko Anda."></PageHeader>

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
                          <p className="text-sm font-medium text-foreground">Pilih Toko</p>
                          <p className="text-xs text-muted-foreground">
                            Pilih toko tujuan untuk produk ini
                          </p>
                        </div>
                        {locations.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {selectedStores.length} dipilih
                          </span>
                        )}
                      </div>
                      {locations.length === 0 ? (
                        <div className="flex items-center gap-3 pl-9">
                          <p className="text-sm text-muted-foreground">Belum ada toko terdaftar</p>
                          <Button
                            size="sm"
                            onClick={() => navigate("/add-location")}
                            className="gap-1.5 shrink-0">
                            <Plus size={16} />
                            Buat Toko Baru
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
                        Menambahkan produk untuk:{" "}
                        <strong className="text-foreground">
                          {user?.storeName || `Toko #${selectedStores[0]}`}
                        </strong>
                      </span>
                    </div>
                  ) : null}

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <Info size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">Informasi Produk</h3>
                    </div>

                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                      <span className="text-sm font-medium text-foreground shrink-0">
                        Tipe Produk
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
                            {type === "simple" ? "Barang Fisik" : "Jasa"}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {form.watch("productType") === "service"
                          ? "Produk jasa, tidak menggunakan stok"
                          : "Produk fisik dengan stok"}
                      </span>
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
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <Input placeholder="Kosongkan untuk auto-generate" {...field} />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Kode unik internal toko (opsional)
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
                        name="preparationTime"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Waktu Persiapan</FormLabel>
                            <div className="relative w-48">
                              <Input type="number" placeholder="15" className="pr-14" {...field} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                menit
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Estimasi waktu pembuatan produk
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
                            <FormLabel>Deskripsi</FormLabel>
                            <Textarea
                              placeholder="Deskripsi produk (opsional)"
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
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Notifikasi ketika stok menipis
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
                            <FormLabel>Poin Member</FormLabel>
                            <Input type="number" placeholder="0" {...field} />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Poin yang didapat member saat membeli produk ini
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
                      <h3 className="text-base font-semibold text-foreground">Batch & Expiry</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Produk dengan Batch
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Aktifkan jika produk memiliki nomor batch & tanggal kedaluwarsa
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
                                  placeholder="Nomor batch"
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
                                  placeholder="Stok"
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
                            <Plus size={15} /> Tambah Batch
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
                      <TrendingUp size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">Harga Berjenjang</h3>
                    </div>
                    {isSuperAdmin && (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="priceTemplate"
                          render={({ field }) => (
                            <FormItem>
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
                      </div>
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
                        <Plus size={15} /> Tambah Tingkat Harga
                      </Button>
                      {priceTiers.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Tambahkan harga khusus untuk pelanggan grosir, member, atau tingkat
                          lainnya.
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
                      <h3 className="text-base font-semibold text-foreground">Varian & Opsi</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Punya Varian</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Aktifkan jika produk memiliki varian (ukuran, rasa, dll.)
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
                                      placeholder="Stok"
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
                                <Plus size={14} /> Tambah Opsi
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={addVariantGroup}>
                            <Plus size={15} /> Tambah Grup Varian
                          </Button>
                        </div>
                      )}

                      <div className="border-t border-border pt-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Punya Modifier</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Aktifkan jika produk memiliki opsi tambahan (extra topping, level,
                              dll.)
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
                                    placeholder="Nama modifier (contoh: Extra Cheese)"
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
                              <Plus size={15} /> Tambah Modifier
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
                      <h3 className="text-base font-semibold text-foreground">Foto Produk</h3>
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
                          alt="Preview"
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
                        <p className="text-sm font-medium text-foreground">Upload Foto</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Klik untuk memilih gambar
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG maks. 5MB</p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
                      <Tag size={18} className="text-primary" />
                      <h3 className="text-base font-semibold text-foreground">Status</h3>
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
                                    Status {field.value ? "Aktif" : "Nonaktif"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.value
                                      ? "Produk ini aktif dan dapat dijual"
                                      : "Produk ini tidak aktif"}
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
                                    Tersedia {field.value ? "Ya" : "Tidak"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.value
                                      ? "Produk tersedia untuk dipesan"
                                      : "Produk tidak tersedia untuk dipesan"}
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

                  {/* Tips */}
                  <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={18} />
                      <h4 className="text-sm font-semibold">Tips Pengisian</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>Gunakan foto produk yang jelas dan menarik</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>Isi harga jual dan stok dengan benar untuk kelancaran transaksi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>Scan barcode untuk mempercepat proses di kasir</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>Atur stok minimal untuk notifikasi ketika stok menipis</span>
                      </li>
                    </ul>
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
              Batal
            </Button>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                  <ChevronLeft size={18} />
                  Sebelumnya
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="gap-2 shadow-md">
                  Selanjutnya
                  <ChevronRight size={18} />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-md">
                  {isSubmitting ? <Loading size="sm" className="text-white" /> : <Save size={18} />}
                  Simpan Produk
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
        title="Produk Berhasil Ditambahkan"
        description="Produk baru telah berhasil ditambahkan ke dalam daftar inventaris."
        onConfirm={() => navigate("/product-list")}
      />

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Penambahan?"
        description="Data yang sudah diisi tidak akan disimpan."
        confirmText="Ya, Batalkan"
        cancelText="Lanjutkan Mengisi"
        onConfirm={() => navigate("/product-list")}
      />

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan produk..." />}
    </div>
  );
};

export default AddProduct;
