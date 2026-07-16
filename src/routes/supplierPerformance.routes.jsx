import React from "react";
import { Route } from "react-router-dom";

const SupplierScoreList = React.lazy(() => import("@/page/supplier-performance/SupplierScoreList"));
const SupplierScoreDetail = React.lazy(() => import("@/page/supplier-performance/SupplierScoreDetail"));

export const supplierPerformanceRoutes = (
  <>
    <Route path="/supplier-score-list" element={<SupplierScoreList />} />
    <Route path="/detail-supplier-score" element={<SupplierScoreDetail />} />
  </>
);
