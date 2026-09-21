// Phase 39 Batch 6-prereq: FE-side counterpart to BE's
// utils/businessDate.js (Phase 22 Batch 3) — same DEFAULT_TIMEZONE
// convention and the same "validate, fall back, never throw" contract,
// so a register timestamp renders in the store's local time instead of
// the viewer's browser timezone. Dependency-free like its BE counterpart:
// the browser's built-in Intl already carries the full IANA timezone
// database, so no date library is introduced.

export const DEFAULT_TIMEZONE = "Asia/Jakarta";

export const isValidTimezone = (timezone) => {
  if (typeof timezone !== "string" || !timezone.trim()) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

const resolveTimezone = (timezone) => (isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE);

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Matches the existing `date.toLocaleDateString("id")` format used across
// the cash-register pages (numeric day/month/year, Indonesian locale) —
// same locale, only the timezone changes from browser-local to the
// store's IANA timezone.
export const formatStoreDate = (value, timezone) => {
  const d = toDate(value);
  if (!d) return null;
  return new Intl.DateTimeFormat("id", {
    timeZone: resolveTimezone(timezone),
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).format(d);
};

// Matches the existing `date.toTimeString().slice(0, 8)` format
// (24-hour HH:MM:SS) used across the cash-register pages.
export const formatStoreTime = (value, timezone) => {
  const d = toDate(value);
  if (!d) return null;
  return d.toLocaleTimeString("en-GB", {
    timeZone: resolveTimezone(timezone),
    hour12: false
  });
};

// Matches the existing plain `date.toLocaleString("id")` format
// (dot-separated time, comma-joined with the date) used for the register
// window caption and other combined date+time displays.
export const formatStoreDateTime = (value, timezone) => {
  const d = toDate(value);
  if (!d) return null;
  const tz = resolveTimezone(timezone);
  const datePart = formatStoreDate(d, tz);
  const timePart = new Intl.DateTimeFormat("id", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(d);
  return `${datePart}, ${timePart}`;
};
