import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Search } from "lucide-react";
import { createReservation, getAvailableTables } from "@/services/reservation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

const formSchema = z.object({
  customerName: z.string().min(1, "Nama customer wajib diisi"),
  customerPhone: z.string().optional().or(z.literal("")),
  customerEmail: z.string().optional().or(z.literal("")),
  guestCount: z.coerce.number().min(1, "Minimal 1 tamu"),
  reservationDate: z.date({ required_error: "Tanggal reservasi wajib diisi" }),
  startTime: z.string().min(1, "Jam mulai wajib diisi"),
  endTime: z.string().optional().or(z.literal("")),
  tableId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

const AddReservation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);

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
      tableId: "none",
      notes: "",
    }
  });

  const reservationDate = form.watch("reservationDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    if (reservationDate && startTime) {
      loadAvailableTables();
    }
  }, [reservationDate, startTime, endTime]);

  const loadAvailableTables = async () => {
    setLoadingTables(true);
    try {
      const res = await getAvailableTables({
        date: reservationDate ? format(reservationDate, "yyyy-MM-dd") : "",
        startTime,
        endTime: endTime || undefined,
      });
      setAvailableTables(res.data || []);
    } catch (e) {
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const createMutation = useMutation(createReservation, {
    onSuccess: () => setSuccessModal(true),
    onError: (err) => toast.error("Gagal", {
      description: err?.response?.data?.message || err.message || "Gagal membuat reservasi"
    })
  });

  const onSubmit = (values) => {
    const payload = {
      customerName: values.customerName,
      customerPhone: values.customerPhone || null,
      customerEmail: values.customerEmail || null,
      guestCount: Number(values.guestCount),
      reservationDate: values.reservationDate ? format(values.reservationDate, "yyyy-MM-dd") : "",
      startTime: values.startTime,
      endTime: values.endTime || null,
      tableId: values.tableId && values.tableId !== "none" ? Number(values.tableId) : null,
      notes: values.notes || null,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/reservation")} className="hover:text-foreground transition-colors">
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
              <FormField control={form.control} name="customerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Customer <span className="text-destructive">*</span></FormLabel>
                  <Input placeholder="Nama customer" {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="customerPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telepon</FormLabel>
                  <Input placeholder="08123456789" {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="customerEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" placeholder="email@example.com" {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="guestCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Tamu <span className="text-destructive">*</span></FormLabel>
                  <Input type="number" min="1" {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="reservationDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal <span className="text-destructive">*</span></FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Mulai <span className="text-destructive">*</span></FormLabel>
                  <TimePicker {...field} placeholder="Pilih jam mulai" />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Selesai</FormLabel>
                  <TimePicker {...field} placeholder="Pilih jam selesai" />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tableId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Meja</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingTables ? "Memuat meja..." : "Pilih meja (opsional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak pilih meja</SelectItem>
                      {availableTables.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} (Kap. {t.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!reservationDate || !startTime ? (
                    <p className="text-xs text-muted-foreground mt-1">Pilih tanggal dan jam untuk melihat meja tersedia</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <Textarea placeholder="Catatan reservasi" rows={3} {...field} />
                <FormMessage />
              </FormItem>
            )} />
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

      <Modal type="confirm" open={cancelModal} onOpenChange={setCancelModal}
        title="Batalkan?" description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan" onConfirm={() => navigate("/reservation")} />
      <Modal type="success" open={successModal} onOpenChange={setSuccessModal}
        title="Berhasil!" description="Reservasi berhasil dibuat."
        confirmText="Kembali ke Daftar" onConfirm={() => navigate("/reservation")} />
    </div>
  );
};

export default AddReservation;
