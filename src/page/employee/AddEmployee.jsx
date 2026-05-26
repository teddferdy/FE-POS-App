import React, { useState, useRef, useEffect, useMemo } from "react";
import { CloudUpload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addEmployee, generateEmployeeId } from "@/services/employee";
import { getShiftDropdown } from "@/services/shift";
import { getAllLocation } from "@/services/location";
import { getAllPosition } from "@/services/position";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const AddEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const formSchema = useMemo(() => {
    return z.object({
      fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
      userName: z.string().min(1, "Username wajib diisi"),
      email: z.string().email("Format email tidak valid"),
      password: z.string().min(6, "Password minimal 6 karakter"),
      phoneNumber: z
        .string()
        .regex(/^\d+$/, "Nomor telepon hanya boleh angka")
        .min(8, "Minimal 8 digit")
        .max(14, "Maksimal 14 digit"),
      placeOfBirth: z.string().min(2, "Tempat lahir minimal 2 karakter"),
      address: z.string().min(5, "Alamat minimal 5 karakter"),
      gender: z.string().min(1, "Pilih jenis kelamin"),
      dateOfBirth: z.string().min(1, "Pilih tanggal lahir"),
      employeeId: z.string().min(1, "ID Karyawan harus diisi"),
      department: z.string().optional().or(z.literal("")),
      position: z.string().optional().or(z.literal("")),
      store: z.string().optional().or(z.literal("")),
      employmentType: z.string().optional().or(z.literal("")),
      shift: z.string().optional().or(z.literal("")),
      startDate: z.string().optional().or(z.literal("")),
      isActive: z.boolean().default(true),
      roleId: z.string().optional().or(z.literal("")),
      accessMenu: z.string().optional().or(z.literal(""))
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      password: "",
      phoneNumber: "",
      placeOfBirth: "",
      address: "",
      gender: "",
      dateOfBirth: "",
      employeeId: "",
      department: "",
      position: "",
      store: "",
      employmentType: "",
      shift: "",
      startDate: "",
      isActive: true,
      roleId: "",
      accessMenu: ""
    }
  });

  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await generateEmployeeId();
        const empId = res?.data?.employeeId || res?.employeeId || "";
        form.setValue("employeeId", String(empId));
      } catch {
        // silently fail
      }
    };
    fetchId();
  }, []);

  const { data: locationsData } = useQuery(["locations-all"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000
  });
  const locations = locationsData?.data || locationsData?.locations || [];

  const { data: positionsData } = useQuery(["positions-all"], () => getAllPosition(), {
    staleTime: 5 * 60 * 1000
  });
  const positions = positionsData?.data || positionsData?.positions || [];

  const selectedStore = form.watch("store");

  const { data: shiftsData } = useQuery(
    ["shifts-all", selectedStore],
    () => getShiftDropdown({ store: selectedStore, statusShift: "active" }),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!selectedStore
    }
  );
  const shifts = shiftsData?.data || shiftsData?.shifts || [];

  const createMutation = useMutation(addEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreviewImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values) => {
    setIsSubmitting(true);
    const payload = { ...values };
    if (imageFile) {
      payload.image = imageFile;
    }
    if (!payload.employeeId) {
      delete payload.employeeId;
    }
    if (!payload.roleId) {
      delete payload.roleId;
    }
    createMutation.mutate(payload);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>Manajemen SDM</span>
            <span>/</span>
            <button
              onClick={() => navigate("/employee-list")}
              className="hover:text-primary transition-colors">
              Kelola Karyawan
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">Tambah Karyawan Baru</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Tambah Karyawan Baru
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daftarkan anggota tim baru ke dalam sistem.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Section 1: Informasi Pribadi */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h4 className="text-base font-semibold text-foreground">Informasi Pribadi</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col items-center gap-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Foto <span className="text-destructive">*</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div
                      onClick={handleImageClick}
                      className="relative w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center bg-muted/30 overflow-hidden cursor-pointer group">
                      {previewImage ? (
                        <>
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-background/90 rounded-full text-muted-foreground hover:text-foreground shadow-md">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors p-4">
                          <CloudUpload size={36} className="mb-2" />
                          <span className="text-xs font-semibold text-center">Upload Foto</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">JPG, PNG. Maks 2MB.</p>
                  </div>

                  <div className="md:col-span-2 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Nama Lengkap <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input {...field} placeholder="Contoh: Budi Santoso" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Email <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input {...field} type="email" placeholder="email@domain.com" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Nomor Telepon <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="0812-xxxx-xxxx"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 14);
                                field.onChange(value);
                              }}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Jenis Kelamin <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="placeOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Tempat Lahir <span className="text-destructive">*</span>
                            </FormLabel>
                            <Input {...field} placeholder="Contoh: Jakarta" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Tanggal Lahir <span className="text-destructive">*</span>
                            </FormLabel>
                            <DatePicker
                              date={field.value ? new Date(field.value) : undefined}
                              setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Alamat <span className="text-destructive">*</span>
                          </FormLabel>
                          <Textarea
                            {...field}
                            rows={3}
                            className="resize-none"
                            placeholder="Alamat lengkap"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Informasi Pekerjaan */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">work</span>
                  <h4 className="text-base font-semibold text-foreground">Informasi Pekerjaan</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          ID Karyawan <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          {...field}
                          disabled
                          className="font-mono bg-muted/50"
                          placeholder="Memuat..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Department
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="front office">Front Office</SelectItem>
                            <SelectItem value="kitchen">Kitchen</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Jabatan
                        </FormLabel>
                        <Combobox
                          options={(positions || []).map((p) => ({
                            value: String(p.id),
                            label: p.name
                          }))}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Pilih Jabatan"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="store"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Penempatan Toko / Cabang
                        </FormLabel>
                        <Combobox
                          options={(locations || []).map((loc) => ({
                            value: String(loc.id || loc._id),
                            label: loc.name
                          }))}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Pilih Cabang"
                          searchPlaceholder="Cari cabang..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tipe Kerja
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="contract">Kontrak</SelectItem>
                            <SelectItem value="internship">Magang</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Shift
                        </FormLabel>
                        <Combobox
                          options={(shifts || []).map((s) => ({
                            value: String(s.id),
                            label: s.shiftName || s.name
                          }))}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder={selectedStore ? "Pilih Shift" : "Pilih cabang dulu"}
                          disabled={!selectedStore}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tanggal Mulai Kerja
                        </FormLabel>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date) => field.onChange(date ? date.toISOString() : "")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-1.5 justify-end">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mt-auto">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Status Aktif</p>
                        <p className="text-xs text-muted-foreground">Karyawan aktif bekerja.</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Akun & Hak Akses */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  <h4 className="text-base font-semibold text-foreground">Akun &amp; Hak Akses</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Username <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input {...field} placeholder="Username unik untuk login" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Password <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
                            <span className="material-symbols-outlined text-base">
                              {showPassword ? "visibility" : "visibility_off"}
                            </span>
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Pilih Peran (Role)
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Default: User" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Super Admin</SelectItem>
                            <SelectItem value="2">Admin</SelectItem>
                            <SelectItem value="3">User</SelectItem>
                            <SelectItem value="4">Kasir</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accessMenu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Permission Tambahan
                        </FormLabel>
                        <Input {...field} placeholder="Opsional: export_laporan, dsb." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <div className="bg-primary/10 text-primary-foreground p-6 rounded-xl shadow-sm border border-primary/20 overflow-hidden relative">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-3xl text-primary mb-3">
                    badge
                  </span>
                  <h3 className="text-base font-semibold text-primary mb-2">Panduan Pengisian</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pastikan data yang dimasukkan sesuai dengan dokumen resmi karyawan.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-foreground">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      <span>
                        Field dengan tanda <span className="text-destructive">*</span> wajib diisi.
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      <span>Data lain bersifat opsional.</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-foreground">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      <span>Role default adalah User jika tidak dipilih.</span>
                    </li>
                  </ul>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <span className="material-symbols-outlined text-[200px] text-primary">
                    admin_panel_settings
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-12">
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setCancelModal(true)}>
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
                  <span className="material-symbols-outlined text-lg">save</span>
                  Simpan Karyawan
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Karyawan Berhasil Ditambahkan"
        onConfirm={() => navigate("/employee-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan Perubahan?"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/employee-list")}
      />
    </div>
  );
};

export default AddEmployee;
