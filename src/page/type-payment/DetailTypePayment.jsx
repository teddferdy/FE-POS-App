import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit, CreditCard } from "lucide-react";
import { getTypePaymentById } from "@/services/type-payment";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "-";
  }
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const DetailTypePayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["type-payment-detail", paymentId],
    () => getTypePaymentById(paymentId),
    { enabled: !!paymentId }
  );

  const item = data?.data || {};

  if (!paymentId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <CreditCard size={48} className="opacity-40" />
        <p>ID pembayaran tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/type-payment-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!item || !item.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <CreditCard size={48} className="opacity-40" />
        <p>Metode pembayaran tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/type-payment-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  const isActive =
    item.status === "Aktif" ||
    item.status === true ||
    item.status === "active" ||
    item.isActive === true;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/type-payment-list")}
          className="hover:text-foreground transition-colors">
          Metode Pembayaran
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{item.name}</span>
      </nav>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CreditCard size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  {isActive ? "Aktif" : "Non-Aktif"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.type || item.tipe || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipe
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{item.type || item.tipe || "-"}</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 shrink-0">
              <span className="text-sm font-bold">{isActive ? "A" : "N"}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {isActive ? "Aktif" : "Non-Aktif"}
              </p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="text-sm font-bold">#</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ID
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">
                #{String(item.id).padStart(3, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {item.deskripsi && (
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Deskripsi
          </p>
          <p className="text-sm text-foreground">{item.deskripsi}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Informasi Sistem
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Dibuat Pada</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {formatDate(item.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Diperbarui Pada</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {formatDate(item.updatedAt || item.updated_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/type-payment-list")} className="gap-2">
          <ArrowLeft size={16} />
          Kembali
        </Button>
        {!item.isSystem && (
          <Button
            onClick={() => navigate(`/edit-type-payment?id=${item.id}`)}
            className="gap-2 shadow-md">
            <Edit size={16} />
            Edit
          </Button>
        )}
      </div>
    </div>
    </motion.div>
  );
};

export default DetailTypePayment;
