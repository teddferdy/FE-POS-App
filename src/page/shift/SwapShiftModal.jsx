import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquareText,
  Store,
  Users
} from "lucide-react";
import { resolveKaryawan } from "./shiftMembers";
import { getAllEmployee } from "@/services/employee";
import { createShiftSwap } from "@/services/shiftSwap";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const fmtTime = (t) => (t ? String(t).slice(0, 5) : "??:??");

const shiftPart = (start) => {
  const h = parseInt(String(start || "").slice(0, 2), 10);
  if (isNaN(h)) return "pagi";
  if (h < 12) return "pagi";
  if (h < 18) return "siang";
  return "malam";
};

const EmpAvatar = ({ emp, size = "w-10 h-10" }) => {
  const name = emp?.fullName || emp?.userName || "?";
  if (emp?.image) {
    return (
      <img
        src={emp.image}
        alt={name}
        className={`${size} rounded-full object-cover shrink-0 bg-muted`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const roleOf = (emp) =>
  emp?.positionData?.name || emp?.departmentData?.name || emp?.roleType || null;

const SwapShiftModal = ({
  open,
  onOpenChange,
  storeId,
  currentUserId,
  swappableShifts,
  allShifts,
  initialShift
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState("target");
  const [ownShiftId, setOwnShiftId] = useState(null);
  const [targetShiftId, setTargetShiftId] = useState(null);
  const [coworkerId, setCoworkerId] = useState(null);
  const [note, setNote] = useState("");

  const candidateOwn = swappableShifts.filter((s) => s.id != null);

  useEffect(() => {
    if (!open) return;
    setOwnShiftId(initialShift?.id ?? candidateOwn[0]?.id ?? null);
    setTargetShiftId(null);
    setCoworkerId(null);
    setNote("");
    setStep("target");
  }, [open, initialShift?.id]);

  const ownShift = allShifts.find((s) => String(s.id) === String(ownShiftId));
  const ownPart = ownShift ? shiftPart(ownShift.jam_mulai) : "";

  const targetOptions = useMemo(() => {
    if (!ownShiftId) return [];
    return allShifts.filter(
      (s) => String(s.id) !== String(ownShiftId) && shiftPart(s.jam_mulai) !== ownPart
    );
  }, [allShifts, ownShiftId, ownPart]);

  const targetShift = allShifts.find((s) => String(s.id) === String(targetShiftId));

  const { data: empData, isLoading: empLoading } = useQuery(
    ["shift-swap-employees"],
    () => getAllEmployee({ limit: 200 }),
    { enabled: open }
  );
  const employees = empData?.data || empData?.employees || [];

  const coworkerRows = useMemo(() => {
    if (!targetShift) return [];
    return resolveKaryawan(targetShift.karyawan, employees).filter((row) => {
      const emp = row.emp;
      if (!emp) return false;
      if (String(emp.id) === String(currentUserId)) return false;
      return storeId ? String(emp.store) === String(storeId) : true;
    });
  }, [targetShift, employees, currentUserId, storeId]);

  const partLabel = (part) =>
    part === "siang"
      ? t("page.shift.swap.partSiang")
      : part === "malam"
        ? t("page.shift.swap.partMalam")
        : t("page.shift.swap.partPagi");

  const hasMultipleOwn = candidateOwn.length > 1;

  const swapMutation = useMutation(createShiftSwap, {
    onSuccess: () => {
      toast.success(t("page.shift.swap.title"), {
        description: t("page.shift.swap.success")
      });
      queryClient.invalidateQueries(["my-shift", storeId]);
      queryClient.invalidateQueries(["shift-swaps-stats"]);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const canSubmit = !!ownShiftId && !!targetShiftId && !!coworkerId && !swapMutation.isLoading;

  const applyTarget = (sid) => {
    setTargetShiftId(sid);
    setCoworkerId(null);
    setStep("coworker");
  };

  const steps = [t("page.shift.swap.chooseTarget"), t("page.shift.swap.chooseCoworker")];
  const stepIdx = step === "target" ? 0 : 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-primary" />
            {t("page.shift.swap.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("page.shift.swap.subtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-4">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <ChevronRight size={13} className="text-muted-foreground/50" />}
              <span
                className={`rounded-full px-2.5 py-1 ${
                  i === stepIdx
                    ? "bg-primary/10 text-primary"
                    : i < stepIdx
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                }`}>
                {i < stepIdx ? <Check size={11} className="inline mr-1" /> : null}
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {step === "target" ? (
          <>
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t("page.shift.swap.yourShift")}
              </p>
              {hasMultipleOwn ? (
                <select
                  value={ownShiftId ?? ""}
                  onChange={(e) => {
                    setOwnShiftId(e.target.value || null);
                    setTargetShiftId(null);
                  }}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
                  {candidateOwn.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_shift || "-"} · {fmtTime(s.jam_mulai)} - {fmtTime(s.jam_selesai)} ·{" "}
                      {partLabel(shiftPart(s.jam_mulai))}
                    </option>
                  ))}
                </select>
              ) : ownShift ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {ownShift.nama_shift || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {fmtTime(ownShift.jam_mulai)} - {fmtTime(ownShift.jam_selesai)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[11px] font-semibold px-2.5 py-1">
                    {partLabel(ownPart)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("page.shift.swap.noEligible")}</p>
              )}
            </div>

            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {t("page.shift.swap.chooseTarget")}
              </h3>
              <span className="rounded-full bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5">
                {targetOptions.length}
              </span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mb-3">
              {t("page.shift.swap.chooseTargetHint", {
                part: partLabel(ownPart)
              })}
            </DialogDescription>

            {targetOptions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <Store size={26} className="text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">{t("page.shift.swap.noTargets")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {targetOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyTarget(s.id)}
                    className={`rounded-xl border p-3.5 text-left transition-colors ${
                      String(targetShiftId) === String(s.id)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {s.nama_shift || "-"}
                      </p>
                      <span className="shrink-0 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-semibold px-2 py-0.5">
                        {partLabel(shiftPart(s.jam_mulai))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1.5">
                      {fmtTime(s.jam_mulai)} - {fmtTime(s.jam_selesai)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users size={12} className="shrink-0" />
                      {t("page.shift.swap.empCount", {
                        count: (s.karyawan || []).length
                      })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                <Clock size={14} className="text-primary shrink-0" />
                <div className="leading-tight">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                    {t("page.shift.swap.yourShift")}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {ownShift?.nama_shift || "-"}{" "}
                    <span className="text-muted-foreground font-mono">
                      · {fmtTime(ownShift?.jam_mulai)} - {fmtTime(ownShift?.jam_selesai)}
                    </span>
                  </p>
                </div>
              </div>
              <ArrowRightLeft size={16} className="text-muted-foreground shrink-0" />
              <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2">
                <Clock size={14} className="text-primary shrink-0" />
                <div className="leading-tight">
                  <p className="text-[10px] text-primary uppercase font-semibold">
                    {t("page.shift.swap.targetShift")}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {targetShift?.nama_shift || "-"}{" "}
                    <span className="text-muted-foreground font-mono">
                      · {fmtTime(targetShift?.jam_mulai)} - {fmtTime(targetShift?.jam_selesai)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-1">
              {t("page.shift.swap.chooseCoworker")}
            </h3>
            <DialogDescription className="text-xs text-muted-foreground mb-3">
              {t("page.shift.swap.chooseCoworkerHint")}
            </DialogDescription>

            {empLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : coworkerRows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <Users size={26} className="text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">{t("page.shift.swap.noCoworkers")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {coworkerRows.map(({ key, emp }) => {
                  const role = roleOf(emp);
                  const active = String(coworkerId) === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCoworkerId(emp.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
                      }`}>
                      <EmpAvatar emp={emp} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {emp.fullName || emp.userName || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{role || "-"}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-semibold px-2 py-0.5">
                          {t("page.shift.swap.coworkerOn")}
                        </span>
                        <div
                          className={`mt-1.5 w-5 h-5 mx-auto rounded-full border flex items-center justify-center transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}>
                          {active && <Check size={12} />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {t("page.shift.swap.note")}
              </label>
              <div className="relative">
                <MessageSquareText
                  size={15}
                  className="absolute left-3 top-3 text-muted-foreground/70"
                />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("page.shift.swap.notePlaceholder")}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
          <div>
            {step === "coworker" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep("target");
                  setCoworkerId(null);
                }}>
                {t("page.shift.swap.back")}
              </Button>
            )}
          </div>
          {step === "target" ? (
            <Button size="sm" disabled={!targetShiftId} onClick={() => setStep("coworker")}>
              {t("page.shift.swap.next")}
              <ChevronRight size={14} />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!canSubmit}
              onClick={() =>
                swapMutation.mutate({
                  requesterShiftId: ownShiftId,
                  targetShiftId,
                  targetId: coworkerId,
                  note: note.trim() || undefined
                })
              }>
              {swapMutation.isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRightLeft size={14} />
              )}
              {swapMutation.isLoading
                ? t("page.shift.swap.submitting")
                : t("page.shift.swap.submit")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapShiftModal;
