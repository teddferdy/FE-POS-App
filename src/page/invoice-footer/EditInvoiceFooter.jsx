/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { getAllInvoiceFooterByActive, editInvoiceFooter } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const EditInvoiceFooter = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const store = cookie?.user?.store || "";
  const locationParam = store || "";

  const { data, isLoading } = useQuery(
    ["invoice-footers-all"],
    () =>
      getAllInvoiceFooterByActive({
        location: locationParam,
        page: 1,
        limit: 9999,
        status: "",
        isActive: ""
      }),
    { enabled: !!id }
  );

  const footerItem = useMemo(() => {
    if (!data?.data) return null;
    return data.data.find((item) => item.id === id || item._id === id);
  }, [data, id]);

  useEffect(() => {
    if (footerItem) {
      setName(footerItem.name || "");
      setContent(footerItem.content || "");
      setIsActive(footerItem.isActive ?? true);
    }
  }, [footerItem]);

  const updateMutation = useMutation(editInvoiceFooter, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengupdate footer"
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
    updateMutation.mutate({
      id: id || footerItem?.id || footerItem?._id,
      store,
      name,
      content,
      isActive
    });
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID footer tidak ditemukan</p>
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

  if (!footerItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Footer tidak ditemukan</p>
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
          onClick={() => navigate("/footer-invoice-list")}
          className="hover:text-foreground transition-colors">
          Footer Invoice
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Footer</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Footer Invoice</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit data footer invoice.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isLoading} className="gap-2">
            <Save size={18} />
            {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
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
        description="Footer invoice berhasil diupdate."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/footer-invoice-list")}
      />
    </div>
  );
};

export default EditInvoiceFooter;
