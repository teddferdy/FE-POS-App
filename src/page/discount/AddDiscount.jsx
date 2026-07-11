import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { X, Save } from "lucide-react";
import { addDiscount } from "@/services/discount";
import { getAllLocation } from "@/services/location";
import StoreSelectCard from "@/components/organism/StoreSelectCard";
import { Loading } from "@/components/ui/loading";
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
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
const PROMO_TYPES = {
  standard: "page.discount.form.promoType.standard",
  bogo: "page.discount.form.promoType.bogo",
  bundling: "page.discount.form.promoType.bundling",
  happyHour: "page.discount.form.promoType.happyHour",
  category: "page.discount.form.promoType.category"
};

const AddDiscount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const role = user?.roleType || "";
  const isSuperAdmin = role === "super_admin";
  const [selectedStores, setSelectedStores] = useState([]);
  const [allStores, setAllStores] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);

  const { data: locationsData, isLoading: locsLoading } = useQuery(
    ["allLocations"],
    () => getAllLocation(),
    {
      enabled: isSuperAdmin
    }
  );
  const locations = locationsData?.data || locationsData?.locations || [];

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
    // BOGO fields
    buyQty: z.coerce.number().min(1).optional().or(z.literal("")),
    freeQty: z.coerce.number().min(1).optional().or(z.literal("")),
    // Bundling fields
    bundlePrice: z.coerce.number().min(1).optional().or(z.literal("")),
    productIds: z.string().optional().or(z.literal("")),
    // Happy Hour fields
    discountPercent: z.coerce.number().min(1).max(100).optional().or(z.literal("")),
    startTime: z.string().optional().or(z.literal("")),
    endTime: z.string().optional().or(z.literal("")),
    daysOfWeek: z.string().optional().or(z.literal("")),
    // Category fields
    categoryIds: z.string().optional().or(z.literal("")),
    catDiscountPercent: z.coerce.number().min(1).max(100).optional().or(z.literal("")),
    store: z.string().optional()
  });

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

  const promoType = form.watch("promoType");

  const queryClient = useQueryClient();

  const createMutation = useMutation(addDiscount, {
    onSuccess: () => {
      queryClient.invalidateQueries(["discounts"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.discount.add.toast.error"), {
        description:
          err?.response?.data?.message ||
          err.message ||
          t("page.discount.add.toast.errorDescription")
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
    console.log("Selected Stores:", values, selectedStores, allStores, saveAsDraft);
    if (isSuperAdmin && !allStores && selectedStores.length === 0 && !saveAsDraft) {
      form.setError("store", { message: t("page.ingredientCategory.add.storeRequired") });
      return;
    }
    form.clearErrors("store");
    const conditions = buildConditions(values);
    const isAdvanced = values.promoType !== "standard";

    const payload = {
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
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
    };
    createMutation.mutate(payload);
  };

  const handleTypeClick = (e) => {
    e.preventDefault();
    if (isSuperAdmin && !allStores && selectedStores.length === 0) {
      form.setError("store", { message: t("page.ingredientCategory.add.storeRequired") });
      return;
    }
    form.clearErrors("store");
    form.handleSubmit((v) => {
      setPendingValues(v);
      setConfirmModal(true);
    })();
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
            {t("breadcrumb.management")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("breadcrumb.add")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.discount.add.description")}</p>
        </div>

        <Form {...form}>
          <form className="space-y-6">
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
              {promoType === "standard" && (
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
              {promoType === "bogo" && (
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
              {promoType === "bundling" && (
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
              {promoType === "happyHour" && (
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
              {promoType === "category" && (
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
                {promoType === "standard" && (
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
                    disabled={createMutation.isLoading}>
                    {t("page.discount.add.saveAsDraft")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleTypeClick}
                    disabled={createMutation.isLoading}
                    className="gap-2">
                    <Save size={18} />
                    {createMutation.isLoading ? t("button.saving") : t("button.save")}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </Form>

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("page.discount.add.cancelTitle")}
          description={t("page.discount.add.cancelDescription")}
          confirmText={t("page.discount.add.cancelConfirm")}
          onConfirm={() => navigate("/discount-list")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.discount.add.successTitle")}
          description={t("page.discount.add.successDescription")}
          confirmText={t("page.discount.add.successConfirm")}
          onConfirm={() => navigate("/discount-list")}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("page.discount.add.draftTitle")}
          description={t("page.discount.add.draftDescription")}
          confirmText={t("page.discount.add.draftConfirm")}
          onConfirm={() => {
            setDraftModal(false);
            const values = form.getValues();
            onSubmit(values, true);
          }}
        />
        <Modal
          type="confirm"
          open={confirmModal}
          onOpenChange={setConfirmModal}
          title={t("page.discount.add.confirmTitle")}
          description={t("page.discount.add.confirmDescription")}
          confirmText={t("button.save")}
          onConfirm={() => {
            setConfirmModal(false);
            if (pendingValues) onSubmit(pendingValues, false);
          }}
        />
        {createMutation.isLoading && <Loading fullscreen size="lg" label={t("button.saving")} />}
      </div>
    </div>
  );
};

export default AddDiscount;
