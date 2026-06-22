/* eslint-disable react/prop-types */
import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  confirm: AlertTriangle
};

const iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  confirm: "text-amber-500"
};

const KNOWN_TYPES = Object.keys(iconMap);

export default function Modal({
  open,
  onOpenChange,
  type = "confirm",
  title,
  description,
  icon: IconOverride,
  confirmText,
  cancelText,
  confirmVariant,
  onConfirm,
  onCancel,
  loading,
  className,
  children
}) {
  const { t } = useTranslation();
  const isKnownType = KNOWN_TYPES.includes(type);
  const isForm = type === "form";

  const defaultText = {
    success: { confirm: t("common.ok") },
    error: { confirm: t("common.ok") },
    confirm: { cancel: t("common.cancel") },
    form: { cancel: t("common.cancel"), confirm: t("common.save") }
  };

  const defaultDescription = {
    success: t("modal.successDescription"),
    error: t("modal.errorDescription"),
    confirm: t("modal.confirmDescription")
  };

  const Icon = isKnownType ? IconOverride || iconMap[type] : null;
  const isNotification = type === "success" || type === "error";
  const confirmLabel = confirmText || defaultText[type]?.confirm || t("common.confirm");
  const cancelLabel = cancelText || defaultText[type]?.cancel || t("common.cancel");
  const desc = description || defaultDescription[type] || "";

  const confirmBtnVariant = confirmVariant || (type === "error" ? "destructive" : "default");

  const confirmBtnClass = type === "success" ? "bg-green-600 hover:bg-green-700 text-white" : "";

  const handleClose = () => onOpenChange?.(false);

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent withX={false} className={cn("sm:max-w-[500px]", className)}>
        {isKnownType ? (
          <>
            <DialogHeader className="items-center text-center gap-0">
              <div className={cn("mb-4", iconColorMap[type])}>
                <Icon className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              {desc && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {desc}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="flex justify-center gap-3 mt-4">
              {!isNotification && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {cancelLabel}
                </Button>
              )}
              <Button
                type="button"
                variant={confirmBtnVariant}
                className={confirmBtnClass}
                disabled={loading}
                onClick={handleConfirm}>
                {loading ? t("common.loading") : confirmLabel}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              {desc && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {desc}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="py-4">{children}</div>
            {isForm && (
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {cancelLabel}
                </Button>
                <Button
                  type="button"
                  variant={confirmBtnVariant}
                  className={confirmBtnClass}
                  disabled={loading}
                  onClick={handleConfirm}>
                  {loading ? t("common.loading") : confirmLabel}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
