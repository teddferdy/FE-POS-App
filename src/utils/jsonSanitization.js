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

  // ponytail: fromEntries + map — O(N), tanpa object injection (Codacy)
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === "string") return [key, sanitizeInput(value)];
      if (Array.isArray(value)) {
        return [
          key,
          value.map((item) => {
            if (typeof item === "string") return sanitizeInput(item);
            if (item && typeof item === "object") return sanitizeJsonPayload(item);
            return item;
          })
        ];
      }
      if (value && typeof value === "object") return [key, sanitizeJsonPayload(value)];
      return [key, value];
    })
  );
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
