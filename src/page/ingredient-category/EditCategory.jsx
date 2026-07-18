import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Save, X, Check } from "lucide-react";
import { getIngredientCategoryById, editIngredientCategory } from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import AbortController from "@/components/organism/abort-controller";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";

const EditCategory = () => {
  const { t } = useTranslation();
  const formSchema = z.object({
    name: z.string().min(1, t("page.ingredientCategory.validation.nameRequired")),
    isActive: z.boolean()
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const categoryFieldLabels = {
    name: "Nama Kategori",
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { name: "", isActive: true }
  });

  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);
  const [confirmSaveModal, setConfirmSaveModal] = useState(false);

  const {
    isLoading: loadingData,
    isError,
    refetch
  } = useQuery(["ingredient-category", id], () => getIngredientCategoryById(id), {
    enabled: !!id,
    onSuccess: (res) => {
      const d = res.data;
      form.reset({
        name: d.name || "",
        isActive: d.status !== "inactive"
      });
    },
    onError: () => {
      toast.error(t("page.ingredientCategory.add.toastError"), {
        description: t("page.ingredientCategory.add.toastErrorDesc")
      });
      navigate("/ingredient-category");
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

  const onSubmit = (values, saveAsDraft = false) => {
    const payload = {
      name: values.name.trim(),
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive",
      id
    };
    editMutation.mutate(payload);
  };

  if (isError) return <AbortController refetch={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("page.ingredientCategory.add.breadcrumbSettings") },
          {
            label: t("page.ingredientCategory.add.breadcrumbCategory"),
            href: "/ingredient-category"
          },
          { label: t("page.ingredientCategory.add.breadcrumbEdit") }
        ]}
        title={t("page.ingredientCategory.add.titleEdit")}
        description={t("page.ingredientCategory.add.subtitleEdit")}
        backLink="/ingredient-category">
        <UserGuide guideKey="edit-ingredient-category" />
      </PageHeader>

      <Form {...form} className="p-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
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
                        <div className={`pt-2 flex items-center justify-between p-4 rounded-lg ${
                          form.watch("isActive")
                            ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                form.watch("isActive")
                                  ? "bg-green-600 text-secondary"
                                  : "bg-destructive/10 text-destructive"
                              }`}>
                              {form.watch("isActive") ? (
                                <Check size={20} />
                              ) : (
                                <span className="text-lg font-bold">⏻</span>
                              )}
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
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
            <Button type="button" variant="outline" onClick={() => setShowCancel(true)}>
              <X size={16} className="mr-1" />
              {t("page.ingredientCategory.add.cancelButton")}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftModal(true)}
                disabled={editMutation.isLoading}>
                {t("common.saveAsDraft")}
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const values = form.getValues();
                  const missing = getMissingFields(values, formSchema, categoryFieldLabels);
                  if (missing.length > 0) {
                    setMissingFieldsList(missing);
                    setMissingFieldsModal(true);
                    return;
                  }
                  setConfirmSaveModal(true);
                }}
                disabled={editMutation.isLoading}>
                <Save size={16} className="mr-1" />
                {editMutation.isLoading
                  ? t("page.ingredientCategory.add.savingButton")
                  : t("page.ingredientCategory.add.saveChangesButton")}
              </Button>
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
                <span className="text-foreground font-medium">
                  {t("page.ingredientCategory.add.tip1b")}
                </span>{" "}
                {t("page.ingredientCategory.add.tip1c")}{" "}
                <span className="text-foreground font-medium">
                  {t("page.ingredientCategory.add.tip1d")}
                </span>{" "}
                {t("page.ingredientCategory.add.tip1e")}{" "}
                <span className="text-foreground font-medium">
                  {t("page.ingredientCategory.add.tip1f")}
                </span>
                .
              </p>
              <p>
                {t("page.ingredientCategory.add.tip2a")}{" "}
                <span className="text-foreground font-medium">
                  {t("page.ingredientCategory.add.tip2b")}
                </span>{" "}
                {t("page.ingredientCategory.add.tip2c")}
              </p>
              <p>
                {t("page.ingredientCategory.add.tip3a")}{" "}
                <span className="text-foreground font-medium">
                  {t("page.ingredientCategory.add.tip3b")}
                </span>{" "}
                {t("page.ingredientCategory.add.tip3c")}
              </p>
            </div>
          </div>
        </form>
      </Form>

      {loadingData && (
        <Loading fullscreen size="lg" label={t("page.ingredientCategory.add.loadingLabel")} />
      )}

      <Modal
        type="success"
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title={t("page.ingredientCategory.add.modalSuccessTitleEdit")}
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
      <Modal
        type="confirm"
        open={confirmSaveModal}
        onOpenChange={setConfirmSaveModal}
        title="Konfirmasi Simpan"
        description="Apakah Anda yakin ingin menyimpan data ini?"
        confirmText="Ya, Simpan"
        onConfirm={() => {
          setConfirmSaveModal(false);
          const values = form.getValues();
          onSubmit(values);
        }}
      />
      <MissingFieldsModal
        open={missingFieldsModal}
        onOpenChange={setMissingFieldsModal}
        fields={missingFieldsList}
      />
    </div>
  );
};

export default EditCategory;
