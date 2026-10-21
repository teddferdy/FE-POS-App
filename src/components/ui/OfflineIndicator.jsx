import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { onOnline, onOffline, isOnline } from "@/services/offline";

// DR-25: the POS has no offline mode — nothing is queued or stored on the
// device while the connection is down, and every save/payment/print needs
// the server. These indicators say exactly that; they used to promise
// "data saved locally" and a sync queue that never existed.

// Tracks navigator.onLine; announces each transition once.
export const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [isOnlineState, setIsOnlineState] = useState(true);

  useEffect(() => {
    setIsOnlineState(isOnline());

    const unsubscribeOnline = onOnline(() => {
      setIsOnlineState(true);
      toast.success(t("offline.backOnline"), {
        description: t("offline.backOnlineHint")
      });
    });

    const unsubscribeOffline = onOffline(() => {
      setIsOnlineState(false);
      toast.warning(t("offline.goneOffline"), {
        description: t("offline.actionsBlocked")
      });
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [t]);

  if (isOnlineState) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
      role="status"
      aria-live="polite">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">{t("offline.offlineMode")}</span>
    </div>
  );
};

export const OfflineBanner = () => {
  const { t } = useTranslation();
  const [isOnlineState, setIsOnlineState] = useState(true);

  useEffect(() => {
    setIsOnlineState(isOnline());
    const unsubscribeOnline = onOnline(() => setIsOnlineState(true));
    const unsubscribeOffline = onOffline(() => setIsOnlineState(false));
    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, []);

  if (isOnlineState) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-amber-50 py-2 px-4 text-center text-sm font-medium shadow-lg animate-slide-down"
      role="alert"
      aria-live="assertive">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>{t("offline.offlineBanner")}</span>
      </div>
    </div>
  );
};
