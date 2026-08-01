import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { syncOfflineData, registerBackgroundSync, onOnline, onOffline, isOnline } from "@/services/offline";

export const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [isOnlineState, setIsOnlineState] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [queueCount, setQueueCount] = useState(0);

  const checkQueueCount = useCallback(async () => {
    try {
      const { getSyncQueue } = await import("@/services/offline");
      const queue = await getSyncQueue();
      setQueueCount(queue.length);
    } catch {
      setQueueCount(0);
    }
  }, []);

  useEffect(() => {
    setIsOnlineState(isOnline());
    checkQueueCount();

    const unsubscribeOnline = onOnline(async () => {
      setIsOnlineState(true);
      toast.success(t("offline.backOnline"), {
        description: t("offline.syncing")
      });
      await registerBackgroundSync();
      await syncAndNotify();
      checkQueueCount();
    });

    const unsubscribeOffline = onOffline(() => {
      setIsOnlineState(false);
      toast.warning(t("offline.goneOffline"), {
        description: t("offline.dataSavedLocally")
      });
      checkQueueCount();
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [checkQueueCount]);

  const syncAndNotify = async () => {
    setIsSyncing(true);
    try {
      const { syncOfflineData } = await import("@/services/offline");
      const result = await syncOfflineData();
      setLastSync(new Date());
      if (result.synced > 0) {
        toast.success(t("offline.syncComplete"), {
          description: `${result.synced} ${t("offline.ordersSynced")}`
        });
      }
      if (result.failed > 0) {
        toast.error(t("offline.syncFailed"), {
          description: `${result.failed} ${t("offline.ordersFailed")}`
        });
      }
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setIsSyncing(false);
      checkQueueCount();
    }
  };

  if (isOnlineState && queueCount === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border transition-all duration-300 ${
        isOnlineState
          ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          : "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
      }`}
      role="status"
      aria-live="polite"
    >
      {!isOnlineState && (
        <>
          <WifiOff className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">{t("offline.offlineMode")}</span>
        </>
      )}
      {isOnlineState && queueCount > 0 && (
        <>
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isSyncing
              ? t("offline.syncing")
              : `${queueCount} ${t("offline.pendingSync")}`}
          </span>
        </>
      )}
      {isOnlineState && queueCount === 0 && lastSync && (
        <>
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {t("offline.lastSync", { time: lastSync.toLocaleTimeString() })}
          </span>
        </>
      )}
      {(isOnlineState && queueCount > 0 && !isSyncing) && (
        <button
          onClick={syncAndNotify}
          className="ml-1 px-2 py-0.5 text-xs font-medium rounded bg-white/20 hover:bg-white/30 transition-colors"
        >
          {t("offline.syncNow")}
        </button>
      )}
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
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>{t("offline.offlineBanner")}</span>
      </div>
    </div>
  );
};