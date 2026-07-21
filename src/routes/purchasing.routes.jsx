import React from "react";
import { Route } from "react-router-dom";

// Supplier
const SupplierList = React.lazy(() => import("@/page/supplier/SupplierList"));
const AddSupplier = React.lazy(() => import("@/page/supplier/AddSupplier"));
const EditSupplier = React.lazy(() => import("@/page/supplier/EditSupplier"));
const DetailSupplier = React.lazy(() => import("@/page/supplier/DetailSupplier"));
const SupplierComparison = React.lazy(() => import("@/page/supplier/SupplierComparison"));

// Purchase Order
const PurchaseOrderList = React.lazy(() => import("@/page/purchase-order/PurchaseOrderList"));
const AddPurchaseOrder = React.lazy(() => import("@/page/purchase-order/AddPurchaseOrder"));
const DetailPurchaseOrder = React.lazy(() => import("@/page/purchase-order/DetailPurchaseOrder"));
const EditPurchaseOrder = React.lazy(() => import("@/page/purchase-order/EditPurchaseOrder"));
const PurchasePaymentList = React.lazy(() => import("@/page/purchase-order/PurchasePaymentList"));
const PurchasePaymentDetail = React.lazy(
  () => import("@/page/purchase-order/PurchasePaymentDetail")
);
const DashboardUtang = React.lazy(() => import("@/page/purchase-order/DashboardUtang"));

// Purchase Return
const PurchaseReturnList = React.lazy(() => import("@/page/purchase-return/PurchaseReturnList"));
const DetailPurchaseReturn = React.lazy(
  () => import("@/page/purchase-return/DetailPurchaseReturn")
);

// Sales Return
const SalesReturnList = React.lazy(() => import("@/page/sales-return/SalesReturnList"));
const DetailSalesReturn = React.lazy(() => import("@/page/sales-return/DetailSalesReturn"));

export const purchasingRoutes = (
  <>
    <Route path="/supplier" element={<SupplierList />} />
    <Route path="/add-supplier" element={<AddSupplier />} />
    <Route path="/edit-supplier" element={<EditSupplier />} />
    <Route path="/detail-supplier" element={<DetailSupplier />} />
    <Route path="/supplier-comparison" element={<SupplierComparison />} />

    <Route path="/purchase-order" element={<PurchaseOrderList />} />
    <Route path="/add-purchase-order" element={<AddPurchaseOrder />} />
    <Route path="/purchase-order/detail" element={<DetailPurchaseOrder />} />
    <Route path="/edit-purchase-order" element={<EditPurchaseOrder />} />
    <Route path="/purchase-payment" element={<PurchasePaymentList />} />
    <Route path="/purchase-payment-detail" element={<PurchasePaymentDetail />} />
    <Route path="/ap-dashboard" element={<DashboardUtang />} />

    <Route path="/purchase-return" element={<PurchaseReturnList />} />
    <Route path="/purchase-return/detail" element={<DetailPurchaseReturn />} />

    <Route path="/sales-return" element={<SalesReturnList />} />
    <Route path="/sales-return/detail" element={<DetailSalesReturn />} />
  </>
);
