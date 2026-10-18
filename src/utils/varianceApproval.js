// DR-15 cash-variance decision. Mirrors the backend contract
// (PUT /cash-register/:id/decide-variance, super_admin only): a register may be
// decided only once it is CLOSED and its varianceApprovalStatus is
// "pending_approval". The backend stays authoritative — these checks only
// decide what the UI offers.
export const VARIANCE_STATUS = {
  AUTO_APPROVED: "auto_approved",
  PENDING: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const canDecideVariance = ({ roleType, registerStatus, approvalStatus }) =>
  roleType === "super_admin" &&
  registerStatus === "closed" &&
  approvalStatus === VARIANCE_STATUS.PENDING;

// Classifies a failed decision request. 409 = the register is no longer
// pending (decided elsewhere, or not closed); a response-less error means the
// request never reached the server, so nothing was saved.
export const varianceDecisionErrorKind = (err) => {
  const status = err?.response?.status;
  if (status === 409) return "conflict";
  if (status === 403) return "forbidden";
  if (status) return "failed";
  return "network";
};
