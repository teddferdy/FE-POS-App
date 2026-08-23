// ponytail: validasi angka polos tanpa regex — bebas pola DoS regex (Codacy)
const isPlainNumeric = (str) => {
  if (!str) return false;
  const body = str.startsWith("-") ? str.slice(1) : str;
  const parts = body.split(".");
  if (parts.length > 2) return false;
  return parts.every((part) => part.length > 0 && [...part].every((ch) => ch >= "0" && ch <= "9"));
};

export function sanitizeInput(value) {
  if (typeof value === "string") {
    let s = value;
    let modified = false;
    const step = (re, repl = "") => {
      const next = s.replace(re, repl);
      if (next !== s) modified = true;
      s = next;
    };
    step(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi);
    step(/<[^>]*>/g);
    step(/<\/[^>]*>/g);
    step(/['"]\s*\)?\s*;.*$/g);
    step(/;.*$/g);
    s = s.replace(/\s+/g, " ").trim();
    if (s !== value) modified = true;
    if (modified && isPlainNumeric(s)) return Number(s);
    return s;
  }
  if (Array.isArray(value)) return value.map(sanitizeInput);
  if (value && typeof value === "object") {
    // ponytail: fromEntries — tanpa penulisan berkunci variabel (Codacy)
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, sanitizeInput(val)]));
  }
  return value;
}

export function sanitizeForUrl(url) {
  if (!url || /^javascript:/i.test(url)) return "";
  return url;
}

export function sanitizeHtml(html) {
  if (typeof html !== "string") return html;
  return html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
}

export function sanitizeForJson(value) {
  return sanitizeInput(value);
}

export function validateInputLength(input, maxLength) {
  if (typeof input !== "string") return false;
  return input.length <= maxLength;
}
