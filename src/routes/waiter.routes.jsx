import React from "react";
import { Route } from "react-router-dom";

const WaiterRequestList = React.lazy(() => import("@/page/waiterRequest/WaiterRequestList"));

export const waiterRoutes = (
  <>
    <Route path="/waiter-request" element={<WaiterRequestList />} />
  </>
);
