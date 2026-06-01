/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { getAllInvoiceLogo, editInvoiceLogo } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const EditInvoiceLogo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["invoice-logos-all"],
    () => getAllInvoiceLogo({ location: locationParam, page: 1, limit: 9999 }),
    { enabled: !!id }
  );

  const logoItem = data?.data?.find((item) => item.id === id || item._id === id);

  useEffect(() => {
    if (logoItem) {
      setName(logoItem.name || "");
      setCurrentImage(logoItem.image || logoItem.logo || "");
    }
  }, [logoItem]);

  const mutation = useMutation(editInvoiceLogo, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Logo berhasil diperbarui" });
      navigate("/logo-invoice-list");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Gagal memperbarui logo");
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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("id", id);
    if (image) formData.append("image", image);
    mutation.mutate(formData);
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID logo tidak ditemukan</p>
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

  if (!logoItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Logo tidak ditemukan</p>
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
          onClick={() => navigate("/logo-invoice-list")}
          className="hover:text-foreground transition-colors">
          Logo Invoice
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Logo</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Logo</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit logo invoice.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button
            type="submit"
            form="edit-logo-form"
            disabled={mutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {mutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <form id="edit-logo-form" onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-medium block">Gambar Logo</label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {(preview || currentImage) && (
              <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img
                  src={preview || currentImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
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

export default EditInvoiceLogo;
