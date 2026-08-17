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
import { openCashRegister, getOpenRegisters } from "@/services/cash-register";
import { getAllLocation } from "@/services/location";
import { getWhatsAppStatus, restartWhatsApp } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";

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

  const { data: locationsData, isLoading: locationsLoading } = useQuery(
    ["allLocations"],
    () => getAllLocation(),
    { enabled: isSuperAdmin }
  );
  const locations = locationsData?.data || [];

  const { data: openRegistersData, isLoading: openRegistersLoading } = useQuery(
    ["open-registers"],
    () => getOpenRegisters(),
    { enabled: isSuperAdmin }
  );
  const openRegisters = openRegistersData?.data || [];
  const openStoreIds = new Set(openRegisters.map((r) => Number(r.store)));
  const storeLoading = isSuperAdmin && (locationsLoading || openRegistersLoading);

  const storeOptions = locations.map((loc) => {
    const isOpen = openStoreIds.has(Number(loc.id));
    return {
      value: loc.id,
      label: isOpen ? `${loc.name} ${t("page.cashRegister.openClose.storeOpenBadge")}` : loc.name
    };
  });

  const [selectedStore, setSelectedStore] = useState(cookie?.activeStore || user?.store || "");
  const [rawBalance, setRawBalance] = useState("0");
  const [notes, setNotes] = useState("");
  const [cancelModal, setCancelModal] = useState(false);

  const selectedStoreIsOpen = openStoreIds.has(Number(selectedStore));

  const numericBalance = parseIDR(rawBalance);

  const waStoreId = isSuperAdmin ? selectedStore : cookie?.activeStore || user?.store || "default";

  const {
    data: waStatus,
    refetch: refetchWa,
    isFetching: waLoading
  } = useQuery(["wa-status", waStoreId], () => getWhatsAppStatus(waStoreId), {
    refetchInterval: 5000,
    enabled: !!waStoreId
  });
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
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 max-w-[1440px] mx-auto w-full">
        <PageHeader
          backLink="/dashboard-super-admin"
          onBack={() => setCancelModal(true)}
          breadcrumbs={[
            {
              href: "/dashboard-super-admin",
              i18nKey: "page.cashRegister.openClose.breadcrumbDashboard"
            },
            { i18nKey: "page.cashRegister.openClose.breadcrumb" }
          ]}
          title={t("page.cashRegister.openClose.title")}
          description={t("page.cashRegister.openClose.desc")}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet size={18} />
            <span className="text-sm font-medium whitespace-nowrap">
              {user?.name || user?.username}
            </span>
          </div>
        </PageHeader>

        {/* Opening Balance Card */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/[0.03] to-transparent px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
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
                <div className="w-full lg:w-64 xl:w-72 shrink-0">
                  {storeLoading ? (
                    <Skeleton className="h-10 w-full rounded-md" />
                  ) : (
                    <>
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("page.cashRegister.openClose.selectStore")}
                      </Label>
                      <Combobox
                        options={storeOptions}
                        value={selectedStore}
                        onChange={setSelectedStore}
                        placeholder={t("page.cashRegister.openClose.selectStore")}
                        searchPlaceholder="Cari toko..."
                        className="mt-1.5"
                      />
                      {selectedStoreIsOpen && (
                        <p className="mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1">
                          <AlertCircle size={12} className="shrink-0" />
                          {t("page.cashRegister.openClose.storeOpenWarning")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 xl:gap-8">
              <div className="space-y-5 xl:col-span-3">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setRawBalance(String(amount))}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
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

              <div className="space-y-5 xl:col-span-2">
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
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard-super-admin")}
                    className="w-full sm:w-auto gap-1.5">
                    <X size={16} /> {t("page.cashRegister.openClose.cancel")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedStoreIsOpen) {
                        toast.error(t("page.cashRegister.openClose.fail"), {
                          description: t("page.cashRegister.openClose.storeOpenError")
                        });
                        return;
                      }
                      openMut.mutate();
                    }}
                    disabled={openMut.isLoading || numericBalance <= 0 || !selectedStore}
                    className="w-full sm:w-auto gap-1.5">
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
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/[0.03] to-transparent px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm">WhatsApp</h2>
                {isSuperAdmin && waStoreId && (
                  <p className="text-[11px] text-muted-foreground truncate">({waStoreId})</p>
                )}
              </div>
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
          <div className="p-4 sm:p-6">
            {waLoading && !waData ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-64 max-w-full mx-auto" />
                <Skeleton className="h-4 w-48 max-w-full mx-auto" />
              </div>
            ) : waReady ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  WhatsApp terhubung — invoice bisa dikirim langsung dari POS.
                </p>
              </div>
            ) : waQR ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={waQR}
                  alt="WhatsApp QR Code"
                  className="w-40 h-40 sm:w-48 sm:h-48 border border-border rounded-lg"
                />
                <p className="text-sm text-muted-foreground text-center max-w-md">
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
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("modal.cancelTitle")}
        description={t("modal.cancelDescription")}
        confirmText={t("modal.yesCancel")}
        onConfirm={() => setTimeout(() => navigate("/dashboard-super-admin"), 150)}
      />
    </>
  );
};

export default CashRegisterOpenClose;
