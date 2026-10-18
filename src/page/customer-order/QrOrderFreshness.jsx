import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TICK_MS = 5000;

// DR-10 (BA §35.7): bounded operational awareness — stale state must be
// visibly stale and never presented as authoritative. Shows how old the
// pending-QR list is; when a refresh fails while older data is still on
// screen, says so explicitly instead of silently showing the old list.
const QrOrderFreshness = ({ updatedAt, isFetching, isError, onRetry }) => {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  if (!updatedAt) return null;

  if (isError) {
    const time = new Date(updatedAt).toLocaleTimeString(i18n?.language, {
      hour: "2-digit",
      minute: "2-digit"
    });
    return (
      <div
        role="status"
        aria-atomic="true"
        className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
        <AlertTriangle size={16} className="shrink-0" aria-hidden="true" />
        <span className="flex-1">{t("page.customerOrder.freshness.stale", { time })}</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} loading={isFetching}>
          {!isFetching && <RefreshCw size={14} className="mr-1" aria-hidden="true" />}
          {t("page.customerOrder.retry")}
        </Button>
      </div>
    );
  }

  // Plain text, not a live region: a ticking age would make screen readers
  // announce every few seconds. Only the stale state above is announced.
  const seconds = Math.max(0, Math.floor((now - updatedAt) / 1000));
  return (
    <p className="text-xs text-muted-foreground" data-testid="qr-orders-freshness">
      {isFetching
        ? t("page.customerOrder.freshness.refreshing")
        : seconds < 5
          ? t("page.customerOrder.freshness.justNow")
          : t("page.customerOrder.freshness.updated", { seconds })}
    </p>
  );
};

QrOrderFreshness.propTypes = {
  updatedAt: PropTypes.number,
  isFetching: PropTypes.bool,
  isError: PropTypes.bool,
  onRetry: PropTypes.func.isRequired
};

export default QrOrderFreshness;
