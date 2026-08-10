const baseUrl = import.meta.env.VITE_BASE_URL;

if (!baseUrl) {
  throw new Error(
    "VITE_BASE_URL is not set. Add it to your .env file (e.g. VITE_BASE_URL=https://api-bisa-nota.vercel.app) or Vercel environment variables."
  );
}

export const ENDPOINT = Object.freeze({
  BASE_URL: String(baseUrl).replace(/\/+$/, "")
});
