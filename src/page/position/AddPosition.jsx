import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { addPosition } from "@/services/position";
import { getAllDepartment } from "@/services/department";
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

const AddPosition = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({});

  const { data: departmentsData } = useQuery(["departments-all"], () => getAllDepartment(), {
    staleTime: 5 * 60 * 1000
  });
  const departments = departmentsData?.data || departmentsData?.departments || [];

  const createMutation = useMutation(addPosition, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Jabatan berhasil ditambahkan" });
      queryClient.invalidateQueries(["positions"]);
      navigate("/position-list");
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Nama jabatan wajib diisi";
    if (!department) errs.department = "Departemen wajib dipilih";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      name: name.trim(),
      department,
      description: description.trim(),
      isActive
    });
  };

  return (
    <div className="space-y-8">
      <div className="mb-xl">
        <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
          <span>Manajemen SDM</span>
          <span>/</span>
          <button
            onClick={() => navigate("/position-list")}
            className="hover:text-primary transition-colors">
            Kelola Jabatan
          </button>
          <span>/</span>
          <span className="text-primary font-semibold">Tambah Jabatan Baru</span>
        </nav>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Tambah Jabatan Baru</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Definisikan peran baru dan atur level akses keamanan untuk operasional sistem.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nama Jabatan <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                  badge
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Senior Supervisor"
                  className="pl-9"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Departemen <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                {departments.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-primary text-[28px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          domain
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">Belum ada departemen</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tambah departemen terlebih dahulu
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/add-department")}
                      className="gap-2">
                      <span className="material-symbols-outlined text-base">add</span>
                      Tambah Departemen
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Pilih Departemen" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 mt-0.5"
                      onClick={() => navigate("/add-department")}
                      title="Tambah Departemen Baru">
                      <span className="material-symbols-outlined text-base">add</span>
                    </Button>
                  </div>
                )}
              </div>
              {errors.department && (
                <p className="text-xs text-destructive mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Deskripsi Jabatan
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan detail tanggung jawab dan cakupan kerja untuk jabatan ini..."
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
                  {isActive ? "Jabatan ini aktif dan dapat digunakan" : "Jabatan ini tidak aktif"}
                </p>
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3 border-l-4 border-tertiary">
          <span className="material-symbols-outlined text-tertiary shrink-0">info</span>
          <div>
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">
              Catatan Keamanan
            </h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Penambahan jabatan baru akan dicatat dalam audit log sistem. Pastikan pemberian level
              akses sesuai dengan kebijakan keamanan perusahaan untuk menghindari penyalahgunaan
              data sensitif.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/position-list")}
            className="gap-2">
            <span className="material-symbols-outlined text-lg">close</span>
            Batal
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isLoading}
            className="gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">save</span>
            Simpan Jabatan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPosition;
