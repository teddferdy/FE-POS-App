import React from "react";
import { Route } from "react-router-dom";

const DeliveryOrderList = React.lazy(() => import("@/page/delivery/DeliveryOrderList"));
const DeliveryOrderDetail = React.lazy(() => import("@/page/delivery/DeliveryOrderDetail"));
const DriverList = React.lazy(() => import("@/page/delivery/DriverList"));
const AddDriver = React.lazy(() => import("@/page/delivery/AddDriver"));
const EditDriver = React.lazy(() => import("@/page/delivery/EditDriver"));
const DetailDriver = React.lazy(() => import("@/page/delivery/DetailDriver"));

export const deliveryRoutes = (
  <>
    <Route path="/delivery-orders" element={<DeliveryOrderList />} />
    <Route path="/detail-delivery-order" element={<DeliveryOrderDetail />} />

    <Route path="/driver-list" element={<DriverList />} />
    <Route path="/add-driver" element={<AddDriver />} />
    <Route path="/edit-driver" element={<EditDriver />} />
    <Route path="/detail-driver" element={<DetailDriver />} />
  </>
);
