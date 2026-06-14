import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Building2, DollarSign, X, Wallet, Coins } from "lucide-react";
import { getCurrentCashRegister, closeCashRegister } from "@/services/cash-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";

const formatIDR = (num) => {
  if (!num && num !== 0) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const parseIDR = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, "")) || 0;
};

const CashRegisterCurrent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const storeId = cookie?.activeStore || user?.store;

  const [rawClosing, setRawClosing] = React.useState("0");
  const closingBalance = parseIDR(rawClosing);
  const [closeModal, setCloseModal] = React.useState(false);

  const { data, isLoading, refetch } = useQuery(
    ["cash-register-current", storeId],
    () => getCurrentCashRegister(storeId),
    {
      enabled: !!storeId,
      refetchInterval: storeId ? 30000 : false
    }
  );
  const reg = data?.data?.register || data?.data;

  if (!storeId) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            Dashboard
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">Kasir Saat Ini</span>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <Building2 size={64} className="mx-auto text-muted-foreground/40 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Toko Belum Tersedia</h1>
            <p className="text-muted-foreground mb-6">
              Belum ada toko yang terdaftar. Silakan buat toko terlebih dahulu melalui menu Lokasi
              sebelum menggunakan fitur lainnya.
            </p>
            <Button onClick={() => navigate("/add-location")}>
              <Building2 size={16} className="mr-2" /> Buat Toko
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const closeMut = useMutation(
    () =>
      closeCashRegister(reg?.id, {
        storeId,
        closedBy: user?.id,
        closingBalance
      }),
    {
      onSuccess: () => {
        toast.success("Berhasil", { description: "Kasir ditutup" });
        queryClient.invalidateQueries(["cash-register"]);
        setCloseModal(false);
        refetch();
      },
      onError: (err) =>
        toast.error("Gagal", { description: err?.response?.data?.message || err.message })
    }
  );

  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Kasir Saat Ini</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kasir Saat Ini</h1>
          <p className="text-sm text-muted-foreground mt-1">Status shift kasir</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/cash-register/history")}>
            <Wallet size={16} className="mr-1" /> Riwayat
          </Button>
          {!reg && (
            <Button onClick={() => navigate("/cash-register/open-close")}>
              <DollarSign size={16} className="mr-1" /> Buka Kasir
            </Button>
          )}
        </div>
      </div>

      {!reg ? (
        <div className="bg-card p-6 rounded-xl border border-border text-center">
          <Wallet size={48} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Tidak ada kasir yang aktif</p>
          <Button onClick={() => navigate("/cash-register/open-close")} className="mt-4">
            <DollarSign size={16} className="mr-1" /> Buka Kasir
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Informasi Kasir</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Toko", reg.storeData?.name
                    ? {
                        label: reg.storeData.name,
                        sub: [reg.storeData.address, reg.storeData.city].filter(Boolean).join(", ") || null
                      }
                    : { label: reg.storeName || cookie?.activeStoreName || user?.storeName || "-" }],
                  ["Dibuka Oleh", reg.userData?.fullName || "-"],
                  ["Tanggal Buka", new Date(reg.openedAt).toLocaleDateString("id")],
                  ["Jam Buka", new Date(reg.openedAt).toTimeString().slice(0, 8)],
                  ["Saldo Awal", `Rp ${parseInt(reg.openingBalance).toLocaleString("id")}`],
                  [
                    "Total Penjualan",
                    `Rp ${parseInt(data?.data?.currentSales || reg.totalSales || 0).toLocaleString("id")}`
                  ],
                  ["Status", reg.status === "open" ? "Buka" : "Tutup"],
                  ["Catatan", reg.notes || "-"]
                ].map(([l, v]) => (
                  <tr key={l} className="border-b border-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground w-44 align-top">{l}</td>
                    <td className="py-2 font-medium">
                      {typeof v === "object" ? (
                        <div>
                          <div>{v.label}</div>
                          {v.sub && <div className="text-xs text-muted-foreground font-normal">{v.sub}</div>}
                        </div>
                      ) : v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Tutup Kasir</h2>
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Saldo Akhir <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground pointer-events-none">
                      <Coins size={16} />
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatIDR(rawClosing === "0" ? "" : rawClosing)}
                      placeholder="Rp 0"
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "");
                        setRawClosing(cleaned || "0");
                      }}
                      className="pl-10 h-12 text-lg font-semibold tabular-nums"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {closingBalance > 0
                      ? `Tercatat: ${formatIDR(closingBalance)}`
                      : "Masukkan jumlah saldo akhir"}
                  </p>
                </div>
              <Button onClick={() => setCloseModal(true)} variant="destructive">
                <X size={16} className="mr-1" /> Tutup Kasir
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        type="confirm"
        open={closeModal}
        onOpenChange={(o) => !o && setCloseModal(false)}
        title="Tutup Kasir?"
        description={`Pastikan saldo akhir (${formatIDR(closingBalance)}) sudah benar. Kasir tidak bisa dibuka kembali.`}
        confirmText="Ya, Tutup"
        onConfirm={() => closeMut.mutate()}
      />
    </div>
  );
};

export default CashRegisterCurrent;
