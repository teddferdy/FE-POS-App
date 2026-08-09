import React from "react";
import { Route } from "react-router-dom";

const CashierPage = React.lazy(() => import("@/page/cashier/CashierPage"));
const CustomerDisplay = React.lazy(() => import("@/page/customer-display"));
const CustomerDisplayBoard = React.lazy(() => import("@/page/customer-display-board"));

export const cashierRoutes = (
  <>
    <Route path="/home" element={<CashierPage />} />
    <Route path="/customer-display" element={<CustomerDisplay />} />
    <Route path="/customer-display-board" element={<CustomerDisplayBoard />} />
  </>
);
