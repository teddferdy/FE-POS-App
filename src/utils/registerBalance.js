// A register's closing balance is final only once the register is CLOSED
// (same rule as XZReport). While it is open there is no closing balance —
// the stored placeholder must not be shown as if it were one.
export const finalClosingBalance = (register) =>
  register?.status === "closed" && register?.closingBalance != null
    ? Number(register.closingBalance)
    : null;
