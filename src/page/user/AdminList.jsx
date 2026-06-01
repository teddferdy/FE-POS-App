import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";

const statusConfig = {
  active: {
    dot: "bg-green-500",
    bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    label: "Active"
  },
  inactive: {
    dot: "bg-muted-foreground",
    bg: "bg-muted text-muted-foreground border border-border",
    label: "Inactive"
  },
  pending: {
    dot: "bg-amber-500",
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    label: "Pending"
  }
};

const getStatus = (user) => {
  if (user.status === "pending" || user.isActive === null) return statusConfig.pending;
  if (user.isActive || user.status === "active") return statusConfig.active;
  return statusConfig.inactive;
};

const roleColors = {
  super_admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
  admin:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  supervisor:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  manager: "bg-surface-container-high text-on-surface text-label-md font-label-md"
};

const getRoleClass = (role) => {
  return roleColors[role?.toLowerCase()] || "bg-muted text-muted-foreground border border-border";
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const avatarBg = (name) => {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AdminList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery(
    ["admins", page, limit, search],
    () => getAllUsers({ page, limit, search }),
    { keepPreviousData: true }
  );

  const users = data?.data || data?.users || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const stats = [
    {
      icon: "groups",
      label: "Total Admin",
      value: data?.stats?.total || total || 0,
      badge: "+4 bulan ini",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-700 dark:text-blue-300"
    },
    {
      icon: "verified_user",
      label: "Admin Aktif",
      value: data?.stats?.active || 0,
      badge: `${total > 0 ? Math.round(((data?.stats?.active || 0) / (data?.stats?.total || total || 1)) * 100) : 0}% Aktif`,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-700 dark:text-green-300"
    },
    {
      icon: "pending_actions",
      label: "Menunggu Aktivasi",
      value: data?.stats?.pending || 0,
      badge: "Perlu Tindakan",
      iconBg: "bg-red-100",
      iconColor: "text-red-700"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>Manajemen</span>
            <span>/</span>
            <span className="text-primary font-semibold">Kelola Admin</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Administrasi Sistem</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atur hak akses dan profil administrator di seluruh cabang toko.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 
          <Button variant="outline" onClick={() => navigate("/role-management")} className="gap-2">
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Manajemen Role
          </Button>
          */}
          <Button
            onClick={() => navigate("/add-user")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Tambah Admin Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${stat.iconBg} rounded-lg`}>
                <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
              </div>
              <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                {stat.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <h4 className="text-base font-semibold text-foreground">Daftar Administrator</h4>
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                search
              </span>
              <Input
                placeholder="Cari admin atau toko..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 w-60 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <span className="material-symbols-outlined text-base">download</span>
              Ekspor CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Nama Admin
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Toko Ditugaskan
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Peran
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">
                        admin_panel_settings
                      </span>
                      Tidak ada administrator ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const status = getStatus(user);
                    const role = user.role || user.type || "admin";
                    return (
                      <tr
                        key={user.id || user._id}
                        className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full ${avatarBg(user.name || user.username)} flex items-center justify-center text-sm font-bold`}>
                              {getInitials(user.name || user.username)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {user.name || user.username}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-muted-foreground text-base">
                              location_on
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {user.storeName || user.locationName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleClass(role)}`}>
                            {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.status === "pending" || user.isActive === null ? (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1 bg-primary text-primary-foreground hover:brightness-110 border-0">
                                Aktifkan
                              </Button>
                              <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-lg">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Menampilkan {users.length} dari {total} Administrator
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-muted-foreground text-sm">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-10 h-10 rounded-lg hover:bg-muted text-muted-foreground text-sm font-semibold transition-colors">
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 relative overflow-hidden group">
          <div className="relative z-10 max-w-md">
            <h5 className="text-xl font-semibold text-foreground mb-3">Keamanan Administrator</h5>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Selalu pastikan verifikasi 2-faktor aktif untuk semua akun administrator dengan akses
              ke laporan global. Anda dapat meninjau log aktivitas admin di modul Pengaturan Sistem.
            </p>
            <Button variant="link" className="gap-2 p-0 h-auto text-primary font-semibold">
              Pelajari Protokol Keamanan
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Button>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px] text-primary">
              shield_person
            </span>
          </div>
        </div>
        <div className="lg:col-span-2 p-8 rounded-2xl bg-foreground text-background border border-border flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-4xl mb-4 opacity-80">auto_awesome</span>
            <h5 className="text-lg font-semibold mb-2">Bantuan Cepat</h5>
            <p className="text-sm opacity-70 leading-snug">
              Butuh bantuan dalam mengelola izin akses karyawan? Tim support kami tersedia 24/7
              untuk membantu integrasi POS antar cabang.
            </p>
          </div>
          <button className="mt-6 w-full py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-semibold">
            Hubungi Customer Success
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminList;
