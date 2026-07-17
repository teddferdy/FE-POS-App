/* eslint-disable react/prop-types */
import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MissingFieldsModal({ open, onOpenChange, fields = [] }) {
  const handleClose = () => {
    onOpenChange(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}>
      <DialogContent withX={false} className="sm:max-w-[425px]">
        <DialogHeader className="items-center text-center gap-0">
          <div className="mb-4 text-amber-500">
            <AlertTriangle className="w-16 h-16" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-xl font-semibold">Field Wajib Kosong</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Silakan lengkapi field berikut sebelum menyimpan:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{field}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={handleClose} className="px-8">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
