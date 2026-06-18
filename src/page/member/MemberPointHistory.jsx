import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMemberById, getMemberPointHistory } from "@/services/member";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

const MemberPointHistory = () => {
  const { t } = useTranslation();
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
  const transactions = member?.transactions || [];
  const name = member?.name || "-";
  const points = member?.points ?? member?.totalPoints ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/member-list")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Kembali ke Member List
          </button>
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <p className="text-sm text-muted-foreground">
            Total Poin: <span className="font-semibold text-foreground">{points.toLocaleString()}</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-card rounded-xl border border-border shadow-sm">
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
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Store</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Total Amount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">receipt_long</span>
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
                          ? new Date(trx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "-"}
                        {trx.time && <>, <span className="text-xs">{trx.time}</span></>}
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
          <div className="overflow-x-auto">
            {pointLoading ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {["Tanggal", "Deskripsi", "Poin", "Saldo"].map((_, i) => (
                      <th key={i} className="px-4 py-3"><Skeleton className="h-3 w-16" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...Array(4)].map((_, r) => (
                    <tr key={r}>
                      {[...Array(4)].map((_, c) => (
                        <td key={c} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Poin</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(pointData?.data || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        <span className="material-symbols-outlined text-4xl block mb-2">stars</span>
                        <p className="text-sm">Belum ada aktivitas poin</p>
                      </td>
                    </tr>
                  ) : (
                    (pointData?.data || []).map((pt, idx) => (
                      <tr key={pt.id || idx} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {pt.date || pt.createdAt
                            ? new Date(pt.date || pt.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {pt.description || pt.reason || "-"}
                        </td>
                        <td className={`px-4 py-3 text-sm font-bold text-right ${pt.points > 0 ? "text-green-600" : "text-red-600"}`}>
                          {pt.points > 0 ? "+" : ""}{pt.points?.toLocaleString() || 0}
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
            <div className="px-4 py-3 border-t border-border flex justify-between items-center bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Menampilkan {(pointData?.data || []).length} dari {pointData?.pagination?.total || pointData?.total || 0} aktivitas poin
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPointPage(Math.max(1, pointPage - 1))}
                  disabled={pointPage <= 1}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPointPage(pointPage + 1)}
                  disabled={pointPage >= (pointData?.pagination?.totalPages || 1)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MemberPointHistory;
