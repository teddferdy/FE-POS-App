import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Store,
  Map,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { getAllLocationTable, deleteLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const LocationList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["locations", page, limit, statusFilter],
    () => getAllLocationTable({ page, limit, statusLocation: statusFilter }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteLocation, {
    onSuccess: () => {
      toast.success("Success", { description: "Location deleted successfully" });
      queryClient.invalidateQueries(["locations"]);
    },
    onError: (err) => {
      toast.error("Failed", { description: err.message });
    }
  });

  const locations = data?.data || data?.locations || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const stats = [
    {
      label: "Total Toko",
      value: data?.stats?.total ?? data?.total ?? 0,
      color: "text-foreground"
    },
    {
      label: "Toko Aktif",
      value: data?.stats?.active ?? 0,
      color: "text-green-600 dark:text-green-400"
    },
    {
      label: "Tidak Aktif",
      value: (data?.stats?.total ?? 0) - (data?.stats?.active ?? 0),
      color: "text-white",
      danger: true
    },
    {
      label: "Wilayah Tercover",
      value: data?.stats?.cities ?? 0,
      sub: "Kota",
      color: "text-foreground"
    }
  ];

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      loc.name?.toLowerCase().includes(q) ||
      loc.address?.toLowerCase().includes(q) ||
      loc.storeId?.toLowerCase().includes(q) ||
      loc.phoneNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Kelola Toko</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Lokasi Toko</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar cabang, status operasional, dan informasi kontak toko Anda.
          </p>
        </div>
        <Button onClick={() => navigate("/add-location")} className="shrink-0">
          <Plus size={18} />
          Tambah Toko
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`p-4 ${stat.danger ? "bg-red-600 border-red-600" : ""}`}>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${stat.danger ? "text-red-100" : "text-muted-foreground"}`}>
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              {stat.sub && <span className="text-xs text-muted-foreground">{stat.sub}</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* Table Container */}
      <Card className="overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/30">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Filter berdasarkan ID, Nama, atau Alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Filter size={14} />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <p className="text-xs text-muted-foreground">
              Menampilkan 1-{Math.min(limit, filteredLocations.length)} dari {total} toko
            </p>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
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
                    Store ID
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Image
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Store Name
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Address
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No locations found
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((loc) => (
                    <tr
                      key={loc.id || loc._id}
                      className="hover:bg-accent/30 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          {loc.storeId || loc.code || `ST-${String(loc.id).padStart(3, "0")}`}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                          {loc.image ? (
                            <img
                              src={loc.image}
                              alt={loc.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Store size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {loc.description || loc.type || "Main Branch"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-muted-foreground max-w-[180px] truncate">
                          {loc.address}
                        </p>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-foreground">
                        {loc.phoneNumber || loc.phone || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                              loc.isActive || loc.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                            }`}>
                            {loc.isActive || loc.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => navigate(`/detail-location?id=${loc.id || loc._id}`)}>
                            <Eye size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => navigate(`/edit-location?id=${loc.id || loc._id}`)}>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(loc.id || loc._id)}>
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

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">Baris per halaman:</p>
            <select
              className="bg-background border border-border rounded px-2 py-1 text-xs"
              value={limit}
              disabled>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Map Preview & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-6 h-48 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
          <div className="relative z-10 text-center">
            <Map size={32} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Store Geospatial View</p>
            <p className="text-xs text-muted-foreground mt-1">
              Interact with store locations on a global map
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Buka Peta Interaktif
            </Button>
          </div>
        </div>
        <div className="bg-primary rounded-xl p-5 flex flex-col justify-between text-primary-foreground">
          <div>
            <Lightbulb size={28} className="mb-3 opacity-80" />
            <h4 className="text-base font-semibold mb-1">Tips Manajemen</h4>
            <p className="text-sm opacity-80 leading-relaxed">
              Pastikan informasi kontak selalu terbaru untuk memudahkan operasional antar cabang dan
              koordinasi logistik.
            </p>
          </div>
          <a
            href="#"
            className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity mt-3">
            Pelajari selengkapnya
          </a>
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Lokasi?"
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default LocationList;
