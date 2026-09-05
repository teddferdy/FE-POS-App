import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const fmtNum = (n) => Number(n || 0).toLocaleString("id-ID");

const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const SectionTitle = ({ children }) => (
  <div className="mt-3 mb-2 rounded-sm bg-blue-700 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
    {children}
  </div>
);

const GridRow = ({ children }) => (
  <tr className="[&>td]:border [&>td]:border-slate-200 [&>td]:px-2 [&>td]:py-1 [&>td]:align-top [&>td]:text-[11px]">
    {children}
  </tr>
);

const LabelTd = ({ children }) => (
  <td className="w-[18%] bg-slate-50 font-semibold text-slate-600">{children}</td>
);

const ValueTd = ({ children }) => <td className="text-slate-900">{children || "-"}</td>;

export const SpdDocument = ({ trip }) => {
  const { t } = useTranslation();

  if (!trip) return null;

  const employees = trip.employees?.length ? trip.employees : [];
  const budgetItems = trip.budgetItems?.length ? trip.budgetItems : [];
  const declaredBudget = Number(trip.budget || 0);
  const breakdownTotal = budgetItems.reduce((s, b) => s + Number(b.total || 0), 0);
  const mismatch =
    declaredBudget > 0 && budgetItems.length > 0 && breakdownTotal !== declaredBudget;
  const diff = declaredBudget - breakdownTotal;
  const durationDays =
    trip.departureDate && trip.returnDate
      ? (() => {
          const a = new Date(trip.departureDate);
          const b = new Date(trip.returnDate);
          const days = Math.max(1, Math.round((b - a) / 86400000) + 1);
          return `${days} ${t("page.businessTrip.detail.day")}`;
        })()
      : "-";

  const statusText =
    {
      draft: t("businessTrip.status.draft"),
      pending: t("businessTrip.status.pending"),
      approved: t("businessTrip.status.approved"),
      rejected: t("businessTrip.status.rejected")
    }[trip.status] || trip.status;

  return (
    <div className="print-doc bg-white p-6 text-[11px] leading-snug text-slate-900">
      {/* HEADER */}
      <table className="mb-2 w-full border-b-2 border-slate-900 pb-2">
        <tbody>
          <tr>
            <td className="align-middle">
              <div className="text-lg font-extrabold uppercase tracking-wider text-blue-900">
                {t("document.brandName")}
              </div>
              <div className="text-[10px] text-slate-500">{t("document.brandAddress")}</div>
              <div className="text-[10px] text-slate-500">{t("document.brandContact")}</div>
            </td>
            <td className="align-bottom text-right">
              <h1 className="m-0 text-sm font-bold uppercase tracking-wide text-blue-900">
                {t("page.businessTrip.detail.spdTitle")}
              </h1>
              <div className="mt-0.5 text-[10px] font-bold text-slate-600">
                {t("document.no")}: {trip.tripNumber}
              </div>
              <div className="mt-1">
                <span className="rounded-sm border border-slate-300 bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  {t("document.status")}: {statusText}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* SECTION I */}
      <SectionTitle>{t("page.businessTrip.detail.sectionEmployee")}</SectionTitle>
      {employees.length === 0 ? (
        <div className="text-[11px] italic text-slate-500">-</div>
      ) : (
        <table className="w-full border-collapse">
          <tbody>
            {employees.map((e, i) => (
              <GridRow key={e.id || i}>
                <LabelTd>{i === 0 ? t("page.businessTrip.detail.employee") : ""}</LabelTd>
                <ValueTd>{e.employeeUser?.fullName || e.employeeName || "-"}</ValueTd>
                <LabelTd>{i === 0 ? t("page.businessTrip.detail.position") : ""}</LabelTd>
                <ValueTd>
                  {e.employeePosition ||
                    e.employeeUser?.positionData?.name ||
                    e.positionName ||
                    "-"}
                </ValueTd>
              </GridRow>
            ))}
          </tbody>
        </table>
      )}

      {/* SECTION II */}
      <SectionTitle>{t("page.businessTrip.detail.sectionTrip")}</SectionTitle>
      <table className="w-full border-collapse">
        <tbody>
          <GridRow>
            <LabelTd>{t("page.businessTrip.detail.purpose")}</LabelTd>
            <ValueTd colSpan={3}>{trip.tripPurpose}</ValueTd>
          </GridRow>
          <GridRow>
            <LabelTd>{t("page.businessTrip.detail.destination")}</LabelTd>
            <ValueTd>{trip.destination}</ValueTd>
            <LabelTd>{t("page.businessTrip.detail.travelCategory")}</LabelTd>
            <ValueTd>{t("page.businessTrip.detail.domestic")}</ValueTd>
          </GridRow>
          <GridRow>
            <LabelTd>{t("page.businessTrip.detail.departureDate")}</LabelTd>
            <ValueTd>{fmtDate(trip.departureDate)}</ValueTd>
            <LabelTd>{t("page.businessTrip.detail.returnDate")}</LabelTd>
            <ValueTd>{fmtDate(trip.returnDate)}</ValueTd>
          </GridRow>
          <GridRow>
            <LabelTd>{t("page.businessTrip.detail.duration")}</LabelTd>
            <ValueTd>{durationDays}</ValueTd>
            <LabelTd>{t("page.businessTrip.detail.transport")}</LabelTd>
            <ValueTd>-</ValueTd>
          </GridRow>
        </tbody>
      </table>

      {/* SECTION III — RAB */}
      <SectionTitle>{t("page.businessTrip.detail.sectionRab")}</SectionTitle>
      {budgetItems.length === 0 ? (
        <div className="text-[11px] italic text-slate-500">-</div>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[9px] uppercase">
                {["no", "komponen", "qty", "satuan", "tarif", "total", "catatan"].map((k) => (
                  <th key={k} className="border border-slate-300 px-1.5 py-1 text-left font-bold">
                    {t(`page.businessTrip.rab.${k}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((b, i) => (
                <tr key={b.id || i} className="even:bg-slate-50">
                  <td className="border border-slate-200 px-1.5 py-1 text-center">{i + 1}</td>
                  <td className="border border-slate-200 px-1.5 py-1">{b.komponen || "-"}</td>
                  <td className="border border-slate-200 px-1.5 py-1 text-center">
                    {b.qty != null ? fmtNum(b.qty) : "-"}
                  </td>
                  <td className="border border-slate-200 px-1.5 py-1 text-center">
                    {b.satuan || "-"}
                  </td>
                  <td className="border border-slate-200 px-1.5 py-1 text-right">
                    {b.tarif != null ? fmtNum(b.tarif) : "-"}
                  </td>
                  <td className="border border-slate-200 px-1.5 py-1 text-right font-semibold">
                    {b.total != null ? fmtNum(b.total) : "-"}
                  </td>
                  <td className="border border-slate-200 px-1.5 py-1">{b.catatan || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="ml-auto mt-1 w-1/2 border-collapse">
            <tbody>
              <tr>
                <td className="border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-bold">
                  {t("page.businessTrip.rab.totalEstimate")}
                </td>
                <td className="border border-slate-300 px-2 py-1 text-right text-[11px] font-bold">
                  {formatCurrencyRupiah(breakdownTotal)}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-bold">
                  {t("page.businessTrip.rab.cashAdvance")}
                </td>
                <td className="border border-slate-300 px-2 py-1 text-right text-[11px] font-bold">
                  {declaredBudget > 0 ? formatCurrencyRupiah(declaredBudget) : "-"}
                </td>
              </tr>
              {mismatch && (
                <tr className="bg-amber-50 text-amber-700">
                  <td className="border border-amber-300 px-2 py-1 text-[10px] font-semibold">
                    {t("page.businessTrip.rab.mismatchWarning")}
                  </td>
                  <td className="border border-amber-300 px-2 py-1 text-right text-[10px] font-semibold">
                    {t("page.businessTrip.rab.mismatchDiff", {
                      diff: formatCurrencyRupiah(Math.abs(diff)),
                      over: diff < 0 ? t("common.over") : t("common.under")
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* SECTION IV — APPROVAL */}
      <SectionTitle>{t("page.businessTrip.detail.sectionApproval")}</SectionTitle>
      <table className="mt-4 w-full border-collapse">
        <tbody>
          <tr className="text-center">
            {[
              {
                role: t("page.businessTrip.detail.approverApplicant"),
                name: employees[0]?.employeeUser?.fullName || employees[0]?.employeeName || ""
              },
              {
                role: t("page.businessTrip.detail.approverManager"),
                name: trip.modifiedBy ? t("page.businessTrip.detail.belumTtd") : ""
              },
              {
                role: t("page.businessTrip.detail.approverHead"),
                name: trip.approvedByUser?.fullName || ""
              },
              {
                role: t("page.businessTrip.detail.approverFinance"),
                name: ""
              }
            ].map((s, i) => (
              <td
                key={i}
                className="w-1/4 border border-slate-300 bg-white px-1.5 py-2 text-center align-top">
                <div className="text-[9px] font-bold uppercase text-slate-500">{s.role}</div>
                <div className="h-12" />
                <div className="border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-900">
                  {s.name || "..................."}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* TERMS */}
      {trip.notes && (
        <div className="mt-3 rounded border border-slate-200 border-l-4 border-l-blue-500 bg-slate-50 px-3 py-1.5 text-[9px] text-slate-600">
          <strong>{t("page.businessTrip.detail.policyTitle")}:</strong>
          <div className="mt-0.5">{trip.notes}</div>
        </div>
      )}
    </div>
  );
};

export default SpdDocument;
