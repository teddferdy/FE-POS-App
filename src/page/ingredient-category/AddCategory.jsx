import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { Save, X, Store, Plus } from "lucide-react";
import {
  addIngredientCategory,
  getIngredientCategoryById,
  editIngredientCategory
} from "@/services/ingredientCategory";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";

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

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  isActive: z.boolean()
});

const AddCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const role = user?.roleType || "";
  const isSuperAdmin = role === "super_admin";

  const { data: locationsData } = useQuery(["allLocations"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", isActive: true }
  });

  const { isLoading: loadingData } = useQuery(
    ["ingredient-category", editId],
    () => getIngredientCategoryById(editId),
    {
      enabled: isEdit,
      onSuccess: (res) => {
        const d = res.data;
        form.reset({
          name: d.name || "",
          isActive: d.status !== "inactive"
        });
        setSelectedStore(d.store || null);
      },
      onError: () => {
        toast.error(t("page.ingredientCategory.add.toastError"), {
          description: t("page.ingredientCategory.add.toastErrorDesc")
        });
        navigate("/ingredient-category");
      }
    }
  );

  const createMutation = useMutation(addIngredientCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredient-categories"]);
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error(t("page.ingredientCategory.add.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const editMutation = useMutation(editIngredientCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredient-categories"]);
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error(t("page.ingredientCategory.add.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const onSubmit = (values) => {
    if (isSuperAdmin && !selectedStore) {
      toast.error(t("page.ingredientCategory.add.storeRequired"));
      return;
    }
    const payload = {
      name: values.name.trim(),
      status: values.isActive,
      store: selectedStore
    };
    if (isEdit) {
      editMutation.mutate({ ...payload, id: editId });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isLoading || editMutation.isLoading;

  return (
    <div className="space-y-6">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <PageHeader
            breadcrumbs={[
              { label: t("page.ingredientCategory.add.breadcrumbSettings") },
              { label: t("page.ingredientCategory.add.breadcrumbCategory"), href: "/ingredient-category" },
              { label: isEdit ? t("page.ingredientCategory.add.breadcrumbEdit") : t("page.ingredientCategory.add.breadcrumbAdd") }
            ]}
            title={isEdit ? t("page.ingredientCategory.add.titleEdit") : t("page.ingredientCategory.add.titleAdd")}
            description={isEdit ? t("page.ingredientCategory.add.subtitleEdit") : t("page.ingredientCategory.add.subtitleAdd")}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <div className="bg-card rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12">
                    {isSuperAdmin && (
                      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Store size={20} className="text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {t("page.ingredientCategory.add.storeSection.title")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("page.ingredientCategory.add.storeSection.desc")}
                            </p>
                          </div>
                        </div>
                        {locations.length === 0 ? (
                          <div className="flex items-center gap-3 pl-9">
                            <p className="text-sm text-muted-foreground">
                              {t("page.ingredientCategory.add.storeSection.noStore")}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => navigate("/add-location")}
                              className="gap-1.5 shrink-0">
                              <Plus size={16} />
                              {t("page.ingredientCategory.add.storeSection.addStore")}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 pl-9">
                            {locations.map((loc) => {
                              const isChecked = selectedStore === loc.id;
                              return (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => setSelectedStore(isChecked ? null : loc.id)}
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                    isChecked
                                      ? "bg-primary/10 border-primary text-primary"
                                      : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                  }`}>
                                  {loc.name}
                                  {isChecked && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {!isSuperAdmin && (selectedStore || user?.store) && (
                      <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Store size={16} className="shrink-0" />
                        <span>
                          {t("page.ingredientCategory.add.storeInfo")}{" "}
                          <strong className="text-foreground">
                            {user?.storeName || `Toko #${selectedStore || user?.store || ""}`}
                          </strong>
                        </span>
                      </div>
                    )}

                    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                      <h3 className="text-base font-semibold text-foreground mb-6">
                        {t("page.ingredientCategory.add.namaKategori")}
                      </h3>
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredientCategory.add.namaKategori")}{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Input
                                {...field}
                                placeholder={t("page.ingredientCategory.add.placeholderNama")}
                                className="h-12"
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
                              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("page.ingredientCategory.add.status")}
                              </FormLabel>
                              <div
                                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                                  form.watch("isActive")
                                    ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                                }`}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      form.watch("isActive")
                                        ? "bg-green-600 text-white"
                                        : "bg-destructive/10 text-destructive"
                                    }`}>
                                    <span className="material-symbols-outlined text-lg">
                                      {form.watch("isActive") ? "check" : "close"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {form.watch("isActive")
                                        ? t("page.ingredientCategory.add.active")
                                        : t("page.ingredientCategory.add.inactive")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {form.watch("isActive")
                                        ? t("page.ingredientCategory.add.statusActiveDesc")
                                        : t("page.ingredientCategory.add.statusInactiveDesc")}
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

                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-base">info</span>
                        <span className="text-sm font-semibold text-primary">
                          {t("page.ingredientCategory.add.tipsPenamaan")}
                        </span>
                      </div>
                      <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <p>
                          {t("page.ingredientCategory.add.tip1a")}{" "}
                          <span className="text-foreground font-medium">{t("page.ingredientCategory.add.tip1b")}</span>{" "}
                          {t("page.ingredientCategory.add.tip1c")}{" "}
                          <span className="text-foreground font-medium">{t("page.ingredientCategory.add.tip1d")}</span>{" "}
                          {t("page.ingredientCategory.add.tip1e")}{" "}
                          <span className="text-foreground font-medium">{t("page.ingredientCategory.add.tip1f")}</span>.
                        </p>
                        <p>
                          {t("page.ingredientCategory.add.tip2a")}{" "}
                          <span className="text-foreground font-medium">{t("page.ingredientCategory.add.tip2b")}</span>{" "}
                          {t("page.ingredientCategory.add.tip2c")}
                        </p>
                        <p>
                          {t("page.ingredientCategory.add.tip3a")}{" "}
                          <span className="text-foreground font-medium">{t("page.ingredientCategory.add.tip3b")}</span>{" "}
                          {t("page.ingredientCategory.add.tip3c")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                  <Button type="button" variant="outline" onClick={() => setShowCancel(true)}>
                    <X size={16} className="mr-1" />
                    {t("page.ingredientCategory.add.cancelButton")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save size={16} className="mr-1" />
                    {isSubmitting
                      ? t("page.ingredientCategory.add.savingButton")
                      : isEdit
                        ? t("page.ingredientCategory.add.saveChangesButton")
                        : t("page.ingredientCategory.add.saveButton")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </motion.div>

      {(isSubmitting || loadingData) && (
        <Loading fullscreen size="lg" label={t("page.ingredientCategory.add.loadingLabel")} />
      )}

      <Modal
        type="success"
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title={isEdit ? t("page.ingredientCategory.add.modalSuccessTitleEdit") : t("page.ingredientCategory.add.modalSuccessTitleAdd")}
        onConfirm={() => {
          queryClient.invalidateQueries(["ingredient-categories"]);
          navigate("/ingredient-category");
        }}
      />
      <Modal
        type="confirm"
        open={showCancel}
        onOpenChange={setShowCancel}
        title={t("page.ingredientCategory.add.cancelModalTitle")}
        description={t("page.ingredientCategory.add.cancelModalDesc")}
        confirmText={t("page.ingredientCategory.add.cancelModalConfirm")}
        onConfirm={() => navigate("/ingredient-category")}
      />
    </div>
  );
};

export default AddCategory;
