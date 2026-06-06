import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { X, Save } from "lucide-react";
import { getAllDiscount, editDiscount } from "@/services/discount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  name: z.string().min(1, "Nama diskon wajib diisi"),
  type: z.string().min(1, "Tipe diskon wajib dipilih"),
  value: z.coerce.number().min(1, "Nilai diskon wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().optional().or(z.literal("")),
  minPurchase: z.coerce.number().min(0).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const EditDiscount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const [draftModal, setDraftModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["discounts-all"],
    () => getAllDiscount({ location: locationParam, page: 1, limit: 9999, statusDiscount: "" }),
    { enabled: !!id }
  );

  const discountItem = useMemo(() => {
    if (!data?.data) return {};
    return data.data.find((item) => item.id === id || item._id === id) || {};
  }, [data, id]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      value: "",
      startDate: "",
      endDate: "",
      minPurchase: "",
      description: "",
      isActive: true
    }
  });

  useEffect(() => {
    if (discountItem?.id) {
      form.reset({
        name: discountItem.name || "",
        type: discountItem.type || "",
        value: discountItem.value ?? "",
        startDate: discountItem.startDate || "",
        endDate: discountItem.endDate || "",
        minPurchase: discountItem.minPurchase ?? "",
        description: discountItem.description || "",
        isActive: discountItem.status === "active"
      });
    }
  }, [discountItem, form]);

  const updateMutation = useMutation(editDiscount, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengupdate diskon"
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    updateMutation.mutate({
      id,
      ...values,
      status: saveAsDraft ? false : !!values.isActive
    });
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID diskon tidak ditemukan</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!discountItem?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Diskon tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/discount")}
          className="hover:text-foreground transition-colors">
          Diskon
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Diskon</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Diskon</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit data diskon.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button
            variant="outline"
            onClick={() => setDraftModal(true)}
            disabled={updateMutation.isLoading}>
            Simpan sebagai Draft
          </Button>
          <Button
            onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
            disabled={updateMutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Diskon <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama diskon" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Diskon <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe diskon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Persentase">Persentase</SelectItem>
                        <SelectItem value="Nominal">Nominal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nilai <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                      type="number"
                      placeholder="Masukkan nilai diskon"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                      }}
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
                    <FormLabel>
                      Tanggal Mulai <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Berakhir</FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Belanja</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <Textarea placeholder="Deskripsi diskon" rows={3} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Status</FormLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        onConfirm={() => navigate("/discount")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Diskon berhasil diupdate."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/discount")}
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

export default EditDiscount;
