import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, DollarSign, X, Wallet, Coins } from "lucide-react";
import { getCurrentCashRegister, closeCashRegister } from "@/services/cash-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";
const formatIDR = (num) => {
  if (!num && num !== 0) return "";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const parseIDR = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, "")) || 0;
};

const CashRegisterCurrent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const storeId = cookie?.activeStore || user?.store;

  const [rawClosing, setRawClosing] = React.useState("0");
  const closingBalance = parseIDR(rawClosing);
  const [closeModal, setCloseModal] = React.useState(false);

  const { data, isLoading, isError, refetch } = useQuery(
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
            {t("page.cashRegister.current.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.cashRegister.current.breadcrumb")}
          </span>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <Building2 size={64} className="mx-auto text-muted-foreground/40 mb-6" />
            <h1 className="text-2xl font-bold mb-2">
              {t("page.cashRegister.current.storeNotAvailable")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("page.cashRegister.current.storeNotAvailableDesc")}
            </p>
            <Button onClick={() => navigate("/add-location")}>
              <Building2 size={16} className="mr-2" /> {t("page.cashRegister.current.createStore")}
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
        toast.success(t("page.cashRegister.current.success"), {
          description: t("page.cashRegister.current.closedDesc")
        });
        queryClient.invalidateQueries(["cash-register"]);
        setCloseModal(false);
        refetch();
      },
      onError: (err) =>
        toast.error(t("page.cashRegister.current.fail"), {
          description: err?.response?.data?.message || err.message
        })
    }
  );

  if (isError) return <AbortController refetch={refetch} />;
  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            Dashboard
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.cashRegister.current.breadcrumb")}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("page.cashRegister.current.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.cashRegister.current.shiftStatus")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/cash-register/history")}>
              <Wallet size={16} className="mr-1" /> {t("page.cashRegister.current.historyBtn")}
            </Button>
            {!reg && (
              <Button onClick={() => navigate("/cash-register/open-close")}>
                <DollarSign size={16} className="mr-1" /> {t("page.cashRegister.current.openBtn")}
              </Button>
            )}
          </div>
        </div>

        {!reg ? (
          <div className="bg-card p-6 rounded-xl border border-border text-center">
            <Wallet size={48} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              {t("page.cashRegister.current.noActiveRegister")}
            </p>
            <Button onClick={() => navigate("/cash-register/open-close")} className="mt-4">
              <DollarSign size={16} className="mr-1" /> {t("page.cashRegister.current.openBtn")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">
                {t("page.cashRegister.current.infoTitle")}
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    [
                      t("page.cashRegister.current.store"),
                      reg.storeData?.name
                        ? {
                            label: reg.storeData.name,
                            sub:
                              [reg.storeData.address, reg.storeData.city]
                                .filter(Boolean)
                                .join(", ") || null
                          }
                        : {
                            label:
                              reg.storeName || cookie?.activeStoreName || user?.storeName || "-"
                          }
                    ],
                    [t("page.cashRegister.current.openedBy"), reg.userData?.fullName || "-"],
                    [
                      t("page.cashRegister.current.openDate"),
                      new Date(reg.openedAt).toLocaleDateString("id")
                    ],
                    [
                      t("page.cashRegister.current.openTime"),
                      new Date(reg.openedAt).toTimeString().slice(0, 8)
                    ],
                    [
                      t("page.cashRegister.current.openingBalance"),
                      `Rp ${parseInt(reg.openingBalance).toLocaleString("id")}`
                    ],
                    [
                      t("page.cashRegister.current.totalSales"),
                      `Rp ${parseInt(data?.data?.currentSales || reg.totalSales || 0).toLocaleString("id")}`
                    ],
                    [
                      t("page.cashRegister.current.status"),
                      reg.status === "open"
                        ? t("page.cashRegister.current.statusOpen")
                        : t("page.cashRegister.current.statusClosed")
                    ],
                    [t("page.cashRegister.current.notes"), reg.notes || "-"]
                  ].map(([l, v]) => (
                    <tr key={l} className="border-b border-muted/30">
                      <td className="py-2 pr-4 text-muted-foreground w-44 align-top">{l}</td>
                      <td className="py-2 font-medium">
                        {typeof v === "object" ? (
                          <div>
                            <div>{v.label}</div>
                            {v.sub && (
                              <div className="text-xs text-muted-foreground font-normal">
                                {v.sub}
                              </div>
                            )}
                          </div>
                        ) : (
                          v
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">
                {t("page.cashRegister.current.closeTitle")}
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("page.cashRegister.current.closingBalance")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground pointer-events-none">
                      <Coins size={16} />
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatIDR(rawClosing === "0" ? "" : rawClosing)}
                      placeholder={t("page.cashRegister.current.placeholder")}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "");
                        setRawClosing(cleaned || "0");
                      }}
                      className="pl-10 h-12 text-lg font-semibold tabular-nums"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {closingBalance > 0
                      ? `${t("page.cashRegister.current.recorded")} ${formatIDR(closingBalance)}`
                      : t("page.cashRegister.current.enterClosingBalance")}
                  </p>
                </div>
                <Button onClick={() => setCloseModal(true)} variant="destructive">
                  <X size={16} className="mr-1" /> {t("page.cashRegister.current.closeBtn")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Modal
          type="confirm"
          open={closeModal}
          onOpenChange={(o) => !o && setCloseModal(false)}
          title={t("page.cashRegister.current.modalTitle")}
          description={t("page.cashRegister.current.modalDesc", {
            balance: formatIDR(closingBalance)
          })}
          confirmText={t("page.cashRegister.current.modalConfirm")}
          onConfirm={() => closeMut.mutate()}
        />
      </div>
    </>
  );
};

export default CashRegisterCurrent;
