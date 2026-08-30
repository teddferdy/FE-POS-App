import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteProgress from "@/components/ui/route-progress";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";

// Offline
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { setupAutoSync } from "@/services/offline";

// Layout
const DashboardLayout = React.lazy(() => import("./components/layout/DashboardLayout"));

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
  waiterRoutes,
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

// ponytail: Sentry (chunk 92KB) jangan bersaing di critical path —
// baru dimuat setelah halaman idle, error awal tetap ter-queue oleh browser? Tidak:
// error sebelum init memang tidak terekam; trade-off disengaja demi LCP.
const DeferredSentry = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => setReady(true);
    // ponytail: minimum 1.5s — rIC saja bisa fire di t=200ms saat browser
    // menganggap idle sebelum puncak beban render
    const t = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(start, { timeout: 3000 });
        return () => window.cancelIdleCallback(id);
      }
      start();
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  return ready ? <SentryInitializer /> : null;
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
          <DeferredSentry />
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
                {waiterRoutes}
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
          window.location.assign("/");
        }}
      />
    </React.Fragment>
  );
}

export default App;
