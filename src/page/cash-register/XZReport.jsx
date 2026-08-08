import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import {
  FileBarChart,
  Printer,
  RefreshCw,
  Wallet,
  Coins,
  CreditCard,
  ReceiptText,
  Store,
  User
} from "lucide-react";
import { getXReport, getZReport, getCashRegisterHistory } from "@/services/cash-register";
import { getAllLocation } from "@/services/location";
import { isCashPayment } from "@/utils/payment";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const formatIDR = (num) => {
  if (num == null || isNaN(num)) return "Rp 0";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const Dashed = () => (
  <div className="flex items-center justify-center gap-1 py-1 select-none" aria-hidden="true">
    {Array.from({ length: 14 }).map((_, i) => (
      <span key={i} className="w-1 h-px bg-border/70" />
    ))}
  </div>
);

const Row = ({ label, value, strong, accent }) => (
  <div className="flex items-center justify-between gap-4 py-0.5">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span
      className={`font-mono text-xs ${strong ? "font-bold text-sm" : "font-medium"} ${
        accent || ""
      }`}>
      {value}
    </span>
  </div>
);

Row.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  strong: PropTypes.bool,
  accent: PropTypes.string
};

const ReportView = ({ data }) => {
  const { t } = useTranslation();
  if (!data) return null;
  const summary = data.summary || {};
  const payments = data.payments || [];
  const expenses = data.expenses || [];

  const paymentGroups = {};
  for (const p of payments) {
    const key = p.type || "cash";
    if (!paymentGroups[key]) paymentGroups[key] = { amount: 0, count: 0 };
    paymentGroups[key].amount += p.amount;
    paymentGroups[key].count += p.count;
  }

  return (
    <div className="max-w-[400px] mx-auto bg-card rounded-xl border border-border/60 overflow-hidden">
      <div className="px-5 pt-5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Store size={15} className="text-primary" />
          <p className="font-bold uppercase tracking-wide text-sm">
            {data.store?.name || t("page.cashRegister.xz.storeFallback")}
          </p>
        </div>
        {data.store?.address && (
          <p className="text-[11px] text-muted-foreground text-center">{data.store.address}</p>
        )}
        {data.store?.phone && (
          <p className="text-[11px] text-muted-foreground text-center mt-0.5">{data.store.phone}</p>
        )}
      </div>

      <Dashed />

      <div className="px-5 space-y-1.5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <FileBarChart size={15} className="text-primary" />
          <p className="font-semibold text-sm">{t("page.cashRegister.xz.reportTitle")}</p>
        </div>
        <Row label={t("page.cashRegister.xz.registerNo")} value={`#${data.register?.id || "-"}`} />
        <Row
          label={t("page.cashRegister.xz.cashier")}
          value={
            <span className="inline-flex items-center gap-1">
              <User size={11} className="text-muted-foreground" />
              {data.cashier?.fullName || "-"}
            </span>
          }
        />
        <Row
          label={t("page.cashRegister.xz.openedAt")}
          value={
            data.register?.openedAt
              ? new Date(data.register.openedAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "-"
          }
        />
        {data.register?.closedAt && (
          <Row
            label={t("page.cashRegister.xz.closedAt")}
            value={new Date(data.register.closedAt).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            })}
          />
        )}
        <Row
          label={t("page.cashRegister.xz.status")}
          value={
            <span
              className={`font-bold ${
                data.register?.status === "open" ? "text-emerald-600" : "text-muted-foreground"
              }`}>
              {data.register?.status === "open"
                ? t("page.cashRegister.xz.statusOpen")
                : t("page.cashRegister.xz.statusClosed")}
            </span>
          }
        />
      </div>

      <Dashed />

      <div className="px-5 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          {t("page.cashRegister.xz.summaryTitle")}
        </p>
        <Row
          label={t("page.cashRegister.xz.transactions")}
          value={summary.totalTransactions ?? 0}
        />
        <Row label={t("page.cashRegister.xz.quantity")} value={summary.totalQuantity ?? 0} />
        {!!summary.totalCovers && (
          <Row label={t("page.cashRegister.xz.covers")} value={summary.totalCovers} />
        )}
        <Row label={t("page.cashRegister.xz.subtotal")} value={formatIDR(summary.subtotal)} />
        {summary.discount > 0 && (
          <Row
            label={t("page.cashRegister.xz.discount")}
            value={`-${formatIDR(summary.discount)}`}
            accent="text-emerald-600"
          />
        )}
        {summary.tax > 0 && (
          <Row label={t("page.cashRegister.xz.tax")} value={formatIDR(summary.tax)} />
        )}
        {summary.serviceCharge > 0 && (
          <Row
            label={t("page.cashRegister.xz.serviceCharge")}
            value={formatIDR(summary.serviceCharge)}
          />
        )}
        <Row
          label={t("page.cashRegister.xz.totalSales")}
          value={formatIDR(summary.totalSales)}
          strong
          accent="text-primary"
        />
      </div>

      <Dashed />

      <div className="px-5 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          {t("page.cashRegister.xz.paymentTitle")}
        </p>
        {Object.entries(paymentGroups).length > 0 ? (
          Object.entries(paymentGroups).map(([type, p]) => (
            <div key={type} className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                {isCashPayment(type) ? <Coins size={12} /> : <CreditCard size={12} />}
                {type} ({p.count})
              </span>
              <span className="font-mono text-xs font-medium">{formatIDR(p.amount)}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">-</p>
        )}
      </div>

      {expenses.length > 0 && (
        <>
          <Dashed />
          <div className="px-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("page.cashRegister.xz.expenseTitle")} ({formatIDR(summary.totalExpenses)})
            </p>
            {expenses.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                <span className="text-xs text-muted-foreground">
                  {e.category} ({e.count})
                </span>
                <span className="font-mono text-xs text-destructive">{formatIDR(e.amount)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Dashed />

      <div className="px-5 pb-5 space-y-1.5">
        <Row
          label={t("page.cashRegister.xz.openingBalance")}
          value={formatIDR(data.register?.openingBalance)}
        />
        <Row
          label={t("page.cashRegister.xz.cashPayment")}
          value={formatIDR(summary.totalCashPayment)}
        />
        <Row
          label={t("page.cashRegister.xz.expenses")}
          value={`-${formatIDR(summary.totalExpenses)}`}
          accent="text-destructive"
        />
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/60">
          <span className="font-bold text-xs">{t("page.cashRegister.xz.expectedCash")}</span>
          <span className="font-mono font-bold text-sm">{formatIDR(summary.expectedCash)}</span>
        </div>
        {data.register?.status === "closed" && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {t("page.cashRegister.xz.closingBalance")}
            </span>
            <span className="font-mono text-xs font-bold">
              {formatIDR(data.register?.closingBalance)}
            </span>
          </div>
        )}
        {summary.variance != null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("page.cashRegister.xz.variance")}
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                summary.variance > 0
                  ? "text-emerald-600"
                  : summary.variance < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}>
              {summary.variance > 0 ? "+" : ""}
              {formatIDR(summary.variance)}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 border-t border-dashed border-border/60 pt-3">
        <p className="text-center text-[11px] text-muted-foreground">
          {t("page.cashRegister.xz.footer")}
        </p>
      </div>
    </div>
  );
};

ReportView.propTypes = {
  data: PropTypes.shape({
    store: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      phone: PropTypes.string
    }),
    cashier: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fullName: PropTypes.string
    }),
    register: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      openedAt: PropTypes.string,
      closedAt: PropTypes.string,
      openingBalance: PropTypes.number,
      closingBalance: PropTypes.number
    }),
    summary: PropTypes.shape({
      totalTransactions: PropTypes.number,
      totalQuantity: PropTypes.number,
      totalCovers: PropTypes.number,
      subtotal: PropTypes.number,
      discount: PropTypes.number,
      tax: PropTypes.number,
      serviceCharge: PropTypes.number,
      totalSales: PropTypes.number,
      totalExpenses: PropTypes.number,
      totalCashPayment: PropTypes.number,
      totalNonCashPayment: PropTypes.number,
      expectedCash: PropTypes.number,
      variance: PropTypes.number,
      openingBalance: PropTypes.number
    }),
    payments: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        amount: PropTypes.number,
        count: PropTypes.number
      })
    ),
    expenses: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string,
        amount: PropTypes.number,
        count: PropTypes.number
      })
    )
  })
};

const XZReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const cookieStoreId = cookie?.activeStore || user?.store;
  const [selectedRegister, setSelectedRegister] = useState(null);

  // super_admin does not get an auto-assigned store (DashboardLayout skips auto-select),
  // so fall back to the first active location so the report can still render.
  const { data: locationsData } = useQuery(["allLocations"], getAllLocation, {
    enabled: !cookieStoreId
  });
  const locations = locationsData?.data || [];
  const fallbackStoreId = locations.length ? locations[0].id || locations[0]._id : null;
  const storeId = cookieStoreId || fallbackStoreId;

  const {
    data: xData,
    isLoading: xLoading,
    isError: xError,
    refetch: refetchX
  } = useQuery(["cash-register-x-report", storeId], () => getXReport(storeId), {
    enabled: !!storeId
  });

  const { data: historyData } = useQuery(
    ["cash-register-history-xz", storeId],
    () => getCashRegisterHistory({ limit: 100, store: storeId }),
    { enabled: !!storeId }
  );
  const registers = (historyData?.data || []).filter((r) => r.status === "closed");

  const {
    data: zData,
    isLoading: zLoading,
    isError: zError,
    refetch: refetchZ
  } = useQuery(["cash-register-z-report", selectedRegister], () => getZReport(selectedRegister), {
    enabled: !!selectedRegister
  });

  const handlePrint = () => window.print();

  if (!storeId) {
    return (
      <div className="space-y-6">
        <PageHeader breadcrumbs={[{ i18nKey: "page.cashRegister.xz.breadcrumb" }]} />
        <div className="flex min-h-full w-full">
          <NoStore />
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    {
      href: user?.roleType === "super_admin" ? "/dashboard-super-admin" : "/cash-register/current",
      i18nKey: "page.cashRegister.xz.breadcrumbDashboard"
    },
    { i18nKey: "page.cashRegister.xz.breadcrumb" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={t("page.cashRegister.xz.title")}
        description={t("page.cashRegister.xz.desc")}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={16} className="mr-1" /> {t("page.cashRegister.xz.print")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              refetchX();
              if (selectedRegister) refetchZ();
            }}>
            <RefreshCw size={16} className="mr-1" /> {t("page.cashRegister.xz.refresh")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* X Report */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
              <Wallet size={13} /> X Report
            </span>
            <h2 className="text-base font-semibold">{t("page.cashRegister.xz.xTitle")}</h2>
          </div>
          {xLoading ? (
            <Skeleton className="h-96 w-full max-w-[400px]" />
          ) : xError ? (
            <AbortController refetch={refetchX} />
          ) : xData?.data ? (
            <>
              <ReportView data={xData.data} />
              <p className="text-xs text-muted-foreground max-w-[400px] mx-auto">
                {t("page.cashRegister.xz.xNote")}
              </p>
            </>
          ) : (
            <div className="bg-card p-6 rounded-xl border border-border text-center max-w-[400px]">
              <ReceiptText size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("page.cashRegister.xz.noOpenRegister")}
              </p>
              <Button
                onClick={() => navigate("/cash-register/open-close")}
                className="mt-4"
                size="sm">
                {t("page.cashRegister.xz.openRegister")}
              </Button>
            </div>
          )}
        </div>

        {/* Z Report */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide">
              <FileBarChart size={13} /> Z Report
            </span>
            <h2 className="text-base font-semibold">{t("page.cashRegister.xz.zTitle")}</h2>
          </div>

          <div className="bg-card rounded-xl border border-border max-w-[400px]">
            <div className="p-4 border-b border-border/50">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("page.cashRegister.xz.selectRegister")}
              </label>
              {registers.length > 0 ? (
                <select
                  value={selectedRegister || ""}
                  onChange={(e) => setSelectedRegister(e.target.value)}
                  className="mt-2 w-full h-10 px-3 rounded-lg bg-accent/50 border border-border/60 text-sm outline-none focus:border-primary/50 transition-colors">
                  <option value="">{t("page.cashRegister.xz.selectPlaceholder")}</option>
                  {registers.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} · {r.userData?.fullName || "-"} ·{" "}
                      {new Date(r.openedAt).toLocaleDateString("id-ID")}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  {t("page.cashRegister.xz.noClosedRegister")}
                </p>
              )}
            </div>
            <ScrollArea className="max-h-[560px]">
              {selectedRegister ? (
                zLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-96 w-full" />
                  </div>
                ) : zError ? (
                  <div className="p-4">
                    <AbortController refetch={refetchZ} />
                  </div>
                ) : zData?.data ? (
                  <div className="p-4">
                    <ReportView data={zData.data} />
                  </div>
                ) : null
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  {t("page.cashRegister.xz.zHint")}
                </p>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XZReport;
