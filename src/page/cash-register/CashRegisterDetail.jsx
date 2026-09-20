import { safeGet } from "@/lib/safe-lookup";
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import {
  Building2,
  User,
  Calendar,
  Clock,
  DollarSign,
  ShoppingCart,
  Receipt,
  FileText,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";
import PageHeader from "@/components/ui/PageHeader";
import { getOrdersByStore } from "@/services/order";
import { getZReport } from "@/services/cash-register";
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
    served: "bg-muted text-muted-foreground"
  };
  return safeGet(map, status, "bg-muted text-muted-foreground");
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
      class: "bg-muted text-muted-foreground"
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

  // Batch B: the summary used to render ONLY the frozen close-time snapshot
  // (item.totalSales / item.totalExpenses) next to a live store+date order
  // list of ALL statuses with no stated inclusion rules — irreconcilable by
  // construction. The Z-report now carries an additive `reconciliation`
  // block (eligible sales + explicit exclusion buckets + cash expenses +
  // movements) reusing the exact close-time membership semantics. Render
  // the live breakdown when available; fall back to the stored snapshot
  // when the report is unreachable so the page never renders empty.
  const { data: zReportData } = useQuery(
    ["cash-register-z-report", item?.id],
    () => getZReport(item.id),
    { enabled: !!item?.id }
  );
  const report = zReportData?.data || null;
  const rec = report?.reconciliation || null;
  const summary = report?.summary || null;
  const live = !!rec;

  const openingBalance = report?.register?.openingBalance ?? item?.openingBalance;
  const totalSales = rec?.sales?.eligible?.total ?? summary?.totalSales ?? item?.totalSales;
  const totalExpenses =
    rec?.expenses?.includedCash?.total ?? summary?.totalExpenses ?? item?.totalExpenses;
  const closingBalance = report?.register?.closingBalance ?? item?.closingBalance;

  // Per-row eligibility comes from the backend reconciliation identity sets
  // — never recomputed with duplicated FE rules.
  const eligibleIds = useMemo(() => new Set(rec?.sales?.eligible?.orderIds || []), [rec]);
  const reasonById = useMemo(() => {
    const m = new Map();
    (rec?.sales?.excluded || []).forEach((b) =>
      (b.orderIds || []).forEach((id) => {
        if (!m.has(id)) m.set(id, b.code);
      })
    );
    return m;
  }, [rec]);

  const eligibilityOf = (order) => {
    if (!rec) return null;
    if (eligibleIds.has(order.id)) return "included";
    return reasonById.get(order.id) || "notIncluded";
  };

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.home"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.home"
            },
            {
              label: t("page.cashRegister.detail.breadcrumbCashier"),
              href: "/cash-register/current",
              i18nKey: "page.cashRegister.detail.breadcrumbCashier"
            },
            {
              label: t("page.cashRegister.detail.breadcrumbHistory"),
              href: "/cash-register/history",
              i18nKey: "page.cashRegister.detail.breadcrumbHistory"
            },
            { label: t("page.cashRegister.detail.breadcrumb") }
          ]}
          title={t("page.cashRegister.detail.breadcrumb")}
          backLink="/cash-register/history"
          dynamicInfo={false}
        />
        <div className="bg-card p-12 rounded-xl border border-border text-center">
          <Receipt size={48} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">{t("page.cashRegister.detail.notFound")}</p>
          <Button
            variant="danger"
            onClick={() => navigate("/cash-register/history")}
            className="mt-4">
            {t("page.cashRegister.detail.backToHistory")}
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
      value: formatIDR(openingBalance),
      mono: true
    },
    {
      icon: ShoppingCart,
      label: t("page.cashRegister.detail.totalSales"),
      value: formatIDR(totalSales),
      mono: true
    },
    {
      icon: Receipt,
      label: t("page.cashRegister.detail.totalExpenses"),
      value: formatIDR(totalExpenses),
      mono: true
    },
    {
      icon: Coins,
      label: t("page.cashRegister.detail.closingBalance"),
      value: formatIDR(closingBalance),
      mono: true
    },
    { icon: FileText, label: t("page.cashRegister.detail.notes"), value: item.notes || "-" }
  ];

  // Live breakdown rows — rendered only when the reconciliation contract is
  // present; every number traces to a backend query, nothing is summed here.
  const methodRows = (rec?.sales?.eligible?.byPaymentMethod || []).map((r) => ({
    label: `${r.type} · ${r.orders}x`,
    value: formatIDR(r.amount)
  }));
  const excludedSalesRows = (rec?.sales?.excluded || []).map((b) => ({
    label: `${t(`page.cashRegister.detail.reason.${b.code}`)} · ${b.count}x`,
    value: formatIDR(b.total)
  }));
  const expenseCategoryRows = (report?.expenses || []).map((r) => ({
    label: `${r.category} · ${r.count}x`,
    value: formatIDR(r.amount)
  }));
  const expenseRecords = rec?.expenses?.records || [];
  const excludedExpenseRows = (rec?.expenses?.excluded || []).map((b) => ({
    label: `${t(`page.cashRegister.detail.reason.${b.code}`)} · ${b.count}x`,
    value: formatIDR(b.total)
  }));
  const cashRows = summary
    ? [
        {
          label: t("page.cashRegister.detail.cashSalesReceived"),
          value: formatIDR(summary.totalCashPayment)
        },
        {
          label: t("page.cashRegister.detail.activeCashIn"),
          value: formatIDR(summary.activeCashIn)
        },
        {
          label: t("page.cashRegister.detail.activeCashOut"),
          value: formatIDR(summary.activeCashOut)
        },
        {
          label: t("page.cashRegister.detail.expectedCash"),
          value: formatIDR(summary.expectedCash)
        },
        ...(summary.variance !== null && summary.variance !== undefined
          ? [
              {
                label: t("page.cashRegister.detail.variance"),
                value: formatIDR(summary.variance)
              }
            ]
          : [])
      ]
    : [];

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.home"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.home"
            },
            {
              label: t("page.cashRegister.detail.breadcrumbCashier"),
              href: "/cash-register/current",
              i18nKey: "page.cashRegister.detail.breadcrumbCashier"
            },
            {
              label: t("page.cashRegister.detail.breadcrumbHistory"),
              href: "/cash-register/history",
              i18nKey: "page.cashRegister.detail.breadcrumbHistory"
            },
            { label: t("page.cashRegister.detail.breadcrumb") }
          ]}
          title={t("page.cashRegister.detail.title")}
          description={new Date(item.openedAt).toLocaleDateString("id")}
          backLink="/cash-register/history"
          dynamicInfo={false}>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${sc.class}`}>
            {sc.label}
          </span>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">{t("page.cashRegister.detail.infoTitle")}</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
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
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">
                {t("page.cashRegister.detail.financialSummary")}
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
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
                <p className="mt-3 text-xs text-muted-foreground">
                  {live
                    ? t("page.cashRegister.detail.liveSummary")
                    : t("page.cashRegister.detail.snapshotFallback")}
                  {rec?.window?.openedAt
                    ? ` · ${t("page.cashRegister.detail.registerWindow")}: ${new Date(
                        rec.window.openedAt
                      ).toLocaleString("id")}${
                        rec.window.endAt
                          ? ` → ${new Date(rec.window.endAt).toLocaleString("id")}`
                          : ""
                      }`
                    : ""}
                </p>
              </div>
              {live && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {`${t("page.cashRegister.detail.salesBreakdown")} · ${t(
                        "page.cashRegister.detail.salesIncluded"
                      )} (${rec.sales.eligible.count}x)`}
                    </h3>
                    <table className="w-full text-sm mt-1">
                      <tbody>
                        {methodRows.map((r) => (
                          <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                            <td className="py-1.5 pr-4 text-muted-foreground">{r.label}</td>
                            <td className="py-1.5 text-right font-mono">{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {excludedSalesRows.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("page.cashRegister.detail.salesExcluded")}
                      </h3>
                      <table className="w-full text-sm mt-1">
                        <tbody>
                          {excludedSalesRows.map((r) => (
                            <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                              <td className="py-1.5 pr-4 text-muted-foreground">{r.label}</td>
                              <td className="py-1.5 text-right font-mono">{r.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("page.cashRegister.detail.expenseBreakdown")}
                    </h3>
                    <table className="w-full text-sm mt-1">
                      <tbody>
                        {expenseCategoryRows.map((r) => (
                          <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                            <td className="py-1.5 pr-4 text-muted-foreground">{r.label}</td>
                            <td className="py-1.5 text-right font-mono">{r.value}</td>
                          </tr>
                        ))}
                        {excludedExpenseRows.map((r) => (
                          <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                            <td className="py-1.5 pr-4 text-muted-foreground">{r.label}</td>
                            <td className="py-1.5 text-right font-mono">{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {expenseRecords.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("page.cashRegister.detail.expenseRecords")} ({expenseRecords.length}x)
                      </h3>
                      <table className="w-full text-sm mt-1">
                        <tbody>
                          {expenseRecords.map((e) => (
                            <tr key={e.id} className="border-b border-muted/30 last:border-b-0">
                              <td className="py-1.5 pr-4 text-muted-foreground">
                                {e.category || "-"}
                                {e.createdAt
                                  ? ` · ${new Date(e.createdAt).toLocaleString("id")}`
                                  : ""}
                                {e.notes ? ` · ${e.notes}` : ""}
                              </td>
                              <td className="py-1.5 text-right font-mono">{formatIDR(e.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {cashRows.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("page.cashRegister.detail.cashReconciliation")}
                      </h3>
                      <table className="w-full text-sm mt-1">
                        <tbody>
                          {cashRows.map((r) => (
                            <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                              <td className="py-1.5 pr-4 text-muted-foreground">{r.label}</td>
                              <td className="py-1.5 text-right font-mono">{r.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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
                      <td className="px-4 py-3">
                        {o.cashierName ||
                          o.createdByUser?.fullName ||
                          o.createdByUser?.userName ||
                          "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(o.createdAt).toTimeString().slice(0, 5)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatIDR(o.totalPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${orderStatusBadge(o.status)}`}>
                          {o.status}
                        </span>
                        {(() => {
                          const eligibility = eligibilityOf(o);
                          if (!eligibility) return null;
                          const included = eligibility === "included";
                          return (
                            <div
                              className={`mt-1 text-[10px] font-semibold ${
                                included ? "text-green-700" : "text-amber-700"
                              }`}>
                              {included
                                ? t("page.cashRegister.detail.included")
                                : eligibility === "notIncluded"
                                  ? t("page.cashRegister.detail.notIncluded")
                                  : t(`page.cashRegister.detail.reason.${eligibility}`)}
                            </div>
                          );
                        })()}
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
