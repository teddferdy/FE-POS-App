import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import { format } from "date-fns";
import { addBusinessTrip } from "@/services/business-trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";

const AddBusinessTrip = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const schema = z
    .object({
      employeeName: z.string().optional(),
      employeePosition: z.string().optional(),
      destination: z.string().min(1, t("common.validation")),
      tripPurpose: z.string().optional(),
      departureDate: z.date({ required_error: t("common.validation") }),
      returnDate: z.date({ required_error: t("common.validation") }),
      budget: z.union([z.string(), z.number()]).optional(),
      notes: z.string().optional()
    })
    .refine((d) => !d.departureDate || !d.returnDate || d.returnDate >= d.departureDate, {
      path: ["returnDate"],
      message: t("common.validation")
    });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      employeeName: "",
      employeePosition: "",
      destination: "",
      tripPurpose: "",
      departureDate: new Date(),
      returnDate: null,
      budget: "",
      notes: ""
    }
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    watch,
    trigger
  } = form;

  const departDate = watch("departureDate");

  const doSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await addBusinessTrip({
        employeeName: data.employeeName,
        employeePosition: data.employeePosition,
        destination: data.destination,
        tripPurpose: data.tripPurpose,
        departureDate: data.departureDate ? format(data.departureDate, "yyyy-MM-dd") : null,
        returnDate: data.returnDate ? format(data.returnDate, "yyyy-MM-dd") : null,
        budget: data.budget ? Number(data.budget) : null,
        notes: data.notes
      });
      queryClient.invalidateQueries(["business-trips"]);
      setSuccessModal(true);
    } catch (err) {
      setModalMessage(err?.response?.data?.message || err.message);
      setErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.home"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.home"
            },
            {
              label: t("page.businessTrip.list.title"),
              href: "/business-trip",
              i18nKey: "page.businessTrip.list.title"
            },
            { label: t("page.businessTrip.add.title") }
          ]}
          title={t("page.businessTrip.add.title")}
          onBack={() => setCancelModal(true)}
          dynamicInfo={false}
        />

        <form
          onSubmit={handleSubmit((data) => doSubmit(data))}
          className="bg-card p-4 sm:p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("page.businessTrip.add.form.employee")}</Label>
              <Input
                {...form.register("employeeName")}
                placeholder={t("page.businessTrip.add.form.employee")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("page.businessTrip.add.form.employeePosition")}</Label>
              <Input
                {...form.register("employeePosition")}
                placeholder={t("page.businessTrip.add.form.employeePosition")}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("page.businessTrip.add.form.destination")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                {...form.register("destination")}
                placeholder={t("page.businessTrip.add.form.destination")}
              />
              {errors.destination && (
                <p className="text-xs text-destructive">{errors.destination.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("page.businessTrip.add.form.tripPurpose")}</Label>
              <Input
                {...form.register("tripPurpose")}
                placeholder={t("page.businessTrip.add.form.tripPurpose")}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("page.businessTrip.add.form.departureDate")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="departureDate"
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    placeholder={t("page.businessTrip.add.form.departureDate")}
                  />
                )}
              />
              {errors.departureDate && (
                <p className="text-xs text-destructive">{errors.departureDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                {t("page.businessTrip.add.form.returnDate")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="returnDate"
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    placeholder={t("page.businessTrip.add.form.returnDate")}
                    minDate={departDate || undefined}
                  />
                )}
              />
              {errors.returnDate && (
                <p className="text-xs text-destructive">{errors.returnDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("page.businessTrip.add.form.budget")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                {...form.register("budget", {
                  setValueAs: (v) => (v === "" ? "" : v)
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("page.businessTrip.add.form.notes")}</Label>
              <Input
                {...form.register("notes")}
                placeholder={t("page.businessTrip.add.form.notes")}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="danger"
              className="w-full sm:w-auto justify-center"
              onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.businessTrip.add.form.cancel")}
            </Button>
            <Button
              variant="success"
              type="button"
              className="w-full sm:w-auto justify-center"
              disabled={isSubmitting}
              onClick={async () => {
                const ok = await trigger();
                if (!ok) return;
                setConfirmModal(true);
              }}>
              <Save size={16} className="mr-1" /> {t("page.businessTrip.add.form.save")}
            </Button>
          </div>
        </form>

        {isSubmitting && (
          <Loading fullscreen size="lg" label={t("page.businessTrip.add.form.save")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={(o) => !o && setCancelModal(false)}
          title={t("page.businessTrip.add.form.cancel")}
          description={t("page.businessTrip.add.form.cancel")}
          confirmText={t("common.yes")}
          onConfirm={() => {
            setCancelModal(false);
            setTimeout(() => navigate("/business-trip"), 150);
          }}
        />
        <Modal
          type="confirm"
          open={confirmModal}
          onOpenChange={setConfirmModal}
          title={t("page.businessTrip.add.title")}
          description={t("page.businessTrip.add.title")}
          confirmText={t("common.confirm")}
          onConfirm={() => {
            setConfirmModal(false);
            doSubmit(getValues());
          }}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.businessTrip.add.title")}
          description={t("common.success")}
          onConfirm={() => setTimeout(() => navigate("/business-trip"), 150)}
        />
        <Modal
          type="error"
          open={errorModal}
          onOpenChange={setErrorModal}
          title={t("common.error")}
          description={modalMessage}
          onConfirm={() => setErrorModal(false)}
        />
      </div>
    </>
  );
};

export default AddBusinessTrip;
