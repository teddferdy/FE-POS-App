/* eslint-disable react/prop-types */
import React from "react";
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

const defaultText = {
  success: { confirm: "Oke" },
  error: { confirm: "Oke" },
  confirm: { cancel: "Batal" },
  form: { cancel: "Batal", confirm: "Simpan" }
};

const defaultDescription = {
  success: "Data berhasil diproses",
  error: "Gagal memproses data",
  confirm: "Apakah anda yakin ingin melanjutkan?"
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
  className,
  children
}) {
  const isKnownType = KNOWN_TYPES.includes(type);
  const isForm = type === "form";

  const Icon = isKnownType ? IconOverride || iconMap[type] : null;
  const isNotification = type === "success" || type === "error";
  const confirmLabel = confirmText || defaultText[type]?.confirm || "Konfirmasi";
  const cancelLabel = cancelText || defaultText[type]?.cancel || "Batal";
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
                onClick={handleConfirm}>
                {confirmLabel}
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
                  onClick={handleConfirm}>
                  {confirmLabel}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
