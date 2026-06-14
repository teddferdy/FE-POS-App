import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
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

const formSchema = z.object({
  customerName: z.string().min(1, "Nama customer wajib diisi"),
  customerPhone: z.string().optional().or(z.literal("")),
  customerEmail: z.string().optional().or(z.literal("")),
  guestCount: z.coerce.number().min(1),
  reservationDate: z.date({ required_error: "Tanggal reservasi wajib diisi" }),
  startTime: z.string().min(1),
  endTime: z.string().optional().or(z.literal("")),
  tableId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.string().optional(),
});

const EditReservation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);

  const { data: listData, isLoading } = useQuery(
    ["reservations-all"],
    () => getReservations({ limit: 9999 }),
    { enabled: !!id }
  );

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
      status: "pending",
    }
  });

  useEffect(() => {
    if (reservation) {
      form.reset({
        customerName: reservation.customerName || "",
        customerPhone: reservation.customerPhone || "",
        customerEmail: reservation.customerEmail || "",
        guestCount: reservation.guestCount || 1,
        reservationDate: reservation.reservationDate ? new Date(reservation.reservationDate) : undefined,
        startTime: reservation.startTime?.slice(0, 5) || "",
        endTime: reservation.endTime?.slice(0, 5) || "",
        tableId: reservation.tableId ? String(reservation.tableId) : "none",
        notes: reservation.notes || "",
        status: reservation.status || "pending",
      });
    }
  }, [reservation, form]);

  const loadAvailableTables = async () => {
    try {
      const res = await getAvailableTables({
        date: form.getValues("reservationDate"),
        startTime: form.getValues("startTime"),
        endTime: form.getValues("endTime") || undefined,
      });
      setAvailableTables(res.data || []);
    } catch (e) {
      setAvailableTables([]);
    }
  };

  const updateMutation = useMutation(updateReservation, {
    onSuccess: () => setSuccessModal(true),
    onError: (err) => toast.error("Gagal", {
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
      status: values.status || "pending",
    });
  };

  if (!id) return <div className="p-10 text-center text-muted-foreground">ID reservasi tidak ditemukan</div>;
  if (isLoading) return <Loading fullscreen size="lg" label="Memuat data..." />;
  if (!reservation) return <div className="p-10 text-center text-muted-foreground">Reservasi tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground">Dashboard</button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/reservation")} className="hover:text-foreground">Reservasi</button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Reservasi</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">Edit Reservasi</h1>
        <p className="text-sm text-muted-foreground mt-1">Update data reservasi</p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="customerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Customer <span className="text-destructive">*</span></FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="customerPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telepon</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="customerEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" {...field} />
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
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="no_show">Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tableId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Meja</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Pilih meja" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak pilih meja</SelectItem>
                      {availableTables.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.name} (Kap. {t.capacity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={loadAvailableTables}>
                    Cari Meja Tersedia
                  </Button>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <Textarea rows={3} {...field} />
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-between gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} /> Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading} className="gap-2">
                <Save size={18} />
                {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <Modal type="confirm" open={cancelModal} onOpenChange={setCancelModal}
        title="Batalkan?" description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan" onConfirm={() => navigate("/reservation")} />
      <Modal type="success" open={successModal} onOpenChange={setSuccessModal}
        title="Berhasil!" description="Reservasi berhasil diupdate."
        confirmText="Kembali ke Daftar" onConfirm={() => navigate("/reservation")} />
    </div>
  );
};

export default EditReservation;
