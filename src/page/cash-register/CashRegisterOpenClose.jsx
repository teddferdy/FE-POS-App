import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  DollarSign,
  X,
  Wallet,
  Coins,
  Landmark,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { openCashRegister } from "@/services/cash-register";
import { getAllLocation } from "@/services/location";
import { getWhatsAppStatus, restartWhatsApp } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const formatIDR = (num) => {
  if (!num && num !== 0) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const parseIDR = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, "")) || 0;
};

const quickAmounts = [100000, 200000, 500000, 1000000, 2000000, 5000000];

const CashRegisterOpenClose = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locationsData } = useQuery(["allLocations"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const locations = locationsData?.data || [];

  const [selectedStore, setSelectedStore] = useState(cookie?.activeStore || user?.store || "");
  const [rawBalance, setRawBalance] = useState("0");
  const [notes, setNotes] = useState("");

  const numericBalance = parseIDR(rawBalance);

  const waStoreId = isSuperAdmin ? selectedStore : cookie?.activeStore || user?.store || "default";

  const { data: waStatus, refetch: refetchWa, isFetching: waLoading } = useQuery(
    ["wa-status", waStoreId],
    () => getWhatsAppStatus(waStoreId),
    { refetchInterval: 5000, enabled: !!waStoreId }
  );
  const waData = waStatus?.data;
  const waReady = waData?.ready;
  const waQR = waData?.qrBase64;

  const restartWaMut = useMutation(() => restartWhatsApp(waStoreId), {
    onSuccess: () => {
      toast.info("WhatsApp client restarting, QR akan muncul dalam beberapa detik");
      setTimeout(() => refetchWa(), 2000);
    },
    onError: (err) => toast.error(err?.response?.data?.message || err.message)
  });

  const openMut = useMutation(
    () =>
      openCashRegister({
        storeId: parseInt(selectedStore),
        openedBy: user?.id,
        openingBalance: numericBalance,
        notes
      }),
    {
      onSuccess: () => {
        toast.success(t("page.cashRegister.openClose.success"), {
          description: t("page.cashRegister.openClose.openedDesc")
        });
        queryClient.invalidateQueries(["cash-register"]);
        navigate("/cash-register/current");
      },
      onError: (err) =>
        toast.error(t("page.cashRegister.openClose.fail"), {
          description: err?.response?.data?.message || err.message
        })
    }
  );

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("page.cashRegister.openClose.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.cashRegister.openClose.breadcrumb")}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("page.cashRegister.openClose.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.cashRegister.openClose.desc")}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Wallet size={20} />
            <span className="text-sm">{user?.name || user?.username}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent px-6 py-5 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Landmark size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">
                    {t("page.cashRegister.openClose.openingBalanceTitle")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("page.cashRegister.openClose.openingBalanceDesc")}
                  </p>
                </div>
              </div>
              {isSuperAdmin && (
                <div className="shrink-0 w-full sm:w-56">
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8">
                    <option value="" disabled>
                      {t("page.cashRegister.openClose.selectStore")}
                    </option>
                    {locations?.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("page.cashRegister.openClose.amountLabel")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground pointer-events-none">
                      <Coins size={16} />
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatIDR(rawBalance === "0" ? "" : rawBalance)}
                      placeholder={t("page.cashRegister.openClose.placeholder")}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "");
                        setRawBalance(cleaned || "0");
                      }}
                      className="pl-10 h-12 text-lg font-semibold tabular-nums"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {numericBalance > 0
                      ? `${t("page.cashRegister.openClose.recorded")} ${formatIDR(numericBalance)}`
                      : t("page.cashRegister.openClose.enterOpeningBalance")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-normal">
                    {t("page.cashRegister.openClose.quickSelect")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setRawBalance(String(amount))}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          numericBalance === amount
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                        }`}>
                        {formatIDR(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("page.cashRegister.openClose.notesLabel")}
                  </Label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-shadow resize-none"
                    placeholder={t("page.cashRegister.openClose.notesPlaceholder")}
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard-super-admin")}
                    className="gap-1.5">
                    <X size={16} /> {t("page.cashRegister.openClose.cancel")}
                  </Button>
                  <Button
                    onClick={() => openMut.mutate()}
                    disabled={openMut.isLoading || numericBalance <= 0}
                    className="gap-1.5">
                    <DollarSign size={16} />
                    {openMut.isLoading
                      ? t("page.cashRegister.openClose.opening")
                      : t("page.cashRegister.openClose.openWithAmount", {
                          amount: formatIDR(numericBalance)
                        })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WA Connection Status */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-primary" />
              <h2 className="font-semibold text-sm">WhatsApp</h2>
              {isSuperAdmin && waStoreId && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({waStoreId})
                </span>
              )}
            </div>
            {waLoading ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Loading...
              </span>
            ) : waReady ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} />
                Terhubung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                <AlertCircle size={12} />
                Belum Terhubung
              </span>
            )}
          </div>
          <div className="p-6">
            {waLoading && !waData ? (
              <p className="text-sm text-muted-foreground text-center">Memuat status WhatsApp...</p>
            ) : waReady ? (
              <p className="text-sm text-muted-foreground">
                WhatsApp terhubung — invoice bisa dikirim langsung dari POS.
              </p>
            ) : waQR ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={waQR}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48 border border-border rounded-lg"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Scan QR code ini dengan WhatsApp kamu untuk menghubungkan.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restartWaMut.mutate()}
                  loading={restartWaMut.isLoading}>
                  <RefreshCw size={14} className="mr-1" />
                  QR Tidak Muncul? Klik Refresh
                </Button>
              </div>
            ) : waData?.error ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-destructive text-center">{waData.error}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground text-center">Menunggu QR code...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CashRegisterOpenClose;
