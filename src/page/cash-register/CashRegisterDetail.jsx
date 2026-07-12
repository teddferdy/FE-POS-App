import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Building2,
  User,
  Calendar,
  Clock,
  DollarSign,
  ShoppingCart,
  Receipt,
  FileText,
  Coins,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";
import { getOrdersByStore } from "@/services/order";
const formatIDR = (num) => {
  if (!num && num !== 0) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const orderStatusBadge = (status) => {
  const map = {
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    void: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    ready: "bg-teal-100 text-teal-800",
    served: "bg-gray-100 text-gray-800"
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const getDateOnly = (dateStr) => {
  const d = new Date(dateStr);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

const CashRegisterDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [cookie] = useCookies();
  const item = location.state?.item;

  const statusCfg = {
    open: { label: t("page.cashRegister.detail.statusOpen"), class: "bg-green-100 text-green-800" },
    closed: {
      label: t("page.cashRegister.detail.statusClosed"),
      class: "bg-gray-100 text-gray-800"
    }
  };
  const sc = statusCfg[item?.status] || statusCfg.closed;
  const registerDate = item?.openedAt ? getDateOnly(item.openedAt) : null;
  const storeId = item?.store || cookie?.activeStore;

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError,
    refetch
  } = useQuery(
    ["daily-orders", storeId, registerDate],
    () => getOrdersByStore({ location: storeId, date: registerDate, limit: 100 }),
    { enabled: !!storeId && !!registerDate }
  );

  const orders = ordersData?.data || [];

  if (!item) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.cashRegister.detail.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/cash-register/current")}
            className="hover:text-foreground">
            {t("page.cashRegister.detail.breadcrumbCashier")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/cash-register/history")}
            className="hover:text-foreground">
            {t("page.cashRegister.detail.breadcrumbHistory")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.cashRegister.detail.breadcrumb")}
          </span>
        </nav>
        <div className="bg-card p-12 rounded-xl border border-border text-center">
          <Receipt size={48} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">{t("page.cashRegister.detail.notFound")}</p>
          <Button onClick={() => navigate("/cash-register/history")} className="mt-4">
            <ArrowLeft size={16} className="mr-1" /> {t("page.cashRegister.detail.backToHistory")}
          </Button>
        </div>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  const leftCol = [
    {
      icon: Building2,
      label: t("page.cashRegister.detail.store"),
      value: item.storeData?.name || "-"
    },
    {
      icon: User,
      label: t("page.cashRegister.detail.openedBy"),
      value: item.userData?.fullName || "-"
    },
    {
      icon: Calendar,
      label: t("page.cashRegister.detail.openDate"),
      value: new Date(item.openedAt).toLocaleDateString("id")
    },
    {
      icon: Clock,
      label: t("page.cashRegister.detail.openTime"),
      value: new Date(item.openedAt).toTimeString().slice(0, 8)
    },
    {
      icon: Calendar,
      label: t("page.cashRegister.detail.closeDate"),
      value: item.closedAt ? new Date(item.closedAt).toLocaleDateString("id") : "-"
    },
    {
      icon: Clock,
      label: t("page.cashRegister.detail.closeTime"),
      value: item.closedAt ? new Date(item.closedAt).toTimeString().slice(0, 8) : "-"
    }
  ];

  const rightCol = [
    {
      icon: DollarSign,
      label: t("page.cashRegister.detail.openingBalance"),
      value: formatIDR(item.openingBalance),
      mono: true
    },
    {
      icon: ShoppingCart,
      label: t("page.cashRegister.detail.totalSales"),
      value: formatIDR(item.totalSales),
      mono: true
    },
    {
      icon: Receipt,
      label: t("page.cashRegister.detail.totalExpenses"),
      value: formatIDR(item.totalExpenses),
      mono: true
    },
    {
      icon: Coins,
      label: t("page.cashRegister.detail.closingBalance"),
      value: formatIDR(item.closingBalance),
      mono: true
    },
    { icon: FileText, label: t("page.cashRegister.detail.notes"), value: item.notes || "-" }
  ];

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.cashRegister.detail.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/cash-register/current")}
            className="hover:text-foreground">
            {t("page.cashRegister.detail.breadcrumbCashier")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/cash-register/history")}
            className="hover:text-foreground">
            {t("page.cashRegister.detail.breadcrumbHistory")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.cashRegister.detail.breadcrumb")}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/cash-register/history")}>
              <ArrowLeft size={16} />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("page.cashRegister.detail.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(item.openedAt).toLocaleDateString("id")}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${sc.class}`}>
            {sc.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">{t("page.cashRegister.detail.infoTitle")}</h2>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <tbody>
                  {leftCol.map((r) => (
                    <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                      <td className="py-2.5 pr-4 w-40">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <r.icon size={14} />
                          <span>{r.label}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">
                {t("page.cashRegister.detail.financialSummary")}
              </h2>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <tbody>
                  {rightCol.map((r) => (
                    <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                      <td className="py-2.5 pr-4 w-40">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <r.icon size={14} />
                          <span>{r.label}</span>
                        </div>
                      </td>
                      <td
                        className={`py-2.5 ${r.mono ? "font-mono font-semibold" : "font-medium"}`}>
                        {r.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {t("page.cashRegister.detail.transactionHistory")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("page.cashRegister.detail.transactionCount", { count: orders.length })}
            </span>
          </div>
          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Receipt size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                {t("page.cashRegister.detail.noTransactions")}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">
                      {t("page.cashRegister.detail.tableNo")}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">
                      {t("page.cashRegister.detail.tableInvoice")}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">
                      {t("page.cashRegister.detail.tableCashier")}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">
                      {t("page.cashRegister.detail.tableTime")}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      {t("page.cashRegister.detail.tableTotal")}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">
                      {t("page.cashRegister.detail.tableStatus")}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">
                      {t("page.cashRegister.detail.tablePayment")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o, i) => (
                    <tr key={o.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{o.orderNumber || "-"}</td>
                      <td className="px-4 py-3">{o.cashierName || o.createdBy || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(o.createdAt).toTimeString().slice(0, 5)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatIDR(o.totalPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${orderStatusBadge(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{o.paymentMethod || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CashRegisterDetail;
