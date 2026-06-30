/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { createReservation } from "@/services/reservation";
import { getAllLocation, getLocationDetail } from "@/services/location";
import { getTablesByStore } from "@/services/table";
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
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function generateTimeSlots(open, close) {
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const start = oh * 60 + om,
    end = ch * 60 + cm;
  const slots = [];
  for (let m = start; m <= end; m += 30)
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return slots;
}

const formSchema = z.object({
  customerName: z.string().min(1, "Nama customer wajib diisi"),
  customerPhone: z.string().max(14).optional().or(z.literal("")),
  customerEmail: z.string().optional().or(z.literal("")),
  guestCount: z.coerce.number().min(1, "Minimal 1 tamu"),
  store: z.string().min(1, "Pilih toko terlebih dahulu"),
  reservationDate: z.date({ required_error: "Tanggal reservasi wajib diisi" }),
  startTime: z.string().min(1, "Jam mulai wajib diisi"),
  endTime: z.string().optional().or(z.literal("")),
  tableId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal(""))
});

const AddReservation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelModal, setCancelModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [locationDetail, setLocationDetail] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      guestCount: 2,
      store: "",
      reservationDate: undefined,
      startTime: "",
      endTime: "",
      tableId: "none",
      notes: ""
    }
  });

  useEffect(() => {
    getAllLocation()
      .then((res) => setStores(res.data || []))
      .catch(() => {});
  }, []);

  const selectedStore = form.watch("store");
  const reservationDate = form.watch("reservationDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    if (selectedStore) {
      loadTablesByStore();
      getLocationDetail({ id: selectedStore })
        .then((res) => setLocationDetail(res.data || null))
        .catch(() => setLocationDetail(null));
    } else {
      setAvailableTables([]);
      setLocationDetail(null);
    }
  }, [selectedStore]);

  const openingHours = locationDetail?.openingHours || [];
  const offDays = openingHours
    .filter((oh) => !oh.open && !oh.close)
    .map((oh) => DAY_NAMES.indexOf(oh.day));
  const isOffDay = reservationDate ? offDays.includes(reservationDate.getDay()) : false;
  const dayName = reservationDate ? DAY_NAMES[reservationDate.getDay()] : null;
  const dayHours = openingHours.find((oh) => oh.day === dayName);
  const timeSlots = isOffDay
    ? []
    : dayHours?.open && dayHours?.close
      ? generateTimeSlots(dayHours.open, dayHours.close)
      : null;
  const detailLoading = !!selectedStore && !locationDetail;

  useEffect(() => {
    if (isOffDay && (startTime || endTime)) {
      form.setValue("startTime", "");
      form.setValue("endTime", "");
    }
  }, [isOffDay]);

  useEffect(() => {
    if (reservationDate && dayHours?.open && dayHours?.close) {
      const valid = generateTimeSlots(dayHours.open, dayHours.close);
      if (startTime && !valid.includes(startTime)) form.setValue("startTime", "");
      if (endTime && !valid.includes(endTime)) form.setValue("endTime", "");
    }
  }, [locationDetail, reservationDate]);

  const loadTablesByStore = async () => {
    setLoadingTables(true);
    try {
      const res = await getTablesByStore({ location: selectedStore });
      setAvailableTables(res.data || []);
    } catch (e) {
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const createMutation = useMutation(createReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      navigate("/reservation");
    },
    onError: (err) =>
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal membuat reservasi"
      })
  });

  const onSubmit = (values) => {
    const payload = {
      store: Number(values.store),
      customerName: values.customerName,
      customerPhone: values.customerPhone || null,
      customerEmail: values.customerEmail || null,
      guestCount: Number(values.guestCount),
      reservationDate: values.reservationDate ? format(values.reservationDate, "yyyy-MM-dd") : "",
      startTime: values.startTime,
      endTime: values.endTime || null,
      tableId: values.tableId && values.tableId !== "none" ? Number(values.tableId) : null,
      notes: values.notes || null
    };
    createMutation.mutate(payload);
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
            onClick={() => navigate("/reservation")}
            className="hover:text-foreground transition-colors">
            Reservasi
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">Tambah Reservasi</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Reservasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Buat reservasi meja baru</p>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Detail Reservasi
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Toko <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih toko" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        Tanggal <span className="text-destructive">*</span>
                      </FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={(d) => {
                          if (d && offDays.includes(d.getDay())) return;
                          field.onChange(d);
                        }}
                        disabled={(date) => offDays.includes(date.getDay())}
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
                        placeholder="Pilih jam mulai"
                        slots={timeSlots}
                        disabled={detailLoading}
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
                      <FormLabel>Jam Selesai</FormLabel>
                      <TimePicker
                        {...field}
                        placeholder="Pilih jam selesai"
                        slots={timeSlots}
                        disabled={detailLoading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-full">
                  <div className="border-t border-border my-2" />
                </div>
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Customer <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input placeholder="Nama customer" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Telepon</FormLabel>
                      <Input placeholder="08123456789" maxLength={14} {...field} />
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">{t("common.phoneHint")}</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <Input type="email" placeholder="email@example.com" {...field} />
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
                        Jumlah Tamu <span className="text-destructive">*</span>
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
                <div className="col-span-full">
                  <div className="border-t border-border my-2" />
                </div>
                <FormField
                  control={form.control}
                  name="tableId"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Meja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={loadingTables ? "Memuat meja..." : "Pilih meja (opsional)"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tidak pilih meja</SelectItem>
                          {availableTables.map((t) => {
                            const unavailable = t.status !== "available";
                            return (
                              <SelectItem
                                key={t.id}
                                value={String(t.id)}
                                disabled={unavailable}
                                className={unavailable ? "text-muted-foreground" : ""}>
                                {t.name} (Kap. {t.capacity})
                                {unavailable && (
                                  <span className="text-destructive ml-1">- Not Available</span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {!selectedStore ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pilih toko terlebih dahulu
                        </p>
                      ) : loadingTables ? (
                        <p className="text-xs text-muted-foreground mt-1">Memuat meja...</p>
                      ) : availableTables.length === 0 ? (
                        <p className="text-xs text-destructive mt-1">Meja tidak tersedia</p>
                      ) : null}
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
                    <FormLabel>Catatan</FormLabel>
                    <Textarea placeholder="Catatan reservasi" rows={3} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                  <X size={18} /> {t("breadcrumb.back")}
                </Button>
                <Button type="submit" disabled={createMutation.isLoading} className="gap-2">
                  <Save size={18} />
                  {createMutation.isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title="Batalkan?"
          description="Perubahan yang belum disimpan akan hilang."
          confirmText="Ya, Batalkan"
          onConfirm={() => navigate("/reservation")}
        />
      </div>
    </div>
  );
};

export default AddReservation;
