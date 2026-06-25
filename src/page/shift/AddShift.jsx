import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Users, CalendarDays, Check, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { addShift } from "@/services/shift";
import { getAllEmployee } from "@/services/employee";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  nama_shift: z.string().min(1, "Nama shift wajib diisi"),
  tipe_shift: z.enum(["harian", "mingguan"]),
  store: z.string().min(1, "Toko wajib dipilih"),
  jam_mulai: z.string().min(1, "Jam mulai wajib diisi"),
  jam_selesai: z.string().min(1, "Jam selesai wajib diisi"),
  tanggal_mulai: z.date({ required_error: "Tanggal mulai wajib diisi" }),
  tanggal_selesai: z.date().optional(),
  karyawan: z.array(z.any()).optional(),
  deskripsi: z.string().optional().or(z.literal("")),
  status: z.boolean().default(true)
});

const AddShift = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);

  const { data: employeesData } = useQuery(
    ["employees-for-shift"],
    () => getAllEmployee({ limit: 100 }),
    {
      staleTime: 5 * 60 * 1000
    }
  );
  const employees = (employeesData?.data || employeesData?.employees || []).filter(
    (e) => e.status === "active"
  );

  const { data: locationsData } = useQuery(["allLocations"], getAllLocation);
  const locations = locationsData?.data || locationsData?.locations || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_shift: "",
      tipe_shift: "harian",
      store: "",
      jam_mulai: "08:00",
      jam_selesai: "17:00",
      tanggal_mulai: new Date(),
      tanggal_selesai: undefined,
      karyawan: [],
      deskripsi: "",
      status: true
    }
  });

  const tipeShift = form.watch("tipe_shift");
  const selectedEmployees = form.watch("karyawan") || [];
  const tanggalMulai = form.watch("tanggal_mulai");

  // Auto-calculate end date for weekly, reset for daily
  React.useEffect(() => {
    if (tipeShift === "mingguan" && tanggalMulai) {
      const end = new Date(tanggalMulai);
      end.setDate(end.getDate() + 6);
      form.setValue("tanggal_selesai", end);
    } else {
      form.setValue("tanggal_selesai", undefined);
    }
  }, [tipeShift, tanggalMulai, form]);

  const toggleEmployee = (emp) => {
    const current = form.getValues("karyawan") || [];
    const exists = current.find((e) => (e.id || e._id) === (emp.id || emp._id));
    if (exists) {
      form.setValue(
        "karyawan",
        current.filter((e) => (e.id || e._id) !== (emp.id || emp._id))
      );
    } else {
      form.setValue("karyawan", [
        ...current,
        { id: emp.id || emp._id, name: emp.fullName || emp.name }
      ]);
    }
  };

  const createMutation = useMutation(addShift, {
    onSuccess: () => setSuccessModal(true),
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan shift"
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { status, karyawan, ...rest } = values;
    createMutation.mutate({
      ...rest,
      tanggal_mulai:
        values.tanggal_mulai instanceof Date
          ? values.tanggal_mulai.toISOString().split("T")[0]
          : values.tanggal_mulai,
      tanggal_selesai:
        values.tanggal_selesai instanceof Date
          ? values.tanggal_selesai.toISOString().split("T")[0]
          : values.tanggal_selesai,
      karyawan: karyawan?.map((k) => k.id) || [],
      status: saveAsDraft ? "draft" : status ? "active" : "inactive"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { i18nKey: "breadcrumb.home", href: "/dashboard-super-admin" },
              { i18nKey: "page.shift.list.title", href: "/shift" },
              { i18nKey: "page.shift.add.title" }
            ]}
            title={t("page.shift.add.title")}
            description={t("page.shift.list.description")}>
            <UserGuide guideKey="add-shift" />
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => onSubmit(v, false))} className="space-y-6">
                {/* Baris 1: Nama Shift & Tipe */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nama_shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nama Shift <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <CalendarDays
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input placeholder="Contoh: Shift Pagi" className="pl-9" {...field} />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipe_shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipe Shift <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          {["harian", "mingguan"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => field.onChange(t)}
                              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all border ${
                                field.value === t
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
                              }`}>
                              {t === "harian" ? "📅 Harian" : "📆 Mingguan"}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Baris: Penempatan Toko */}
                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Penempatan Toko <span className="text-destructive">*</span>
                      </FormLabel>
                      {locations.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg bg-muted/20">
                          <Store size={28} className="text-muted-foreground/60" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">Belum ada toko</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Tambah toko terlebih dahulu
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/add-location")}
                            className="gap-2">
                            <span className="material-symbols-outlined text-base">add</span>
                            Tambah Toko
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {locations.map((loc) => {
                            const isSelected = field.value === (loc.id || loc._id);
                            return (
                              <button
                                key={loc.id || loc._id}
                                type="button"
                                onClick={() => field.onChange(String(loc.id || loc._id))}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-background hover:border-primary/50 hover:bg-muted/20"
                                }`}>
                                <div
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}>
                                  <Store size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-sm font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                    {loc.name || loc.storeName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {loc.city || loc.address || ""}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check size={16} className="text-primary shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Baris 2: Jam Mulai & Jam Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="jam_mulai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Jam Mulai <span className="text-destructive">*</span>
                        </FormLabel>
                        <TimePicker {...field} placeholder="Pilih jam mulai" />
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
                          Jam Selesai <span className="text-destructive">*</span>
                        </FormLabel>
                        <TimePicker {...field} placeholder="Pilih jam selesai" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Baris 3: Tanggal Mulai & Tanggal Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tanggal_mulai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tanggal Mulai <span className="text-destructive">*</span>
                        </FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tanggal_selesai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Selesai</FormLabel>
                        <div
                          className={`transition-all duration-200 ${tipeShift === "harian" ? "opacity-50" : ""}`}>
                          <DatePicker
                            date={field.value}
                            setDate={tipeShift === "mingguan" ? field.onChange : () => {}}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tipeShift === "harian"
                            ? "✏️ Hanya untuk shift mingguan"
                            : "Atur tanggal berakhir shift"}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Baris 4: Pilih Karyawan */}
                <FormField
                  control={form.control}
                  name="karyawan"
                  render={() => (
                    <FormItem>
                      <FormLabel>Pilih Karyawan</FormLabel>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setEmployeeOpen(!employeeOpen)}
                          className="w-full flex items-center gap-2 h-10 px-3 rounded-lg border border-input bg-background text-sm text-left text-muted-foreground hover:border-primary transition-colors">
                          <Users size={16} className="shrink-0" />
                          <span className="flex-1">
                            {selectedEmployees.length === 0
                              ? "Pilih karyawan untuk shift ini"
                              : `${selectedEmployees.length} karyawan dipilih`}
                          </span>
                          <Check size={14} className="text-muted-foreground/60" />
                        </button>
                        {selectedEmployees.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selectedEmployees.map((emp) => (
                              <span
                                key={emp.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {emp.name}
                                <button
                                  type="button"
                                  onClick={() => toggleEmployee(emp)}
                                  className="hover:text-destructive">
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {employeeOpen && (
                        <div className="mt-2 border border-border rounded-lg max-h-48 overflow-y-auto bg-background shadow-sm">
                          {employees.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20 m-2">
                              <Users size={28} className="text-muted-foreground/60" />
                              <div className="text-center">
                                <p className="text-sm font-medium text-foreground">
                                  Belum ada karyawan
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Tambah karyawan terlebih dahulu
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/add-employee")}
                                className="gap-2">
                                <span className="material-symbols-outlined text-base">add</span>
                                Tambah Karyawan
                              </Button>
                            </div>
                          ) : (
                            employees.map((emp) => {
                              const isSelected = selectedEmployees.some(
                                (e) => e.id === (emp.id || emp._id)
                              );
                              return (
                                <label
                                  key={emp.id || emp._id}
                                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                                    isSelected ? "bg-primary/5" : ""
                                  }`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleEmployee(emp)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {emp.fullName || emp.name || "—"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {emp.position || emp.department || ""}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check size={14} className="text-primary shrink-0" />
                                  )}
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deskripsi */}
                <FormField
                  control={form.control}
                  name="deskripsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <Textarea
                        placeholder="Catatan tambahan tentang shift ini..."
                        rows={3}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <div
                        className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                          field.value
                            ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                        }`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${field.value ? "bg-green-600 text-white" : "bg-destructive/10 text-destructive"}`}>
                            <span className="material-symbols-outlined text-lg">
                              {field.value ? "check" : "close"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {field.value ? "Aktif" : "Tidak Aktif"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {field.value
                                ? "Shift ini aktif dan dapat digunakan."
                                : "Shift ini tidak aktif."}
                            </p>
                          </div>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancelModal(true)}
                    className="gap-2">
                    <X size={18} /> {t("breadcrumb.back")}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDraftModal(true)}
                      disabled={createMutation.isLoading}
                      className="gap-2">
                      <Save size={18} /> Simpan sebagai Draft
                    </Button>
                    <Button type="submit" disabled={createMutation.isLoading} className="gap-2">
                      <Save size={18} />
                      {createMutation.isLoading ? t("common.saving") : t("common.save")}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/shift")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Shift berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/shift")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title="Simpan sebagai Draft?"
        description="Data yang belum lengkap bisa dilengkapi nanti"
        confirmText="Ya, Simpan Draft"
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default AddShift;
