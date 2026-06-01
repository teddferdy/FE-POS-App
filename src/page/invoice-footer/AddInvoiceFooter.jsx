/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { addInvoiceFooter } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";

const AddInvoiceFooter = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const store = cookie?.user?.store || "";

  const createMutation = useMutation(addInvoiceFooter, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan footer"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Validasi", { description: "Nama footer wajib diisi" });
      return;
    }
    if (!content.trim()) {
      toast.error("Validasi", { description: "Konten footer wajib diisi" });
      return;
    }
    createMutation.mutate({ store, name, content, isActive });
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
          onClick={() => navigate("/footer-invoice-list")}
          className="hover:text-foreground transition-colors">
          Footer Invoice
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah Footer</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Footer Invoice</h1>
          <p className="text-sm text-muted-foreground mt-1">Tambah footer invoice baru.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isLoading} className="gap-2">
            <Save size={18} />
            {createMutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Nama Footer <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Masukkan nama footer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Konten <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Masukkan konten footer (HTML / teks)"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium block">Status Aktif</label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
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
        onConfirm={() => navigate("/footer-invoice-list")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Footer invoice berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/footer-invoice-list")}
      />
    </div>
  );
};

export default AddInvoiceFooter;
