import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "react-i18next";
import { getAllShift, editShift } from "@/services/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import AbortController from "@/components/organism/abort-controller";

const EditShift = () => {
  const { t } = useTranslation();
  const formSchema = z.object({
    nama_shift: z.string().min(1, t("page.shift.edit.validation.namaShift")),
    jam_mulai: z.string().min(1, t("page.shift.edit.validation.jamMulai")),
    jam_selesai: z.string().min(1, t("page.shift.edit.validation.jamSelesai")),
    status: z.boolean().default(true)
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shiftId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const {
    data: shiftsData,
    isLoading,
    isError,
    refetch
  } = useQuery(["shifts"], () => getAllShift({ store: "", page: 1, limit: 100, statusShift: "" }), {
    enabled: !!shiftId
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_shift: "",
      jam_mulai: "",
      jam_selesai: "",
      status: true
    }
  });

  const shifts = shiftsData?.data || [];
  const shift = shifts.find((item) => item.id === shiftId || item._id === shiftId) || {};

  useEffect(() => {
    if (shift?.id || shift?._id) {
      form.reset({
        nama_shift: shift.nama_shift || "",
        jam_mulai: shift.jam_mulai || "",
        jam_selesai: shift.jam_selesai || "",
        status:
          shift.status === "Aktif" ||
          shift.status === 1 ||
          shift.status === true ||
          shift.status === "active"
      });
    }
  }, [shift, form]);

  const updateMutation = useMutation(editShift, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.shift.edit.toast.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.shift.edit.toast.errorDesc")
      });
    }
  });

  const handleSave = (values, saveAsDraft = false) => {
    const { status, ...rest } = values;
    updateMutation.mutate({
      id: shiftId,
      ...rest,
      status: saveAsDraft ? "draft" : status ? "active" : "inactive"
    });
  };

  const onSubmit = (values) => handleSave(values, false);
  const { handleSubmit, confirmModal } = useConfirmSubmit(form, onSubmit);

  if (isError) return <AbortController refetch={refetch} />;
  if (!shiftId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.shift.edit.noId")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-32" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            {
              label: t("page.shift.edit.breadcrumb.dashboard"),
              href: "/dashboard-super-admin",
              i18nKey: "page.shift.edit.breadcrumb.dashboard"
            },
            {
              label: t("page.shift.edit.breadcrumb.list"),
              href: "/shift",
              i18nKey: "page.shift.edit.breadcrumb.list"
            },
            {
              label: t("page.shift.edit.breadcrumb.edit"),
              i18nKey: "page.shift.edit.breadcrumb.edit"
            }
          ]}
          title={t("page.shift.edit.title")}
          description={t("page.shift.edit.subtitle")}
          backLink="/shift"></PageHeader>

        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
              <X size={18} />
              {t("page.shift.edit.cancel")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraftModal(true)}
              disabled={updateMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {t("page.shift.edit.saveDraft")}
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={updateMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {updateMutation.isLoading ? t("page.shift.edit.saving") : t("page.shift.edit.save")}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nama_shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.shift.edit.form.namaShift")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        placeholder={t("page.shift.edit.form.namaShiftPlaceholder")}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div />
                <FormField
                  control={form.control}
                  name="jam_mulai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.shift.edit.form.jamMulai")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <TimePicker
                        {...field}
                        placeholder={t("page.shift.edit.form.jamMulaiPlaceholder")}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jam_selesai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.shift.edit.form.jamSelesai")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <TimePicker
                        {...field}
                        placeholder={t("page.shift.edit.form.jamSelesaiPlaceholder")}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("page.shift.edit.form.status")}</FormLabel>
                    <div className={`pt-2 flex items-center justify-between p-4 rounded-lg ${
                      field.value
                        ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            field.value
                              ? "bg-green-600 text-secondary"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                          {field.value ? (
                            <Check size={20} />
                          ) : (
                            <span className="text-lg font-bold">⏻</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {field.value
                              ? t("page.shift.edit.form.active")
                              : t("page.shift.edit.form.inactive")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.value
                              ? t("page.shift.edit.form.active")
                              : t("page.shift.edit.form.inactive")}
                          </p>
                        </div>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <Modal type="confirm" {...confirmModal()} />
        </Card>

        {updateMutation.isLoading && (
          <Loading fullscreen size="lg" label={t("page.shift.edit.saving")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("page.shift.edit.modal.cancelTitle")}
          description={t("page.shift.edit.modal.cancelDesc")}
          confirmText={t("page.shift.edit.modal.cancelConfirm")}
          onConfirm={() => navigate("/shift")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.shift.edit.modal.successTitle")}
          description={t("page.shift.edit.modal.successDesc")}
          confirmText={t("page.shift.edit.modal.successConfirm")}
          onConfirm={() => navigate("/shift")}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("page.shift.edit.modal.draftTitle")}
          description={t("page.shift.edit.modal.draftDesc")}
          confirmText={t("page.shift.edit.modal.draftConfirm")}
          onConfirm={() => {
            setDraftModal(false);
            const values = form.getValues();
            handleSave(values, true);
          }}
        />
      </div>
    </div>
  );
};

export default EditShift;
