import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { addDepartment } from "@/services/department";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const AddDepartment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const createMutation = useMutation(addDepartment, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Departemen berhasil ditambahkan" });
      queryClient.invalidateQueries(["departments"]);
      navigate("/department-list");
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Nama departemen wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      isActive
    });
  };

  return (
    <div className="space-y-8">
      <div className="mb-xl">
        <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
          <span>Kelola Karyawan</span>
          <span>/</span>
          <button
            onClick={() => navigate("/department-list")}
            className="hover:text-primary transition-colors">
            Kelola Departemen
          </button>
          <span>/</span>
          <span className="text-primary font-semibold">Tambah Departemen Baru</span>
        </nav>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Tambah Departemen Baru
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tambahkan unit atau divisi baru dalam struktur organisasi perusahaan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nama Departemen <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                  domain
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Research & Development"
                  className="pl-9"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Deskripsi Departemen
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan fungsi dan tanggung jawab departemen ini..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
              isActive
                ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
            }`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? "bg-green-600 text-white" : "bg-destructive/10 text-destructive"
                }`}>
                <span className="material-symbols-outlined text-lg">
                  {isActive ? "check" : "close"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Status {isActive ? "Aktif" : "Nonaktif"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? "Departemen ini aktif dan dapat digunakan"
                    : "Departemen ini tidak aktif"}
                </p>
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/department-list")}
            className="gap-2">
            <span className="material-symbols-outlined text-lg">close</span>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isLoading}
            className="gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">save</span>
            Simpan Departemen
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddDepartment;
