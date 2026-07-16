import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteProgress from "@/components/ui/route-progress";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";

// Offline
import OfflineIndicator from "./components/organism/OfflineIndicator";
import { setupAutoSync } from "@/services/offline";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

import Modal from "@/components/organism/modal";
import ErrorBoundary from "@/components/ErrorBoundary";

// Route groups — lazy-loaded per domain
import {
  authRoutes,
  cashierRoutes,
  productRoutes,
  inventoryRoutes,
  purchasingRoutes,
  hrRoutes,
  financeRoutes,
  crmRoutes,
  reportRoutes,
  settingsRoutes,
  miscRoutes,
  deliveryRoutes,
  queueRoutes,
  supplierPerformanceRoutes,
  promoRoutes,
  bundleRoutes
} from "@/routes";

// Global lazy components
const SupportComponent = React.lazy(() => import("@/components/organism/Support"));
const SentryInitializer = React.lazy(() => import("./components/organism/SentryInitializer"));

const ShortcutHandler = () => {
  useKeyboardShortcuts();
  return null;
};

function App() {
  const { i18n } = useTranslation();
  const { translation } = translationSelect();
  const [authExpiredModalOpen, setAuthExpiredModalOpen] = useState(false);

  useEffect(() => {
    if (translation) {
      i18n.changeLanguage(translation);
    }
  }, [translation]);

  useEffect(() => {
    const cleanup = setupAutoSync();
    return cleanup;
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => setAuthExpiredModalOpen(true);
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  return (
    <React.Fragment>
      <OfflineIndicator />
      <BrowserRouter>
        <Suspense>
          <SupportComponent />
          <RouteProgress />
          <ShortcutHandler />
          <SentryInitializer />
          <ErrorBoundary>
            <Routes>
              {/* Standalone routes (no layout) */}
              {authRoutes}
              {cashierRoutes}

              {/* Dashboard layout: sidebar & header persist across route changes */}
              <Route element={<DashboardLayout />}>
                {productRoutes}
                {inventoryRoutes}
                {purchasingRoutes}
                {hrRoutes}
                {financeRoutes}
                {crmRoutes}
                {reportRoutes}
                {settingsRoutes}
                {miscRoutes}
                {deliveryRoutes}
                {queueRoutes}
                {supplierPerformanceRoutes}
                {promoRoutes}
                {bundleRoutes}
              </Route>
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </BrowserRouter>

      <Modal
        type="error"
        open={authExpiredModalOpen}
        onOpenChange={setAuthExpiredModalOpen}
        title="Sesi Berakhir"
        description="Sesi login Anda telah berakhir. Silakan login kembali untuk melanjutkan."
        confirmText="Login Ulang"
        onConfirm={() => {
          setAuthExpiredModalOpen(false);
          window.location.href = "/";
        }}
      />
    </React.Fragment>
  );
}

export default App;
