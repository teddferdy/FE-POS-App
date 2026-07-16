import React from "react";
import { Route } from "react-router-dom";

// Dashboard
const Dashboard = React.lazy(() => import("@/page/dashboard"));

// Kitchen Display & QR Order Management
const KitchenDisplay = React.lazy(() => import("@/page/kitchen-display"));
const CustomerOrderManagement = React.lazy(() => import("@/page/customer-order/management"));

// Invoice
const InvoicePage = React.lazy(() => import("@/page/invoice/InvoicePage"));

// Notification
const NotificationPage = React.lazy(() => import("@/page/notification/NotificationPage"));

// Support & Profile
const Support = React.lazy(() => import("@/page/support"));
const ProfilePage = React.lazy(() => import("@/page/profile/ProfilePage"));

// Not Found
const NotFoundPage = React.lazy(() => import("@/components/ui/NotFoundPage"));

export const miscRoutes = (
  <>
    <Route path="/dashboard-super-admin" element={<Dashboard />} />
    <Route path="/dashboard-admin" element={<Dashboard />} />
    <Route path="/kitchen-display" element={<KitchenDisplay />} />
    <Route path="/qr-order-management" element={<CustomerOrderManagement />} />
    <Route path="/invoice-page" element={<InvoicePage />} />
    <Route path="/notification" element={<NotificationPage />} />
    <Route path="/support" element={<Support />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
);
