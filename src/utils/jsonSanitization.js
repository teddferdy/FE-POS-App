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

  // ponytail: reduce + rebuild literal — bebas object injection (Codacy)
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (typeof value === "string") {
      return { ...acc, [key]: sanitizeInput(value) };
    }
    if (Array.isArray(value)) {
      return {
        ...acc,
        [key]: value.map((item) => {
          if (typeof item === "string") return sanitizeInput(item);
          if (item && typeof item === "object") return sanitizeJsonPayload(item);
          return item;
        })
      };
    }
    if (value && typeof value === "object") {
      return { ...acc, [key]: sanitizeJsonPayload(value) };
    }
    return { ...acc, [key]: value };
  }, {});
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
