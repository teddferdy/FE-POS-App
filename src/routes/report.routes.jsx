import React from "react";
import { Route } from "react-router-dom";

const SalesReportPage = React.lazy(() => import("@/page/report/SalesReportPage"));
const BestSellingReportPage = React.lazy(() => import("@/page/report/BestSellingReportPage"));
const DailyReport = React.lazy(() => import("@/page/report/DailyReport"));
const ProfitLossReport = React.lazy(() => import("@/page/report/ProfitLossReport"));
const CashFlowReport = React.lazy(() => import("@/page/report/CashFlowReport"));
const ProfitPerProduct = React.lazy(() => import("@/page/report/ProfitPerProduct"));

export const reportRoutes = (
  <>
    <Route path="/report/sales" element={<SalesReportPage />} />
    <Route path="/best-selling" element={<BestSellingReportPage />} />
    <Route path="/report/daily" element={<DailyReport />} />
    <Route path="/report/profit-loss" element={<ProfitLossReport />} />
    <Route path="/report/cash-flow" element={<CashFlowReport />} />
    <Route path="/report/profit-per-product" element={<ProfitPerProduct />} />
  </>
);
