import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { getBusinessTripById, editBusinessTrip } from "@/services/business-trip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const EditBusinessTrip = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = new URLSearchParams(window.location.search).get("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const { data, isLoading } = useQuery(["business-trip-edit", id], () => getBusinessTripById(id), {
    enabled: !!id
  });
  const trip = data?.data;

  const schema = z
    .object({
      employeeName: z.string().optional(),
      employeePosition: z.string().optional(),
      destination: z.string().min(1, t("common.validation")),
      tripPurpose: z.string().optional(),
      departureDate: z.date().optional(),
      returnDate: z.date().optional(),
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
    values: trip
      ? {
          employeeName: trip.employeeName || "",
          employeePosition: trip.employeePosition || "",
          destination: trip.destination || "",
          tripPurpose: trip.tripPurpose || "",
          departureDate: toDate(trip.departureDate),
          returnDate: toDate(trip.returnDate),
          budget: trip.budget != null ? String(trip.budget) : "",
          notes: trip.notes || ""
        }
      : undefined,
    defaultValues: {
      employeeName: "",
      employeePosition: "",
      destination: "",
      tripPurpose: "",
      departureDate: null,
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
      await editBusinessTrip(id, {
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
      queryClient.invalidateQueries(["business-trip-edit", id]);
      setSuccessModal(true);
    } catch (err) {
      setModalMessage(err?.response?.data?.message || err.message);
      setErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setCancelModal(true)}>
            <ArrowLeft size={16} />
          </Button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/business-trip")} className="hover:text-foreground">
              {t("page.businessTrip.list.title")}
            </button>
            <span className="text-xs">/</span>
            <span className="text-primary font-semibold">{t("page.businessTrip.edit.title")}</span>
          </nav>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{t("page.businessTrip.edit.title")}</h1>
        </div>

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
              <Textarea
                rows={2}
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
              <Save size={16} className="mr-1" /> {t("page.businessTrip.edit.save")}
            </Button>
          </div>
        </form>

        {isSubmitting && <Loading fullscreen size="lg" label={t("page.businessTrip.edit.save")} />}

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
          title={t("page.businessTrip.edit.title")}
          description={t("page.businessTrip.edit.title")}
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
          title={t("page.businessTrip.edit.title")}
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

export default EditBusinessTrip;
