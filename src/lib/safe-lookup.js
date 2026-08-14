export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(Object(obj), key);

export const safeGet = (obj, key, fallback) => (hasOwn(obj, key) ? obj[key] : fallback);
