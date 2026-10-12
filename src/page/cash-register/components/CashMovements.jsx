import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine, Check, Plus, RotateCcw, X } from "lucide-react";
import {
  listCashMovements,
  createCashMovement,
  decideCashMovement,
  reverseCashMovement
} from "@/services/cash-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";

const MOVEMENT_TYPES = ["cash_in", "cash_out"];
const REASON_CODES = [
  "float_topup",
  "bank_drop",
  "petty_cash",
  "owner_draw",
  "change_fund",
  "correction",
  "other"
];

const formatIDR = (num) => {
  if (num === null || num === undefined) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `mv-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

const StatusBadge = ({ status, t }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
    {t(`page.cashRegister.movements.status.${status}`, status)}
  </span>
);

const CashMovements = ({ registerId, canManage }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [recording, setRecording] = React.useState(false);
  const [confirming, setConfirming] = React.useState(null);
  const [form, setForm] = React.useState({
    type: "cash_in",
    reasonCode: "float_topup",
    amount: "",
    notes: ""
  });
  const [fieldError, setFieldError] = React.useState(null);

  const movementsQuery = useQuery(
    ["cash-movements", registerId],
    () => listCashMovements(registerId),
    { enabled: !!registerId, retry: false }
  );
  const movements = movementsQuery.data?.data || [];

  const invalidate = () => {
    queryClient.invalidateQueries(["cash-movements", registerId]);
    queryClient.invalidateQueries(["cash-register"]);
  };

  const recordMut = useMutation(
    () =>
      createCashMovement(registerId, {
        type: form.type,
        reasonCode: form.reasonCode,
        amount: Number(form.amount),
        notes: form.notes?.trim() ? form.notes.trim() : undefined,
        idempotencyKey: newIdempotencyKey()
      }),
    {
      onSuccess: () => {
        toast.success(t("page.cashRegister.movements.recorded"));
        setRecording(false);
        setForm({ type: "cash_in", reasonCode: "float_topup", amount: "", notes: "" });
        setFieldError(null);
        invalidate();
      },
      onError: (err) =>
        toast.error(t("page.cashRegister.movements.recordFailed"), {
          description: err?.response?.data?.message || err.message
        })
    }
  );

  const decideMut = useMutation(({ id, decision }) => decideCashMovement(id, decision), {
    onSuccess: (_data, { decision }) => {
      toast.success(
        t(
          decision === "approve"
            ? "page.cashRegister.movements.approved"
            : "page.cashRegister.movements.rejected"
        )
      );
      setConfirming(null);
      invalidate();
    },
    onError: (err) =>
      toast.error(t("page.cashRegister.movements.decideFailed"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const reverseMut = useMutation((id) => reverseCashMovement(id, {}), {
    onSuccess: () => {
      toast.success(t("page.cashRegister.movements.reversed"));
      setConfirming(null);
      invalidate();
    },
    onError: (err) =>
      toast.error(t("page.cashRegister.movements.reverseFailed"), {
        description: err?.response?.data?.message || err.message
      })
  });

  // The Modal closes on confirm unless onConfirm resolves false, so
  // validation failures return false to keep the form open on the error.
  const submitRecord = () => {
    const amount = Number(form.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setFieldError(t("page.cashRegister.movements.amountPositive"));
      return false;
    }
    if (form.reasonCode === "other" && !form.notes?.trim()) {
      setFieldError(t("page.cashRegister.movements.notesRequiredForOther"));
      return false;
    }
    setFieldError(null);
    recordMut.mutate();
    return undefined;
  };

  const confirmAction = () => {
    if (!confirming) return;
    if (confirming.action === "reject")
      decideMut.mutate({ id: confirming.movement.id, decision: "reject" });
    if (confirming.action === "reverse") reverseMut.mutate(confirming.movement.id);
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t("page.cashRegister.movements.title")}</h2>
        {canManage && (
          <Button size="sm" onClick={() => setRecording(true)}>
            <Plus size={16} className="mr-1" /> {t("page.cashRegister.movements.recordBtn")}
          </Button>
        )}
      </div>

      {movementsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : movementsQuery.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {t("page.cashRegister.movements.loadFailed")}{" "}
          <button type="button" className="underline" onClick={() => movementsQuery.refetch()}>
            {t("page.cashRegister.movements.retry")}
          </button>
        </p>
      ) : movements.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("page.cashRegister.movements.empty")}</p>
      ) : (
        <ul className="divide-y divide-muted/30">
          {movements.map((mv) => (
            <li key={mv.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {mv.type === "cash_in" ? (
                  <ArrowDownToLine
                    size={18}
                    className="shrink-0 text-green-600"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowUpFromLine
                    size={18}
                    className="shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {t(`page.cashRegister.movements.type.${mv.type}`, mv.type)}
                    </span>
                    <StatusBadge status={mv.status} t={t} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {t(`page.cashRegister.movements.reason.${mv.reasonCode}`, mv.reasonCode)}
                    {mv.notes ? ` — ${mv.notes}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    mv.type === "cash_in" ? "text-green-600" : "text-destructive"
                  }`}>
                  {mv.type === "cash_in" ? "+" : "-"}
                  {formatIDR(mv.amount)}
                </span>
                {canManage && mv.status === "pending_approval" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={decideMut.isLoading}
                      onClick={() => decideMut.mutate({ id: mv.id, decision: "approve" })}
                      aria-label={t("page.cashRegister.movements.approveAria", { id: mv.id })}>
                      <Check size={14} className="mr-1" />
                      {t("page.cashRegister.movements.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={decideMut.isLoading}
                      onClick={() => setConfirming({ action: "reject", movement: mv })}
                      aria-label={t("page.cashRegister.movements.rejectAria", { id: mv.id })}>
                      <X size={14} className="mr-1" />
                      {t("page.cashRegister.movements.reject")}
                    </Button>
                  </>
                )}
                {canManage && mv.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reverseMut.isLoading}
                    onClick={() => setConfirming({ action: "reverse", movement: mv })}
                    aria-label={t("page.cashRegister.movements.reverseAria", { id: mv.id })}>
                    <RotateCcw size={14} className="mr-1" />
                    {t("page.cashRegister.movements.reverse")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        type="form"
        open={recording}
        onOpenChange={(o) => !o && setRecording(false)}
        title={t("page.cashRegister.movements.recordTitle")}
        confirmText={t("common.save")}
        loading={recordMut.isLoading}
        onConfirm={submitRecord}>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="movement-type">{t("page.cashRegister.movements.typeLabel")}</Label>
            <select
              id="movement-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {MOVEMENT_TYPES.map((m) => (
                <option key={m} value={m}>
                  {t(`page.cashRegister.movements.type.${m}`, m)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="movement-reason">{t("page.cashRegister.movements.reasonLabel")}</Label>
            <select
              id="movement-reason"
              value={form.reasonCode}
              onChange={(e) => setForm((f) => ({ ...f, reasonCode: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {REASON_CODES.map((r) => (
                <option key={r} value={r}>
                  {t(`page.cashRegister.movements.reason.${r}`, r)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="movement-amount">
              {t("page.cashRegister.movements.amountLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="movement-amount"
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") }))
              }
              placeholder="50000"
              aria-describedby={fieldError ? "movement-form-error" : undefined}
              className="h-11 tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="movement-notes">{t("page.cashRegister.movements.notesLabel")}</Label>
            <Input
              id="movement-notes"
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={t("page.cashRegister.movements.notesPlaceholder")}
            />
          </div>
          {fieldError && (
            <p id="movement-form-error" className="text-xs text-destructive" role="alert">
              {fieldError}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        type="confirm"
        open={!!confirming}
        onOpenChange={(o) => !o && setConfirming(null)}
        confirmVariant="destructive"
        title={t(
          confirming?.action === "reverse"
            ? "page.cashRegister.movements.reverseTitle"
            : "page.cashRegister.movements.rejectTitle"
        )}
        description={t(
          confirming?.action === "reverse"
            ? "page.cashRegister.movements.reverseConfirm"
            : "page.cashRegister.movements.rejectConfirm"
        )}
        confirmText={t(
          confirming?.action === "reverse"
            ? "page.cashRegister.movements.reverse"
            : "page.cashRegister.movements.reject"
        )}
        loading={decideMut.isLoading || reverseMut.isLoading}
        onConfirm={confirmAction}
      />
    </div>
  );
};

export default CashMovements;
