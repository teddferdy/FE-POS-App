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
    if (modified && /^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  }
  if (Array.isArray(value)) return value.map(sanitizeInput);
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, val] of Object.entries(value)) result[key] = sanitizeInput(val);
    return result;
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
