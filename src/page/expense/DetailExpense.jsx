import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, Tag, User, Calendar, FileText, CreditCard, Receipt } from "lucide-react";
import { getExpenseById } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

const statusBadge = {
  pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const statusLabel = {
  pending: "Perlu Approve",
  approved: "Disetujui",
  rejected: "Ditolak"
};

const fmtDate = (date) =>
  date ? new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const DetailExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["expense", id],
    () => getExpenseById(id),
    { enabled: !!id }
  );

  if (isLoading) return <Loading fullscreen size="lg" label="Memuat data..." />;

  const item = data?.data;
  if (!item) return <p className="text-center text-muted-foreground py-12">Data tidak ditemukan</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-primary transition-colors">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/expense")} className="hover:text-primary transition-colors">Biaya</button>
            <span>/</span>
            <span className="text-primary font-semibold">Detail</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{item.description || "Biaya"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {item.expenseNumber} &mdash; {fmtDate(item.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/edit-expense?id=${item.id}`)} className="gap-2">
            Edit Biaya
          </Button>
          <Button variant="outline" onClick={() => navigate("/expense")} className="gap-2">
            <ArrowLeft size={16} /> Kembali
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">Informasi Biaya</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nomor Biaya</p>
                <p className="text-sm font-medium">{item.expenseNumber || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || statusBadge.pending}`}>
                  {statusLabel[item.status] || item.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Kategori</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Tag size={14} className="text-muted-foreground" />
                  {item.categoryData?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Jumlah</p>
                <p className="text-lg font-bold text-foreground">Rp {Number(item.amount || 0).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Metode Pembayaran</p>
                <p className="text-sm font-medium flex items-center gap-1 capitalize">
                  <CreditCard size={14} className="text-muted-foreground" />
                  {item.paymentMethod || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tanggal</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} className="text-muted-foreground" />
                  {fmtDate(item.date)}
                </p>
              </div>
            </div>
          </div>

          {item.notes && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText size={16} /> Catatan
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          {item.receipt && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Receipt size={16} /> Bukti
              </h3>
              <img src={item.receipt} alt="Bukti biaya" className="max-w-md rounded-lg border" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Info Waktu</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Dibuat</p>
                <p className="text-sm">{fmtDate(item.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Diubah</p>
                <p className="text-sm">{fmtDate(item.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={16} /> Pembuat
            </h3>
            <p className="text-sm font-medium">{item.creator?.fullName || item.creator?.name || "-"}</p>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Aksi</h3>
            <div className="space-y-3">
              <Button className="w-full" variant="default" onClick={() => navigate(`/edit-expense?id=${item.id}`)}>
                Edit Biaya
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/expense")}>
                Kembali ke Daftar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailExpense;
