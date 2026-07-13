import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { getIngredientById, editIngredient } from "@/services/ingredient";
import { getAllSupplier } from "@/services/supplier";
import { getAllIngredientCategory } from "@/services/ingredientCategory";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import PageHeader from "@/components/ui/PageHeader";

const conversionHints = {
  kg: { base: "gram", factor: 1000 },
  liter: { base: "ml", factor: 1000 },
  meter: { base: "cm", factor: 100 },
  lusin: { base: "pcs", factor: 12 },
  karton: { base: "pcs", factor: 50 },
  box: { base: "pcs", factor: 10 },
  pack: { base: "pcs", factor: 5 }
};

const EditIngredient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const store = user?.store || "";
  const role = user?.roleType || "";
  const isSuperAdmin = role === "super_admin";
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const unitOptions = [
    { value: "pcs", label: t("page.ingredient.form.unitPcs") },
    { value: "buah", label: t("page.ingredient.form.unitBuah") },
    { value: "kg", label: t("page.ingredient.form.unitKg") },
    { value: "gram", label: t("page.ingredient.form.unitGram") },
    { value: "liter", label: t("page.ingredient.form.unitLiter") },
    { value: "ml", label: t("page.ingredient.form.unitMl") },
    { value: "meter", label: t("page.ingredient.form.unitMeter") },
    { value: "cm", label: t("page.ingredient.form.unitCm") },
    { value: "lusin", label: t("page.ingredient.form.unitLusin") },
    { value: "pack", label: t("page.ingredient.form.unitPack") },
    { value: "box", label: t("page.ingredient.form.unitBox") },
    { value: "karton", label: t("page.ingredient.form.unitKarton") }
  ];

  const baseUnitOptions = [
    { value: "pcs", label: t("page.ingredient.form.unitPcs") },
    { value: "gram", label: t("page.ingredient.form.unitGram") },
    { value: "ml", label: t("page.ingredient.form.unitMl") },
    { value: "cm", label: t("page.ingredient.form.unitCm") },
    { value: "buah", label: t("page.ingredient.form.unitBuah") },
    { value: "lembar", label: t("page.ingredient.form.unitLembar") }
  ];

  const formSchema = z.object({
    name: z.string().min(1, t("page.ingredient.form.nameRequired")),
    supplier: z.string().nullable(),
    category: z.string().nullable(),
    unit: z.string(),
    baseUnit: z.string(),
    conversionFactor: z.coerce.string(),
    stock: z.number(),
    minStock: z.number(),
    costPrice: z.number(),
    isActive: z.boolean(),
    store: z.string().nullable()
  });

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery(
    ["suppliers-dropdown", store],
    () => getAllSupplier({ limit: 999, store: store || undefined })
  );
  const suppliers = suppliersData?.data || [];

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    ["ingredient-categories-dropdown"],
    () => getAllIngredientCategory()
  );
  const categories = categoriesData?.data || [];

  const { data: locationsData, isLoading: locationsLoading } = useQuery(
    ["allLocations"],
    () => getAllLocation(),
    {
      enabled: isSuperAdmin
    }
  );
  const locations = locationsData?.data || locationsData?.locations || [];

  const dropdownsLoading =
    suppliersLoading || categoriesLoading || (isSuperAdmin && locationsLoading);

  const {
    data,
    isLoading: loadingData,
    isError,
    refetch
  } = useQuery(["ingredient", id], () => getIngredientById(id), { enabled: !!id });

  if (isError) return <AbortController refetch={refetch} />;

  if (dropdownsLoading || loadingData)
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div>
          <PageHeader
            breadcrumbs={[
              {
                label: t("page.ingredient.edit.breadcrumbDashboard"),
                href: "/dashboard-super-admin",
                i18nKey: "page.ingredient.edit.breadcrumbDashboard"
              },
              {
                label: t("page.ingredient.edit.breadcrumbIngredient"),
                href: "/ingredient",
                i18nKey: "page.ingredient.edit.breadcrumbIngredient"
              },
              {
                label: t("page.ingredient.edit.breadcrumbEdit"),
                i18nKey: "page.ingredient.edit.breadcrumbEdit"
              }
            ]}
            title={t("page.ingredient.edit.title")}
            description={t("page.ingredient.edit.loading")}
            backLink="/ingredient"
          />
        </div>

        <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
          <Form {...form}>
            <form>
              {isSuperAdmin && (
                <div className="mb-6">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <div>
                    <Skeleton className="h-5 w-32 mb-6" />
                    <div className="space-y-6">
                      <Skeleton className="h-10 w-full" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-6" />
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-6" />
                    <div className="space-y-4">
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );

  return (
    <div>
      <div>
        <PageHeader
          breadcrumbs={[
            {
              label: t("page.ingredient.edit.breadcrumbDashboard"),
              href: "/dashboard-super-admin",
              i18nKey: "page.ingredient.edit.breadcrumbDashboard"
            },
            {
              label: t("page.ingredient.edit.breadcrumbIngredient"),
              href: "/ingredient",
              i18nKey: "page.ingredient.edit.breadcrumbIngredient"
            },
            {
              label: t("page.ingredient.edit.breadcrumbEdit"),
              i18nKey: "page.ingredient.edit.breadcrumbEdit"
            }
          ]}
          title={t("page.ingredient.edit.title")}
          description={form.watch("name")}
          backLink="/ingredient"
        />

        {dropdownsLoading || loadingData ? (
          <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden space-y-6">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : (
          <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
          <Form {...form}>
            <form onSubmit={handleSubmit}>
              {isSuperAdmin && (
                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem className="mb-6 bg-card rounded-xl p-4 border border-border shadow-sm">
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Toko <span className="text-destructive">*</span>
                      </FormLabel>
                      <Combobox
                        options={locations.map((l) => ({ value: String(l.id), label: l.name }))}
                        value={field.value || ""}
                        onChange={(v) => field.onChange(v || null)}
                        placeholder={t("page.ingredient.edit.selectStorePlaceholder")}
                        searchPlaceholder="Cari toko..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-semibold text-foreground mb-6">
                      {t("page.ingredient.add.sectionInformasi")}
                    </h3>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.ingredient.form.nameLabel")}{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              placeholder={t("page.ingredient.form.namePlaceholder")}
                              className="h-12"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredient.form.categoryLabel")}
                              </FormLabel>
                              <Combobox
                                options={categories
                                  .filter((c) => c.status === "active")
                                  .map((c) => ({ value: String(c.id), label: c.name }))}
                                value={field.value || ""}
                                onChange={(v) => field.onChange(v || null)}
                                placeholder={t("page.ingredient.form.categoryPlaceholder")}
                                searchPlaceholder={t(
                                  "page.ingredient.form.categorySearchPlaceholder"
                                )}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="supplier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredient.form.supplierLabel")}
                              </FormLabel>
                              <Combobox
                                options={suppliers
                                  .filter((s) => s.status === "active")
                                  .map((s) => ({ value: String(s.id), label: s.name }))}
                                value={field.value || ""}
                                onChange={(v) => field.onChange(v || null)}
                                placeholder={t("page.ingredient.form.supplierPlaceholder")}
                                searchPlaceholder={t(
                                  "page.ingredient.form.supplierSearchPlaceholder"
                                )}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-semibold text-foreground mb-6">
                      {t("page.ingredient.form.sectionKonversi")}
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredient.form.unitLabel")}
                              </FormLabel>
                              <select
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm">
                                {unitOptions.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="baseUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredient.form.baseUnitLabel")}
                              </FormLabel>
                              <select
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm">
                                {baseUnitOptions.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="conversionFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredient.form.conversionLabel")}
                              </FormLabel>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0
                                  )
                                }
                                placeholder={t("page.ingredient.form.conversionPlaceholder")}
                                className="h-12"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <p className="text-sm text-muted-foreground">
                          1 <span className="font-semibold text-foreground">{watchUnit}</span> ={" "}
                          {watchConversionFactor}{" "}
                          <span className="font-semibold text-foreground">{watchBaseUnit}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{convLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-semibold text-foreground mb-6">
                      {t("page.ingredient.form.sectionStok")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.ingredient.form.stockLabel")}
                            </FormLabel>
                            <Input
                              type="text"
                              inputMode="numeric"
                              className="h-12"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              {t("page.ingredient.form.stockDesc")}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.ingredient.form.minStockLabel")}
                            </FormLabel>
                            <Input
                              type="text"
                              inputMode="numeric"
                              className="h-12"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              {t("page.ingredient.form.minStockDesc")}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {t("page.ingredient.form.priceLabel")}
                            </FormLabel>
                            <Input
                              type="text"
                              inputMode="numeric"
                              className="h-12"
                              value={field.value ? field.value.toLocaleString("id-ID") : "0"}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h3 className="text-base font-semibold text-foreground mb-6">
                      {t("page.ingredient.form.sectionStatus")}
                    </h3>
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
                            }`}
                            onClick={(e) => {
                              if (!e.isTrusted) return;
                              field.onChange(!field.value);
                            }}>
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
                                    ? t("page.ingredient.form.statusActive")
                                    : t("page.ingredient.form.statusInactive")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {field.value
                                    ? t("page.ingredient.form.statusActiveDesc")
                                    : t("page.ingredient.form.statusInactiveDesc")}
                                </p>
                              </div>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-base">info</span>
                      <span className="text-sm font-semibold text-primary">
                        {t("page.ingredient.form.tipsTitle")}
                      </span>
                    </div>
                    <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        {t("page.ingredient.form.tipsText1")}{" "}
                        <span className="text-foreground font-medium">
                          &quot;{t("page.ingredient.form.tipsExample")}&quot;
                        </span>{" "}
                        {t("page.ingredient.form.tipsText2")}
                      </p>
                      <p>{t("page.ingredient.form.tipsText3")}</p>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-base">
                        swap_horiz
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {t("page.ingredient.form.sidebarKonversi")}
                      </span>
                    </div>
                    <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        <span className="text-foreground font-medium">
                          {t("page.ingredient.form.sidebarUnitPembelian")}
                        </span>{" "}
                        {t("page.ingredient.form.sidebarUnitPembelianDesc")}
                      </p>
                      <p>
                        <span className="text-foreground font-medium">
                          {t("page.ingredient.form.sidebarBaseUnit")}
                        </span>{" "}
                        {t("page.ingredient.form.sidebarBaseUnitDesc")}
                      </p>
                      <p>
                        <span className="text-foreground font-medium">
                          {t("page.ingredient.form.sidebarFaktor")}
                        </span>{" "}
                        {t("page.ingredient.form.sidebarFaktorDesc")}
                      </p>
                      <div className="bg-background rounded-lg p-3 border border-border mt-2">
                        <p className="text-foreground font-medium mb-1">
                          {t("page.ingredient.form.sidebarContoh")}
                        </p>
                        <p>
                          {t("page.ingredient.form.sidebarContohKg")}{" "}
                          <span className="text-muted-foreground">
                            ({t("page.ingredient.form.sidebarContohFaktor")}: 1000)
                          </span>
                        </p>
                        <p>
                          {t("page.ingredient.form.sidebarContohLusin")}{" "}
                          <span className="text-muted-foreground">
                            ({t("page.ingredient.form.sidebarContohFaktor")}: 12)
                          </span>
                        </p>
                        <p>
                          {t("page.ingredient.form.sidebarContohKarton")}{" "}
                          <span className="text-muted-foreground">
                            ({t("page.ingredient.form.sidebarContohFaktor")}: 50)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-base">
                        inventory_2
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {t("page.ingredient.form.sidebarManajemenStok")}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        {t("page.ingredient.form.sidebarStokDesc")}{" "}
                        <span className="text-foreground font-medium">
                          {t("page.ingredient.form.minStockLabel")}
                        </span>{" "}
                        {t("page.ingredient.form.sidebarStokDesc2")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
                  <X size={16} className="mr-1" /> {t("page.ingredient.form.cancelButton")}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftModal(true)}
                    disabled={mutation.isLoading}>
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (isSuperAdmin && !form.getValues("store")) {
                        form.setError("store", {
                          message: t("page.ingredientCategory.add.storeRequired")
                        });
                        return;
                      }
                      form.clearErrors("store");
                      handleSubmit();
                    }}
                    disabled={mutation.isLoading}>
                    <Save size={16} className="mr-1" />{" "}
                    {mutation.isLoading
                      ? t("page.ingredient.form.savingButton")
                      : t("page.ingredient.form.saveButton")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
        )}

        {mutation.isLoading && (
          <Loading fullscreen size="lg" label={t("page.ingredient.form.savingButton")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={(o) => !o && setCancelModal(false)}
          title={t("page.ingredient.edit.modalCancelTitle")}
          description={t("page.ingredient.edit.modalCancelDesc")}
          confirmText={t("page.ingredient.edit.modalCancelConfirm")}
          onConfirm={() => {
            setCancelModal(false);
            navigate("/ingredient");
          }}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("common.saveAsDraftTitle")}
          description={t("common.saveAsDraftDesc")}
          confirmText={t("common.yesSaveDraft")}
          onConfirm={() => {
            setDraftModal(false);
            const values = form.getValues();
            onSubmit(values, true);
          }}
        />
        <Modal type="confirm" {...confirmModal()} />
      </div>
    </div>
  );
};

export default EditIngredient;
