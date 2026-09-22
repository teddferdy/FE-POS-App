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

// Phase 39 Batch 6F: register-hours informational banners need "now" as a
// {dayName, minutes} pair in the STORE's timezone — never the browser's —
// so a register opened/closed near midnight is compared against the
// correct day's schedule and the correct wall-clock minute. dayName is
// lowercase to match the openingHours `day` convention (EditLocation.jsx:
// "monday".."sunday").
export const getStoreNowParts = (timezone, now = new Date()) => {
  const tz = resolveTimezone(timezone);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return {
    dayName: get("weekday")?.toLowerCase() || null,
    minutes: Number.isNaN(hour) || Number.isNaN(minute) ? null : hour * 60 + minute
  };
};

// Formats a minutes-since-midnight integer back to "HH:MM" for display —
// pairs with parseScheduleTimeToMinutes/getTodayScheduleMinutes below.
export const formatMinutesAsTime = (minutes) => {
  if (typeof minutes !== "number" || Number.isNaN(minutes)) return null;
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Parses an "HH:MM" schedule string into minutes-since-midnight, or null
// for anything missing/malformed. Callers must treat null as "no
// scheduled time" (e.g. a closed day), never as midnight.
export const parseScheduleTimeToMinutes = (value) => {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

// Phase 39 Batch 6F: resolves today's configured open/close minutes (in
// the store's timezone) alongside the current minute, for a register-hours
// informational banner to compare against. Returns null whenever there is
// nothing safe to say — no openingHours array, no entry for today, or an
// unreadable current time — so a caller's absence-of-signal always means
// "show no banner," never a crash or a guessed rule. A closed day
// (open/close both null) still returns a result, with openMinutes/
// closeMinutes as null, so callers can distinguish "no schedule today"
// (a real, non-null result with both minutes null) from "unreadable input"
// (a null return). Phase 39 Batch 6E: callers now use that distinction to
// surface their own "closed today" notice for the former case, while the
// latter still means silence — see CashRegisterOpenClose/Current.jsx.
export const getTodayScheduleMinutes = (openingHours, timezone, now = new Date()) => {
  try {
    if (!Array.isArray(openingHours)) return null;
    const { dayName, minutes: nowMinutes } = getStoreNowParts(timezone, now);
    if (!dayName || nowMinutes == null) return null;
    const today = openingHours.find((entry) => entry?.day?.toLowerCase?.() === dayName);
    if (!today) return null;
    return {
      nowMinutes,
      openMinutes: parseScheduleTimeToMinutes(today.open),
      closeMinutes: parseScheduleTimeToMinutes(today.close)
    };
  } catch {
    return null;
  }
};
