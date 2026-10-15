import React, { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { updateOrderStatus } from "@/services/order";

const REASON_MAX = 255;

// DR-23 §G / DR-08: void ends a paid or part-paid order with an immediate
// refund of everything collected, stock/loyalty/journal reversal and
// fulfilment → void. It is an elevated capability (order.void), needs a
// reason, and runs as one atomic server operation — the server owns every
// rule; this dialog only collects the reason (and the refund reference the
// server asks for when a non-cash portion is refunded) and maps refusals
// to an actionable message next to the field that fixes them.
export const voidErrorFor = (error) => {
  const data = error?.response?.data || {};
  switch (data.code) {
    case "REASON_REQUIRED":
      return { field: "reason", key: "page.voidOrder.reasonRequired" };
    case "REFERENCE_REQUIRED":
      return { field: "reference", key: "page.voidOrder.referenceRequired" };
    case "REGISTER_REQUIRED":
      return { field: null, key: "page.voidOrder.registerRequired" };
    case "REFUND_REGISTER_ATTRIBUTION_UNAVAILABLE":
      return { field: null, key: "page.voidOrder.registerAttribution" };
    case "FORBIDDEN":
      return { field: null, key: "page.voidOrder.forbidden" };
    default:
      return { field: null, key: "page.voidOrder.failed", detail: data.error || data.message };
  }
};

const VoidOrderDialog = ({ open, onOpenChange, order, store, onVoided }) => {
  const { t } = useTranslation();
  const ids = useId();
  const reasonId = `${ids}-reason`;
  const referenceId = `${ids}-reference`;
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState(null);
  const reasonRef = useRef(null);
  const referenceRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setReference("");
      setError(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      updateOrderStatus({
        id: order.id,
        store,
        status: "void",
        reason: reason.trim(),
        ...(reference.trim() ? { refundReference: reference.trim() } : {})
      }),
    onSuccess: () => {
      toast.success(t("page.voidOrder.success", { orderNumber: order.orderNumber || order.id }));
      onVoided?.(order);
      onOpenChange(false);
    },
    onError: (err) => {
      const mapped = voidErrorFor(err);
      setError(mapped);
      if (mapped.field === "reason") reasonRef.current?.focus();
      if (mapped.field === "reference") referenceRef.current?.focus();
    }
  });

  const submit = (e) => {
    e.preventDefault();
    if (mutation.isLoading) return;
    if (!reason.trim()) {
      setError({ field: "reason", key: "page.voidOrder.reasonRequired" });
      reasonRef.current?.focus();
      return;
    }
    setError(null);
    mutation.mutate();
  };

  const fieldError = (field) => (error?.field === field ? t(error.key) : null);
  const formError = error && !error.field ? t(error.key) : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isLoading && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>
              {t("page.voidOrder.title", { orderNumber: order?.orderNumber || order?.id })}
            </DialogTitle>
            <DialogDescription>{t("page.voidOrder.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  {formError}
                  {error?.detail ? ` (${error.detail})` : ""}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor={reasonId}>
                {t("page.voidOrder.reasonLabel")}{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Textarea
                id={reasonId}
                ref={reasonRef}
                value={reason}
                maxLength={REASON_MAX}
                required
                aria-required="true"
                aria-invalid={Boolean(fieldError("reason"))}
                aria-describedby={`${reasonId}-help${fieldError("reason") ? ` ${reasonId}-error` : ""}`}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p id={`${reasonId}-help`} className="text-xs text-muted-foreground">
                {t("page.voidOrder.reasonHelp")}
              </p>
              {fieldError("reason") && (
                <p id={`${reasonId}-error`} role="alert" className="text-xs text-destructive">
                  {fieldError("reason")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={referenceId}>{t("page.voidOrder.referenceLabel")}</Label>
              <Input
                id={referenceId}
                ref={referenceRef}
                value={reference}
                maxLength={255}
                aria-invalid={Boolean(fieldError("reference"))}
                aria-describedby={`${referenceId}-help${fieldError("reference") ? ` ${referenceId}-error` : ""}`}
                onChange={(e) => setReference(e.target.value)}
              />
              <p id={`${referenceId}-help`} className="text-xs text-muted-foreground">
                {t("page.voidOrder.referenceHelp")}
              </p>
              {fieldError("reference") && (
                <p id={`${referenceId}-error`} role="alert" className="text-xs text-destructive">
                  {fieldError("reference")}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isLoading}
              onClick={() => onOpenChange(false)}>
              {t("page.voidOrder.keep")}
            </Button>
            <Button type="submit" variant="destructive" loading={mutation.isLoading}>
              {mutation.isLoading ? t("page.voidOrder.voiding") : t("page.voidOrder.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

VoidOrderDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    orderNumber: PropTypes.string
  }),
  store: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onVoided: PropTypes.func
};

export default VoidOrderDialog;
