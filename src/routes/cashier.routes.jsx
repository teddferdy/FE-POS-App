import React from "react";
import { Route } from "react-router-dom";

const CashierPage = React.lazy(() => import("@/page/cashier/CashierPage"));
const CustomerOrder = React.lazy(() => import("@/page/customer-order"));
const CustomerOrderDetail = React.lazy(() => import("@/page/customer-order/detail"));
const CustomerOrderCart = React.lazy(() => import("@/page/customer-order/cart"));
const CustomerOrderTracking = React.lazy(() => import("@/page/customer-order/tracking"));
const CustomerDisplay = React.lazy(() => import("@/page/customer-display"));

export const cashierRoutes = (
  <>
    <Route path="/home" element={<CashierPage />} />
    <Route path="/customer-order" element={<CustomerOrder />} />
    <Route path="/customer-order/menu/:id" element={<CustomerOrderDetail />} />
    <Route path="/customer-order/cart" element={<CustomerOrderCart />} />
    <Route path="/customer-order/tracking/:id" element={<CustomerOrderTracking />} />
    <Route path="/customer-display" element={<CustomerDisplay />} />
  </>
);
