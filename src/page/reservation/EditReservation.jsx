/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getReservations, updateReservation, getAvailableTables } from "@/services/reservation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const EditReservation = () => {
  const { t } = useTranslation();
  const formSchema = z.object({
    customerName: z.string().min(1, t("page.reservation.edit.validation.customerName")),
    customerPhone: z.string().optional().or(z.literal("")),
    customerEmail: z.string().optional().or(z.literal("")),
    guestCount: z.coerce.number().min(1),
    reservationDate: z.date({
      required_error: t("page.reservation.edit.validation.reservationDate")
    }),
    startTime: z.string().min(1),
    endTime: z.string().optional().or(z.literal("")),
    tableId: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    status: z.string().optional()
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);

  const {
    data: listData,
    isLoading,
    isError,
    refetch
  } = useQuery(["reservations-all"], () => getReservations({ limit: 9999 }), { enabled: !!id });

  const reservation = useMemo(() => {
    if (!listData?.data) return null;
    return listData.data.find((r) => r.id === Number(id)) || null;
  }, [listData, id]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      guestCount: 2,
      reservationDate: undefined,
      startTime: "",
      endTime: "",
      tableId: "",
      notes: "",
      status: "pending"
    }
  });

  useEffect(() => {
    if (reservation) {
      form.reset({
        customerName: reservation.customerName || "",
        customerPhone: reservation.customerPhone || "",
        customerEmail: reservation.customerEmail || "",
        guestCount: reservation.guestCount || 1,
        reservationDate: reservation.reservationDate
          ? new Date(reservation.reservationDate)
          : undefined,
        startTime: reservation.startTime?.slice(0, 5) || "",
        endTime: reservation.endTime?.slice(0, 5) || "",
        tableId: reservation.tableId ? String(reservation.tableId) : "none",
        notes: reservation.notes || "",
        status: reservation.status || "pending"
      });
    }
  }, [reservation, form]);

  const loadAvailableTables = async () => {
    try {
      const res = await getAvailableTables({
        date: form.getValues("reservationDate"),
        startTime: form.getValues("startTime"),
        endTime: form.getValues("endTime") || undefined
      });
      setAvailableTables(res.data || []);
    } catch (e) {
      setAvailableTables([]);
    }
  };

  const updateMutation = useMutation(updateReservation, {
    onSuccess: () => setSuccessModal(true),
    onError: (err) =>
      toast.error(t("page.reservation.edit.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const onSubmit = (values) => {
    updateMutation.mutate({
      id,
      customerName: values.customerName,
      customerPhone: values.customerPhone || null,
      customerEmail: values.customerEmail || null,
      guestCount: Number(values.guestCount),
      reservationDate: values.reservationDate ? format(values.reservationDate, "yyyy-MM-dd") : "",
      startTime: values.startTime,
      endTime: values.endTime || null,
      tableId: values.tableId && values.tableId !== "none" ? Number(values.tableId) : null,
      notes: values.notes || null,
      status: values.status || "pending"
    });
  };

  if (isError) return <AbortController refetch={refetch} />;
  if (!id)
    return (
      <div className="p-10 text-center text-muted-foreground">
        {t("page.reservation.edit.noId")}
      </div>
    );
  if (isLoading) return <Loading fullscreen size="lg" label={t("page.reservation.edit.loading")} />;
  if (!reservation)
    return (
      <div className="p-10 text-center text-muted-foreground">
        {t("page.reservation.edit.notFound")}
      </div>
    );

  return (
    <div>
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.reservation.edit.breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/reservation")} className="hover:text-foreground">
            {t("page.reservation.edit.breadcrumb.list")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.reservation.edit.breadcrumb.edit")}
          </span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold">{t("page.reservation.edit.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.reservation.edit.subtitle")}
          </p>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.reservation.edit.form.customerName")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.reservation.edit.form.customerPhone")}</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.reservation.edit.form.customerEmail")}</FormLabel>
                      <Input type="email" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.reservation.edit.form.guestCount")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        type="number"
                        min="1"
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
                  name="reservationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.reservation.edit.form.date")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
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
                        {t("page.reservation.edit.form.startTime")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <TimePicker
                        {...field}
                        placeholder={t("page.reservation.edit.form.startTimePlaceholder")}
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
                      <FormLabel>{t("page.reservation.edit.form.endTime")}</FormLabel>
                      <TimePicker
                        {...field}
                        placeholder={t("page.reservation.edit.form.endTimePlaceholder")}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.reservation.edit.form.status")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            {t("page.reservation.edit.form.statusPending")}
                          </SelectItem>
                          <SelectItem value="confirmed">
                            {t("page.reservation.edit.form.statusConfirmed")}
                          </SelectItem>
                          <SelectItem value="cancelled">
                            {t("page.reservation.edit.form.statusCancelled")}
                          </SelectItem>
                          <SelectItem value="completed">
                            {t("page.reservation.edit.form.statusCompleted")}
                          </SelectItem>
                          <SelectItem value="no_show">
                            {t("page.reservation.edit.form.statusNoShow")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.reservation.edit.form.table")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("page.reservation.edit.form.tablePlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {t("page.reservation.edit.form.noTable")}
                          </SelectItem>
                          {availableTables.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.name} (Kap. {t.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={loadAvailableTables}>
                        {t("page.reservation.edit.form.searchTable")}
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("page.reservation.edit.form.notes")}</FormLabel>
                    <Textarea rows={3} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                  <X size={18} /> {t("page.reservation.edit.cancel")}
                </Button>
                <Button type="submit" disabled={updateMutation.isLoading} className="gap-2">
                  <Save size={18} />
                  {updateMutation.isLoading
                    ? t("page.reservation.edit.saving")
                    : t("page.reservation.edit.save")}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("page.reservation.edit.modal.cancelTitle")}
          description={t("page.reservation.edit.modal.cancelDesc")}
          confirmText={t("page.reservation.edit.modal.cancelConfirm")}
          onConfirm={() => navigate("/reservation")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.reservation.edit.modal.successTitle")}
          description={t("page.reservation.edit.modal.successDesc")}
          confirmText={t("page.reservation.edit.modal.successConfirm")}
          onConfirm={() => navigate("/reservation")}
        />
      </div>
    </div>
  );
};

export default EditReservation;
