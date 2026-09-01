import React from "react";
import { Route } from "react-router-dom";

const SalesReportPage = React.lazy(() => import("@/page/report/SalesReportPage"));
const BestSellingReportPage = React.lazy(() => import("@/page/report/BestSellingReportPage"));
const DailyReport = React.lazy(() => import("@/page/report/DailyReport"));
const CashFlowReport = React.lazy(() => import("@/page/report/CashFlowReport"));
const ProfitPerProduct = React.lazy(() => import("@/page/report/ProfitPerProduct"));
const ReportSettingsPage = React.lazy(() => import("@/page/report/ReportSettingsPage"));

export const reportRoutes = (
  <>
    <Route path="/report/sales" element={<SalesReportPage />} />
    <Route path="/best-selling" element={<BestSellingReportPage />} />
    <Route path="/report/daily" element={<DailyReport />} />
    <Route path="/report/cash-flow" element={<CashFlowReport />} />
    <Route path="/report/profit-per-product" element={<ProfitPerProduct />} />
    <Route path="/report/settings" element={<ReportSettingsPage />} />
  </>
);
