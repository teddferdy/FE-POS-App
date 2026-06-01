/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { addInvoiceLogo } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";

const AddInvoiceLogo = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [cancelModal, setCancelModal] = useState(false);

  const user = cookie?.user;
  const store = user?.store || "";

  const mutation = useMutation(addInvoiceLogo, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Logo berhasil ditambahkan" });
      navigate("/logo-invoice-list");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Gagal menambahkan logo");
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return toast.error("Nama logo wajib diisi");
    if (!image) return toast.error("Gambar logo wajib diupload");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("store", store);
    formData.append("image", image);
    mutation.mutate(formData);
  };

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
          onClick={() => navigate("/logo-invoice-list")}
          className="hover:text-foreground transition-colors">
          Logo Invoice
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah Logo</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Logo</h1>
          <p className="text-sm text-muted-foreground mt-1">Tambah logo baru untuk invoice.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button type="submit" form="logo-form" disabled={mutation.isLoading} className="gap-2">
            <Save size={18} />
            {mutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <form id="logo-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Nama Logo <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Masukkan nama logo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Gambar Logo <span className="text-destructive">*</span>
            </label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </form>
      </Card>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/logo-invoice-list")}
      />
    </div>
  );
};

export default AddInvoiceLogo;
