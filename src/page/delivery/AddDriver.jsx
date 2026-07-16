import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, FileEdit, Info, X } from "lucide-react";
import { toast } from "sonner";
import { createDriver } from "@/services/delivery";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";

const DriverList = React.lazy(() => import("./DriverList"));

const AddDriver = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t("page.delivery.driver.validation.nameRequired")),
    phone: z.string().min(1, t("page.delivery.driver.validation.phoneRequired")),
    email: z.string().email().optional().or(z.literal("")),
    vehicleType: z.string().min(1, t("page.delivery.driver.validation.vehicleTypeRequired")),
    vehiclePlate: z.string().min(1, t("page.delivery.driver.validation.vehiclePlateRequired")),
    status: z.string().default("active"),
    notes: z.string().optional()
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      vehicleType: "",
      vehiclePlate: "",
      status: "active",
      notes: ""
    }
  });

  const createMutation = useMutation(createDriver, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.delivery.driver.toast.addSuccess")
      });
      queryClient.invalidateQueries(["drivers"]);
      navigate("/driver-list");
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          {
            href: "/driver-list",
            i18nKey: "sidebar.driver"
          },
          { i18nKey: "page.delivery.driver.add.title" }
        ]}
        title={t("page.delivery.driver.add.title")}
        description={t("page.delivery.driver.add.description")}>
        <Button variant="outline" onClick={() => setCancelModalOpen(true)}>
          {t("common.cancel")}
        </Button>
      </PageHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.delivery.driver.detail.name")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.delivery.driver.form.name")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...form.register("name")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder={t("page.delivery.driver.form.namePlaceholder")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.delivery.driver.form.phone")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...form.register("phone")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder={t("page.delivery.driver.form.phonePlaceholder")}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.delivery.driver.form.email")}</label>
                <input
                  {...form.register("email")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder={t("page.delivery.driver.form.emailPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.delivery.driver.form.status")}</label>
                <select
                  {...form.register("status")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                  <option value="active">{t("page.delivery.driver.status.active")}</option>
                  <option value="inactive">{t("page.delivery.driver.status.inactive")}</option>
                  <option value="draft">{t("page.delivery.driver.status.draft")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.delivery.driver.detail.vehicleType")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.delivery.driver.form.vehicleType")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...form.register("vehicleType")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder={t("page.delivery.driver.form.vehicleTypePlaceholder")}
                />
                {form.formState.errors.vehicleType && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.vehicleType.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.delivery.driver.form.vehiclePlate")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...form.register("vehiclePlate")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder={t("page.delivery.driver.form.vehiclePlatePlaceholder")}
                />
                {form.formState.errors.vehiclePlate && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.vehiclePlate.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">{t("page.delivery.driver.form.notes")}</label>
                <textarea
                  {...form.register("notes")}
                  className="mt-1 w-full h-20 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
                  placeholder={t("page.delivery.driver.form.notesPlaceholder")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{t("page.delivery.driver.form.tipsTitle")}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{t("page.delivery.driver.form.tipsContent")}</p>
          </div>
        </div>
      </form>

      <div className="flex justify-between items-center gap-4 bg-card border border-border rounded-xl p-4">
        <Button variant="outline" onClick={() => setCancelModalOpen(true)} className="gap-2">
          <X size={18} />
          {t("common.cancel")}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              form.setValue("status", "draft");
              form.handleSubmit(onSubmit)();
            }}
            disabled={createMutation?.isLoading}
            className="gap-2">
            <FileEdit size={18} />
            {t("common.saveDraft")}
          </Button>
          <Button
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={createMutation?.isLoading}
            className="gap-2">
            <Save size={18} />
            {createMutation?.isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>

      <Modal
        type="confirm"
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title={t("page.delivery.driver.modal.cancelTitle")}
        description={t("page.delivery.driver.modal.cancelDescription")}
        confirmText={t("page.delivery.driver.modal.confirmCancel")}
        onConfirm={() => navigate("/driver-list")}
      />
    </div>
  );
};

export default AddDriver;
