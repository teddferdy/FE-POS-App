import React, { useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  CloudUpload,
  Info,
  ShieldCheck,
  Check,
  History,
  Map,
  X
} from "lucide-react";
import { toast } from "sonner";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import { addLocation, editLocation } from "@/services/location";

const AddLocation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(2, "Nama toko minimal 2 karakter"),
      storeId: z.string().optional(),
      phoneNumber: z.string().min(8, "Nomor telepon minimal 8 karakter"),
      email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
      address: z.string().min(5, "Alamat minimal 5 karakter"),
      detailLocation: z.string().optional(),
      location: z.string().optional(),
      city: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().default(true),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      storeId: "",
      phoneNumber: "",
      email: "",
      address: "",
      detailLocation: "",
      location: "",
      city: "",
      description: "",
      isActive: true,
      openTime: "08:00",
      closeTime: "22:00"
    }
  });

  const addMutation = useMutation(addLocation, {
    onSuccess: () => {
      toast.success("Success", { description: "Location added successfully" });
      queryClient.invalidateQueries(["locations"]);
      navigate("/location-list");
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const editMutation = useMutation(editLocation, {
    onSuccess: () => {
      toast.success("Success", { description: "Location updated successfully" });
      queryClient.invalidateQueries(["locations"]);
      navigate("/location-list");
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (values) => {
    setIsSubmitting(true);
    const payload = {
      ...values,
      storeId: values.storeId ? `ST-${values.storeId}` : undefined
    };
    if (isEdit) {
      editMutation.mutate({ ...payload, id: editId });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/location-list")}
          className="font-medium hover:text-primary transition-colors">
          Kelola Toko
        </button>
        <span className="text-xs">/</span>
        <span className="font-semibold text-foreground">Tambah Toko</span>
      </nav>

      {/* Form Card */}
      <div className="bg-card rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => navigate("/location-list")}>
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Map size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Tambah Lokasi Toko Baru</h2>
              <p className="text-sm text-muted-foreground">
                Silakan lengkapi informasi detail untuk pendaftaran unit toko baru.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Image Upload */}
              <div className="md:col-span-4">
                <FormLabel className="text-sm font-semibold text-foreground block mb-1">
                  Foto Toko
                </FormLabel>
                <p className="text-xs text-muted-foreground mb-3">
                  Format: JPG, PNG. Maksimal 2MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  onClick={handleImageClick}
                  className="relative aspect-square w-full rounded-xl border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center bg-muted/30 overflow-hidden cursor-pointer group">
                  {previewImage ? (
                    <>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="absolute top-2 right-2 z-10 p-1 bg-background/80 rounded-full text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors p-4">
                      <CloudUpload size={40} className="mb-2" />
                      <span className="text-xs font-semibold text-center">
                        Klik atau Tarik Gambar
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="md:col-span-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Store Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Nama Toko <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input {...field} placeholder="Contoh: Kinetic Coffee - Sudirman" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Store ID */}
                  <FormField
                    control={form.control}
                    name="storeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          ID Toko
                        </FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                            ST-
                          </span>
                          <Input {...field} placeholder="001" className="pl-10 font-mono" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Nomor Telepon <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input {...field} placeholder="+62 821 0000 0000" className="pl-9" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Alamat Lengkap <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                        <Textarea
                          {...field}
                          placeholder="Masukkan alamat lengkap toko..."
                          className="pl-9 min-h-[80px] resize-none"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Detail Location */}
                <FormField
                  control={form.control}
                  name="detailLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Detail Lokasi (Patokan)
                      </FormLabel>
                      <Input {...field} placeholder="Lantai 2, Samping lift utara" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Location
                      </FormLabel>
                      <Input {...field} placeholder="Masukkan lokasi" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Toggle */}
                <div className="pt-2 flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        form.watch("isActive")
                          ? "bg-green-600 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                      {form.watch("isActive") ? (
                        <Check size={20} />
                      ) : (
                        <span className="text-lg font-bold">⏻</span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">Status Operasional</p>
                      <p className="text-xs text-muted-foreground">
                        Tentukan apakah toko langsung aktif atau non-aktif.
                      </p>
                    </div>
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/location-list")}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
                <Save size={18} />
                {isEdit ? "Simpan Perubahan" : "Simpan Lokasi"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
          <Info size={20} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Validasi Data
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Sistem akan melakukan pengecekan ID Toko duplikat secara otomatis saat penyimpanan.
            </p>
          </div>
        </div>
        <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck size={20} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Keamanan</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Data lokasi toko hanya dapat diubah oleh pemilik atau super administrator.
            </p>
          </div>
        </div>
        <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
          <History size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Audit Trail
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Setiap penambahan data akan tercatat dalam log aktivitas sistem administrator.
            </p>
          </div>
        </div>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}
    </div>
  );
};

export default AddLocation;
