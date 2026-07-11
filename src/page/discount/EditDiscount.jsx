import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { X, Save } from "lucide-react";
import { getDiscountById, editDiscount } from "@/services/discount";
import { getAllLocation } from "@/services/location";
import StoreSelectCard from "@/components/organism/StoreSelectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import AbortController from "@/components/organism/abort-controller";
import Modal from "@/components/organism/modal";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import { useTranslation } from "react-i18next";
const PROMO_TYPES = {
  standard: "page.discount.form.promoType.standard",
  bogo: "page.discount.form.promoType.bogo",
  bundling: "page.discount.form.promoType.bundling",
  happyHour: "page.discount.form.promoType.happyHour",
  category: "page.discount.form.promoType.category"
};

const EditDiscount = () => {
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(1, t("page.discount.form.validation.nameRequired")),
    promoType: z.string().default("standard"),
    type: z
      .string()
      .min(1, t("page.discount.form.validation.typeRequired"))
      .optional()
      .or(z.literal("")),
    value: z.coerce
      .number()
      .min(1, t("page.discount.form.validation.valueRequired"))
      .optional()
      .or(z.literal("")),
    startDate: z.date({ required_error: t("page.discount.form.validation.startDateRequired") }),
    endDate: z.date().nullable().optional(),
    minPurchase: z.coerce.number().min(0).optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    code: z.string().optional().or(z.literal("")),
    maxDiscount: z.coerce.number().min(0).optional().or(z.literal("")),
    buyQty: z.coerce.number().min(1).optional().or(z.literal("")),
    freeQty: z.coerce.number().min(1).optional().or(z.literal("")),
    bundlePrice: z.coerce.number().min(1).optional().or(z.literal("")),
    productIds: z.string().optional().or(z.literal("")),
    discountPercent: z.coerce.number().min(1).max(100).optional().or(z.literal("")),
    startTime: z.string().optional().or(z.literal("")),
    endTime: z.string().optional().or(z.literal("")),
    daysOfWeek: z.string().optional().or(z.literal("")),
    categoryIds: z.string().optional().or(z.literal("")),
    catDiscountPercent: z.coerce.number().min(1).max(100).optional().or(z.literal("")),
    store: z.string().optional()
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const [draftModal, setDraftModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locData, isLoading: locsLoading } = useQuery(
    ["locations"],
    () => getAllLocation(),
    {
      staleTime: 5 * 60 * 1000
    }
  );
  const locations = locData?.data || [];

  const [selectedStores, setSelectedStores] = useState([]);
  const [allStores, setAllStores] = useState(true);
  // const locationParam = user?.store || "";

  const { data, isLoading, isError, refetch } = useQuery(
    ["discount", id],
    () => getDiscountById(id),
    { enabled: !!id }
  );

  const discountItem = data?.data || {};

  // const cond = useMemo(() => discountItem?.conditions || {}, [discountItem]);
  // const promoType = useMemo(() => cond?.promoType || "standard", [cond]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      promoType: "standard",
      type: "",
      value: "",
      startDate: undefined,
      endDate: undefined,
      minPurchase: "",
      description: "",
      isActive: true,
      code: "",
      maxDiscount: "",
      buyQty: "",
      freeQty: "",
      bundlePrice: "",
      productIds: "",
      discountPercent: "",
      startTime: "",
      endTime: "",
      daysOfWeek: "",
      categoryIds: "",
      catDiscountPercent: "",
      store: ""
    }
  });

  const { handleSubmit, confirmModal } = useConfirmSubmit(form, (values) => onSubmit(values));

  useEffect(() => {
    if (discountItem?.id) {
      const c = discountItem.conditions || {};
      if (discountItem.store) {
        setSelectedStores([discountItem.store]);
        setAllStores(false);
      } else {
        setSelectedStores([]);
        setAllStores(true);
      }
      form.reset({
        name: discountItem.name || "",
        promoType: c.promoType || "standard",
        type:
          discountItem.type === "percent"
            ? "Persentase"
            : discountItem.type === "nominal"
              ? "Nominal"
              : discountItem.type || "",
        value: discountItem.value ?? "",
        startDate: discountItem.startDate ? new Date(discountItem.startDate) : undefined,
        endDate: discountItem.endDate ? new Date(discountItem.endDate) : undefined,
        minPurchase: discountItem.minimumOrder ?? "",
        description: discountItem.description || "",
        isActive: discountItem.status === "active",
        code: discountItem.code || "",
        maxDiscount: discountItem.maximumDiscount ?? "",
        buyQty: c.buyQty ?? "",
        freeQty: c.freeQty ?? "",
        bundlePrice: c.bundlePrice ?? "",
        productIds: c.productIds ? c.productIds.join(",") : "",
        discountPercent: c.discountPercent ?? "",
        startTime: c.startTime ?? "",
        endTime: c.endTime ?? "",
        daysOfWeek: c.daysOfWeek ? c.daysOfWeek.join(",") : "",
        categoryIds: c.categoryIds ? c.categoryIds.join(",") : "",
        catDiscountPercent: c.discountPercent ?? ""
      });
    }
  }, [discountItem, form]);

  const updateMutation = useMutation(editDiscount, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.discount.edit.toast.error"), {
        description:
          err?.response?.data?.message ||
          err.message ||
          t("page.discount.edit.toast.errorDescription")
      });
    }
  });

  const buildConditions = (values) => {
    switch (values.promoType) {
      case "bogo":
        return {
          promoType: "bogo",
          buyQty: Number(values.buyQty),
          freeQty: Number(values.freeQty)
        };
      case "bundling":
        return {
          promoType: "bundling",
          bundlePrice: Number(values.bundlePrice),
          productIds: values.productIds ? values.productIds.split(",").map(Number) : []
        };
      case "happyHour":
        return {
          promoType: "happyHour",
          discountPercent: Number(values.discountPercent),
          startTime: values.startTime,
          endTime: values.endTime,
          daysOfWeek: values.daysOfWeek ? values.daysOfWeek.split(",").map(Number) : []
        };
      case "category":
        return {
          promoType: "category",
          discountPercent: Number(values.catDiscountPercent),
          categoryIds: values.categoryIds ? values.categoryIds.split(",").map(Number) : []
        };
      default:
        return null;
    }
  };

  const onSubmit = (values, saveAsDraft = false) => {
    if (isSuperAdmin && !allStores && selectedStores.length === 0 && !saveAsDraft) {
      form.setError("store", { message: t("page.ingredientCategory.add.storeRequired") });
      return;
    }
    form.clearErrors("store");
    const conditions = buildConditions(values);
    const isAdvanced = values.promoType !== "standard";

    const payload = {
      id,
      name: values.name,
      type: isAdvanced
        ? "percent"
        : values.type === "Persentase"
          ? "percent"
          : values.type === "Nominal"
            ? "nominal"
            : values.type,
      value: isAdvanced ? 0 : Number(values.value),
      startDate: values.startDate ? format(values.startDate, "yyyy-MM-dd") : "",
      endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
      minimumOrder: values.minPurchase || 0,
      maximumDiscount: values.maxDiscount || 0,
      code: values.code || null,
      conditions: conditions || {},
      store: allStores ? null : selectedStores[0] || null,
      description: values.description || null,
      status: saveAsDraft ? false : !!values.isActive
    };
    updateMutation.mutate(payload);
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.discount.edit.idNotFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return <Loading fullscreen size="lg" label={t("common.loading")} />;
  }

  if (!discountItem?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.discount.edit.notFound")}</p>
      </div>
    );
  }

  const currentPromoType = form.watch("promoType");

  const handleTypeClick = (e) => {
    e.preventDefault();
    if (isSuperAdmin && !allStores && selectedStores.length === 0) {
      form.setError("store", { message: t("page.ingredientCategory.add.storeRequired") });
      return;
    }
    form.clearErrors("store");
    form.handleSubmit((v) => onSubmit(v, false))();
  };

  return (
    <div>
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/discount")}
            className="hover:text-foreground transition-colors">
            {t("page.discount.list.title")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.discount.edit.title")}</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.discount.edit.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.discount.edit.description")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-12">
              <div className="col-span-12">
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
                          title={t("page.category.form.storeSection.title")}
                          description={t("page.category.form.storeSection.desc")}
                          noStoreLabel={t("page.category.form.storeSection.noStore")}
                          addStoreLabel={t("page.category.form.storeSection.addStore")}
                          storeInfoLabel={t("page.category.form.storeInfo")}
                          allStores={allStores}
                          onAllStoresChange={(val) => {
                            setAllStores(val);
                            form.clearErrors("store");
                          }}
                          navigate={navigate}
                          mandatory={true}
                          locationsLoading={locsLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.discount.form.name")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input placeholder={t("page.discount.form.namePlaceholder")} {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="promoType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.discount.form.promoTypeLabel")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("page.discount.form.promoTypePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PROMO_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {t(label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Standard discount fields */}
              {currentPromoType === "standard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("page.discount.form.typeLabel")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("page.discount.form.typePlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Persentase">
                              {t("page.discount.form.percent")}
                            </SelectItem>
                            <SelectItem value="Nominal">
                              {t("page.discount.form.nominal")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("page.discount.form.value")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          placeholder={t("page.discount.form.valuePlaceholder")}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* BOGO fields */}
              {currentPromoType === "bogo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="buyQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Beli (Qty) <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          min="1"
                          placeholder={t("page.discount.form.placeholder.buyQty")}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="freeQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Gratis (Qty) <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          min="1"
                          placeholder={t("page.discount.form.placeholder.freeQty")}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground md:col-span-2">
                    Contoh: Beli 2 gratis 1. Produk termurah akan diberikan gratis secara otomatis.
                  </p>
                </div>
              )}

              {/* Bundling fields */}
              {currentPromoType === "bundling" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bundlePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Harga Paket (Rp) <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          min="1"
                          placeholder={t("page.discount.form.placeholder.bundlePrice")}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          ID Produk <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          placeholder={t("page.discount.form.placeholder.productIds")}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground md:col-span-2">
                    Masukkan ID produk yang termasuk dalam paket, pisahkan dengan koma.
                  </p>
                </div>
              )}

              {/* Happy Hour fields */}
              {currentPromoType === "happyHour" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Diskon (%) <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder={t("page.discount.form.placeholder.discountPercent")}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Jam Mulai <span className="text-destructive">*</span>
                        </FormLabel>
                        <TimePicker
                          {...field}
                          placeholder={t("page.discount.form.placeholder.startTime")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Jam Selesai <span className="text-destructive">*</span>
                        </FormLabel>
                        <TimePicker
                          {...field}
                          placeholder={t("page.discount.form.placeholder.endTime")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="daysOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hari (0=Minggu, 1=Senin, ..., 6=Sabtu)</FormLabel>
                        <Input
                          placeholder={t("page.discount.form.placeholder.daysOfWeek")}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Category discount fields */}
              {currentPromoType === "category" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="catDiscountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Diskon (%) <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder={t("page.discount.form.placeholder.catDiscountPercent")}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          ID Kategori <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          placeholder={t("page.discount.form.placeholder.categoryIds")}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tanggal Mulai <span className="text-destructive">*</span>
                      </FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.discount.form.endDate")}</FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {currentPromoType === "standard" && (
                  <>
                    <FormField
                      control={form.control}
                      name="minPurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("page.discount.form.minPurchase")}</FormLabel>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("page.discount.form.maxDiscount")}</FormLabel>
                          <Input
                            type="number"
                            placeholder={t("page.discount.form.placeholder.maxDiscount")}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.discount.form.promoCode")}</FormLabel>
                      <Input
                        placeholder={t("page.discount.form.promoCodePlaceholder")}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("page.discount.form.description")}</FormLabel>
                    <Textarea
                      placeholder={t("page.discount.form.descriptionPlaceholder")}
                      rows={3}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                        field.value
                          ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            field.value
                              ? "bg-green-600 text-white"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                          <span className="material-symbols-outlined text-lg">
                            {field.value ? "check" : "close"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {field.value
                              ? t("page.discount.form.active")
                              : t("page.discount.form.inactive")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.value
                              ? t("page.discount.form.activeDescription")
                              : t("page.discount.form.inactiveDescription")}
                          </p>
                        </div>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelModal(true)}
                  className="gap-2">
                  <X size={18} />
                  {t("breadcrumb.back")}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftModal(true)}
                    disabled={updateMutation.isLoading}>
                    {t("page.discount.add.saveAsDraft")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleTypeClick}
                    disabled={updateMutation.isLoading}
                    className="gap-2">
                    <Save size={18} />
                    {updateMutation.isLoading ? t("button.saving") : t("button.save")}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </Form>

        <Modal type="confirm" {...confirmModal()} />
        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("page.discount.edit.cancelTitle")}
          description={t("page.discount.edit.cancelDescription")}
          confirmText={t("page.discount.edit.cancelConfirm")}
          onConfirm={() => navigate("/discount-list")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.discount.edit.successTitle")}
          description={t("page.discount.edit.successDescription")}
          confirmText={t("page.discount.edit.successConfirm")}
          onConfirm={() => navigate("/discount-list")}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("page.discount.edit.draftTitle")}
          description={t("page.discount.edit.draftDescription")}
          confirmText={t("page.discount.edit.draftConfirm")}
          onConfirm={() => {
            setDraftModal(false);
            const values = form.getValues();
            onSubmit(values, true);
          }}
        />
      </div>
    </div>
  );
};

export default EditDiscount;
