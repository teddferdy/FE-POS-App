import { sanitizeInput } from "./inputSanitizer";

// ponytail: additional sanitization specifically for JSON-like payload handling
export const sanitizeJsonPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  if (Array.isArray(payload))
    return payload.map((item) => {
      if (typeof item === "string") return sanitizeInput(item);
      if (item && typeof item === "object") return sanitizeJsonPayload(item);
      return item;
    });

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") return sanitizeInput(item);
        if (item && typeof item === "object") return sanitizeJsonPayload(item);
        return item;
      });
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeJsonPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const sanitizeForStorage = (input) => {
  if (!input) return input;
  return JSON.stringify(sanitizeJsonPayload(input));
};

export const parseForClient = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeJsonPayload(parsed);
  } catch (e) {
    console.warn("Invalid JSON:", e.message);
    return null;
  }
};
