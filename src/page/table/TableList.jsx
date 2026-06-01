import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Sofa } from "lucide-react";
import { getTablesByStore, addTable, editTable, deleteTable } from "@/services/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

import Modal from "@/components/organism/modal";

const statusColors = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  occupied: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
};

const statusLabels = {
  available: "Tersedia",
  occupied: "Terisi",
  reserved: "Dipesan"
};

const TableList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const locationParam = user?.store || "";

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCapacity, setFormCapacity] = useState(4);

  const { data, isLoading } = useQuery(
    ["tables", locationParam, page, limit, search],
    () => getTablesByStore({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteTable, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Meja berhasil dihapus" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const saveMutation = useMutation(editTarget ? editTable : addTable, {
    onSuccess: () => {
      toast.success("Berhasil", {
        description: editTarget ? "Meja berhasil diupdate" : "Meja berhasil ditambahkan"
      });
      setEditTarget(null);
      setFormName("");
      setFormCapacity(4);
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const tables = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const openEdit = (table) => {
    setEditTarget(table);
    setFormName(table.name || "");
    setFormCapacity(table.capacity || 4);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error("Nama meja harus diisi");
      return;
    }
    const payload = { store: locationParam, name: formName, capacity: formCapacity };
    if (editTarget) saveMutation.mutate({ id: editTarget.id || editTarget._id, ...payload });
    else saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Daftar Meja</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Meja</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola meja restoran / cafe.</p>
        </div>
        <Button
          onClick={() => {
            setEditTarget(null);
            setFormName("");
            setFormCapacity(4);
          }}
          className="gap-2">
          <Plus size={18} />
          Tambah Meja
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Meja</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Tersedia</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.available ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Terisi</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.occupied ?? 0}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Cari meja..."
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
                    Nama Meja
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Kapasitas
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      <Sofa size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Belum ada meja</p>
                    </td>
                  </tr>
                ) : (
                  tables.map((t, idx) => (
                    <tr key={t.id || t._id || idx} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">
                        {t.name || t.number || `Meja ${t.id}`}
                      </td>
                      <td className="px-4 py-4">{t.capacity || "-"} orang</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || statusColors.available}`}>
                          {statusLabels[t.status] || statusLabels.available}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => openEdit(t)}>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteTarget(t)}>
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
          Menampilkan 1-{Math.min(limit, tables.length)} dari {total} meja
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${page === p ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
                {p}
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
        type="form"
        open={editTarget !== null || (formName && !editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        title={editTarget ? "Edit Meja" : "Tambah Meja"}
        confirmText="Simpan"
        onConfirm={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nama Meja</label>
            <Input
              placeholder="Contoh: Meja 1, VIP A"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Kapasitas</label>
            <Input
              type="number"
              placeholder="4"
              value={formCapacity}
              onChange={(e) => setFormCapacity(Number(e.target.value))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus Meja?"
        description={`Yakin ingin menghapus ${deleteTarget?.name || ""}?`}
        confirmText="Ya, Hapus"
        onConfirm={() => {
          deleteMutation.mutate({ id: deleteTarget.id });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

export default TableList;
