import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  X,
  Save
  // Building2,
  // Loader2
} from "lucide-react";
import { editSupplier, getSupplierById } from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contactPerson: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal(""))
});

const EditSupplier = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const { data: supplierData, isLoading } = useQuery(
    ["supplier-detail", supplierId],
    () => getSupplierById({ id: supplierId }),
    { enabled: !!supplierId }
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: ""
    }
  });

  const supplier = supplierData?.data || {};

  useEffect(() => {
    if (supplier?.id) {
      form.reset({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || ""
      });
    }
  }, [supplier, form]);

  const updateMutation = useMutation(editSupplier, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengupdate supplier"
      });
    }
  });

  const onSubmit = (values) => {
    updateMutation.mutate({ id: supplierId, ...values });
  };

  if (!supplierId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID supplier tidak ditemukan</p>
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
          onClick={() => navigate("/supplier")}
          className="hover:text-foreground transition-colors">
          Supplier
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Supplier</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Supplier</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit data pemasok barang.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
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
                      Nama Supplier <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama supplier" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontak Person</FormLabel>
                    <Input placeholder="Nama kontak person" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <Input placeholder="Nomor telepon" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input placeholder="email@supplier.com" {...field} />
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
                  <FormLabel>Alamat</FormLabel>
                  <Textarea placeholder="Alamat lengkap supplier" rows={3} {...field} />
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
        onConfirm={() => navigate("/supplier")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Supplier berhasil diupdate."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/supplier")}
      />
    </div>
  );
};

export default EditSupplier;
