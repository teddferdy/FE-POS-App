// ponytail: Math.random() ditandai CRITICAL Codacy (weak RNG) — ganti ke
// crypto.getRandomValues; untuk kebutuhan dekoratif/id internal kualitas
// ini lebih dari cukup tanpa dependensi tambahan

export const secureRandom = () => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
};

export const randomToken = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const buf = new Uint32Array(length);
  window.crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join("");
};
