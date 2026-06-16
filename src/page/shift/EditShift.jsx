import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAllShift, editShift } from "@/services/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const EditShift = () => {
  const { t } = useTranslation();
  const formSchema = z.object({
    nama_shift: z.string().min(1, t("page.shift.edit.validation.namaShift")),
    jam_mulai: z.string().min(1, t("page.shift.edit.validation.jamMulai")),
    jam_selesai: z.string().min(1, t("page.shift.edit.validation.jamSelesai")),
    deskripsi: z.string().optional().or(z.literal("")),
    status: z.boolean().default(true)
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shiftId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { data: shiftsData, isLoading } = useQuery(
    ["shifts"],
    () => getAllShift({ store: "", page: 1, limit: 100, statusShift: "" }),
    { enabled: !!shiftId }
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_shift: "",
      jam_mulai: "",
      jam_selesai: "",
      deskripsi: "",
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
        deskripsi: shift.deskripsi || "",
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
        description: err?.response?.data?.message || err.message || t("page.shift.edit.toast.errorDesc")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { status, ...rest } = values;
    updateMutation.mutate({
      id: shiftId,
      ...rest,
      status: saveAsDraft ? "draft" : status ? "active" : "inactive"
    });
  };

  if (!shiftId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.shift.edit.noId")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Loading fullscreen size="lg" label={t("page.shift.edit.loading")} />
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("page.shift.edit.breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/shift")}
          className="hover:text-foreground transition-colors">
          {t("page.shift.edit.breadcrumb.list")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.shift.edit.breadcrumb.edit")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.shift.edit.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.shift.edit.subtitle")}</p>
        </div>
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
            onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
            disabled={updateMutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {updateMutation.isLoading ? t("page.shift.edit.saving") : t("page.shift.edit.save")}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nama_shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("page.shift.edit.form.namaShift")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder={t("page.shift.edit.form.namaShiftPlaceholder")} {...field} />
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
                      {t("page.shift.edit.form.jamMulai")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <TimePicker {...field} placeholder={t("page.shift.edit.form.jamMulaiPlaceholder")} />
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
                      {t("page.shift.edit.form.jamSelesai")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <TimePicker {...field} placeholder={t("page.shift.edit.form.jamSelesaiPlaceholder")} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("page.shift.edit.form.deskripsi")}</FormLabel>
                  <Textarea placeholder={t("page.shift.edit.form.deskripsiPlaceholder")} rows={3} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("page.shift.edit.form.status")}</FormLabel>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? t("page.shift.edit.form.active") : t("page.shift.edit.form.inactive")}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>

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
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default EditShift;
