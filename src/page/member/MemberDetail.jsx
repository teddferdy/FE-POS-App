import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMemberById, getMemberPointHistory } from "@/services/member";
import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import { Loading } from "@/components/ui/loading";

const levelConfig = {
  platinum: {
    bg: "bg-primary/10 text-primary border border-primary/20",
    icon: "stars",
    label: "Platinum"
  },
  gold: {
    bg: "bg-tertiary/10 text-tertiary border border-tertiary/20",
    icon: "stars",
    label: "Gold"
  },
  silver: {
    bg: "bg-secondary/10 text-secondary border border-secondary/20",
    icon: "stars",
    label: "Silver"
  }
};

const getLevel = (level) => {
  return levelConfig[level?.toLowerCase()] || levelConfig.silver;
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
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700"
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

const MemberDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("transactions");
  const [pointPage, setPointPage] = useState(1);

  const { data, isLoading } = useQuery(["member-detail", id], () => getMemberById({ id }), {
    enabled: !!id
  });

  const { data: pointData, isLoading: pointLoading } = useQuery(
    ["member-point-history", id, pointPage],
    () => getMemberPointHistory({ id, page: pointPage }),
    { enabled: !!id, keepPreviousData: true }
  );

  const member = data?.data || data?.member || data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-5xl">groups</span>
        <p>Member tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/member-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  const level = getLevel(member.level);
  const name = member.name || "-";
  const transactions = member.transactions || [];
  const totalTransactions = member.totalTransactions || transactions.length || 0;
  const totalSpent = member.totalSpent || 0;
  const visitFrequency = member.visitFrequency || 0;
  const averageSpending = member.averageSpending || 0;
  const points = member.points ?? member.totalPoints ?? 0;
  const nextTier = member.nextTier || "Diamond";
  const pointsRemaining = member.pointsRemaining || 4580;
  const expiringPoints = member.expiringPoints || 1200;
  const expiringDate = member.expiringDate || "31 Dec 2023";
  const memberId = member.memberId || member.code || "-";
  const phone = member.phone || member.phoneNumber || "-";
  const email = member.email || "-";
  const address = member.address || "-";
  const joinDate = member.joinDate || member.createdAt || "-";
  const formattedJoinDate =
    joinDate !== "-"
      ? new Date(joinDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "-";

  const stats = [
    {
      label: "Total Transaksi",
      value: formatCurrency(totalSpent),
      icon: "payments",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trend: "+12% vs last month",
      trendIcon: "trending_up",
      trendColor: "text-secondary"
    },
    {
      label: "Frekuensi Kunjungan",
      value: `${visitFrequency} kali`,
      icon: "calendar_month",
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
      trend: `${member.weeklyVisits || 0} visits this week`,
      trendIcon: "trending_up",
      trendColor: "text-secondary"
    },
    {
      label: "Rata-rata Belanja",
      value: formatCurrency(averageSpending),
      icon: "shopping_bag",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      trend: "Stable performance",
      trendIcon: "remove",
      trendColor: "text-on-surface-variant"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
            <span>Kelola Pelanggan</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <button
              onClick={() => navigate("/member-list")}
              className="hover:text-primary transition-colors">
              Daftar Member
            </button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-semibold">Detail Member</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Detail Member: {name}
          </h2>
        </div>
        <Button
          onClick={() => navigate(`/add-member?id=${id}`)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-lg">edit</span>
          Edit Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className={`w-24 h-24 rounded-full border-4 border-background shadow-md ${avatarBg(name)} flex items-center justify-center text-2xl font-bold`}>
                {getInitials(name)}
              </div>
              <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1 border-2 border-card">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center">{name}</h3>
            <p className="text-sm font-mono text-muted-foreground mb-3">{memberId}</p>
            <span className="px-3 py-1 bg-primary-fixed text-primary-fixed-foreground rounded-full text-xs font-bold mb-4">
              Member Active
            </span>
            <div className="w-full space-y-4 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground text-base">
                  calendar_today
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Joined Date</span>
                  <span className="text-sm font-medium">{formattedJoinDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground text-base">
                  mail
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Email Address</span>
                  <span className="text-sm font-medium">{email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground text-base">
                  call
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Phone Number</span>
                  <span className="text-sm font-medium">{phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground text-base">
                  location_on
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <span className="text-sm font-medium">{address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="bg-foreground text-background p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed-dim">
                  workspace_premium
                </span>
                <span className="text-sm font-semibold">Membership Status</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${level.bg}`}>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {level.icon}
                </span>
                {level.label}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Points
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {points.toLocaleString()} Pts
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min(80, (points / (points + pointsRemaining)) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Next Tier: <span className="font-bold">{nextTier}</span> (
                  {pointsRemaining.toLocaleString()} pts remaining)
                </p>
              </div>
              <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-base">
                  notification_important
                </span>
                <div>
                  <p className="text-xs font-bold text-on-error-container">Points expiring soon</p>
                  <p className="text-xs text-error">
                    {expiringPoints.toLocaleString()} points expire on {expiringDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card p-4 rounded-xl border border-border shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground block mb-3">
                  {stat.label}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                  <div className={`${stat.iconBg} ${stat.iconColor} p-2 rounded-lg`}>
                    <span className="material-symbols-outlined text-base">{stat.icon}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center">
                  <span className={`material-symbols-outlined text-sm mr-1 ${stat.trendColor}`}>
                    {stat.trendIcon}
                  </span>
                  <span className={`text-xs font-semibold ${stat.trendColor}`}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="flex border-b border-border px-4">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "transactions"
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}>
                Riwayat Transaksi
              </button>
              <button
                onClick={() => setActiveTab("points")}
                className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "points"
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}>
                Aktivitas Poin
              </button>
            </div>

            {activeTab === "transactions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                        Total Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          <span className="material-symbols-outlined text-4xl block mb-2">
                            receipt_long
                          </span>
                          Tidak ada transaksi ditemukan
                        </td>
                      </tr>
                    ) : (
                      transactions.map((trx, idx) => (
                        <tr key={trx.id || idx} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-foreground">
                            {trx.code || trx.invoice || `#TRX-${idx.toString().padStart(8, "0")}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {trx.date
                              ? new Date(trx.date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })
                              : "-"}
                            {trx.time && (
                              <>
                                , <span className="text-xs">{trx.time}</span>
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {trx.store || trx.storeName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground text-right">
                            {formatCurrency(trx.amount || trx.total || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">
                              {trx.status || "Completed"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-all">
                              <span className="material-symbols-outlined text-lg">receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "points" && (
              <>
                <div className="overflow-x-auto">
                  {pointLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loading />
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Deskripsi
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                            Poin
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                            Saldo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(pointData?.data || []).length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-12 text-center text-muted-foreground">
                              <Stars size={36} className="mx-auto mb-2 opacity-30" />
                              <p className="text-sm">Belum ada aktivitas poin</p>
                            </td>
                          </tr>
                        ) : (
                          (pointData?.data || []).map((pt, idx) => (
                            <tr key={pt.id || idx} className="hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {pt.date || pt.createdAt
                                  ? new Date(pt.date || pt.createdAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric"
                                    })
                                  : "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                {pt.description || pt.reason || "-"}
                              </td>
                              <td
                                className={`px-4 py-3 text-sm font-bold text-right ${pt.points > 0 ? "text-green-600" : "text-red-600"}`}>
                                {pt.points > 0 ? "+" : ""}
                                {pt.points?.toLocaleString() || 0}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-right text-foreground">
                                {pt.balance?.toLocaleString() || "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-border flex justify-between items-center bg-muted/10">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan {(pointData?.data || []).length} dari{" "}
                    {pointData?.pagination?.total || pointData?.total || 0} aktivitas poin
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPointPage(Math.max(1, pointPage - 1))}
                      disabled={pointPage <= 1}
                      className="p-1.5 border border-border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
                      {pointPage}
                    </button>
                    <button
                      onClick={() => setPointPage(pointPage + 1)}
                      disabled={pointPage >= (pointData?.pagination?.totalPages || 1)}
                      className="p-1.5 border border-border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "transactions" && (
              <div className="px-4 py-3 border-t border-border flex justify-between items-center bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Showing {transactions.length} of {totalTransactions} transactions
                </p>
                <div className="flex gap-1">
                  <button className="p-1.5 border border-border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
                    1
                  </button>
                  <button className="px-3 py-1.5 text-foreground hover:bg-muted rounded-lg text-sm">
                    2
                  </button>
                  <button className="px-3 py-1.5 text-foreground hover:bg-muted rounded-lg text-sm">
                    3
                  </button>
                  <button className="p-1.5 border border-border rounded-lg hover:bg-muted text-muted-foreground">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
