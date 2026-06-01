import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Percent, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllTaxConfig, deleteTaxConfig } from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const typeColors = {
  PPN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PPh: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Non-Pajak": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
};

const TaxConfigList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  // const role = user?.role || user?.roleType || "";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["tax-configs", page, limit, search],
    () => getAllTaxConfig({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteTaxConfig, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Pajak berhasil dihapus" });
      queryClient.invalidateQueries(["tax-configs"]);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const items = data?.data || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
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
        <span className="text-primary font-semibold">Konfigurasi Pajak</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Konfigurasi Pajak</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola tarif pajak untuk produk dan transaksi.
          </p>
        </div>
        <Button onClick={() => navigate("/add-tax")} className="gap-2">
          <Plus size={18} />
          Tambah Pajak
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Pajak</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Tidak Aktif</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.inactive ?? 0}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Cari pajak..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Nama Pajak
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Tarif
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <Percent size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Tidak ada pajak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id || item._id || index}
                      className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">{item.name || "-"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[item.type] || typeColors["Non-Pajak"]}`}>
                          {item.type || "Non-Pajak"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-foreground">{item.rate ?? 0}%</span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground max-w-[250px] truncate">
                        {item.description || "-"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => navigate(`/edit-tax?id=${item.id || item._id}`)}>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(item)}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Menampilkan 1-{Math.min(limit, items.length)} dari {total} pajak
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                  page === pageNum
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}>
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Pajak?"
        description={`Yakin ingin menghapus pajak ${deleteTarget?.name || ""}?`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default TaxConfigList;
