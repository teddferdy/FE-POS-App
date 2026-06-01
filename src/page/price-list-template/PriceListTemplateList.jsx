import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { getAllPriceListTemplate, deletePriceListTemplate } from "@/services/price-list-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const PriceListTemplateList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const role = user?.role || user?.roleType || "";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["price-list-templates", page, limit, search],
    () => getAllPriceListTemplate({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deletePriceListTemplate, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Template harga berhasil dihapus" });
      queryClient.invalidateQueries(["price-list-templates"]);
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
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Template Harga</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Template Harga</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola template harga untuk tingkatan harga (Grosir, Member, dll.).
          </p>
        </div>
        <Button onClick={() => navigate("/add-price-list-template")} className="gap-2">
          <Plus size={18} />
          Tambah Template
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Template</p>
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
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari template..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9 h-10"
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loading /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Nama Template</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Tingkatan Harga</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Deskripsi</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Tidak ada template ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id || item._id || index} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">{item.name || "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(item.tiers || []).map((tier, i) => (
                            <span key={i} className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                              {tier.name}
                            </span>
                          ))}
                          {(!item.tiers || item.tiers.length === 0) && <span className="text-muted-foreground text-xs">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground max-w-[250px] truncate">{item.description || "-"}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-primary"
                            onClick={() => navigate(`/edit-price-list-template?id=${item.id || item._id}`)}>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive"
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
          Menampilkan 1-{Math.min(limit, items.length)} dari {total} template
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
        title="Hapus Template?"
        description={`Yakin ingin menghapus template ${deleteTarget?.name || ""}?`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PriceListTemplateList;
