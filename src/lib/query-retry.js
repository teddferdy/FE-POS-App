// ponytail: 4xx (403/404/422 …) tidak berubah dengan diulang — dulu `retry: 2`
// membuat tiap request yang ditolak terkirim 3x (dan tiap 403 memicu probe
// /auth/context lagi). Hanya error jaringan / 5xx yang di-retry, maks 2x.
export const MAX_QUERY_RETRIES = 2;

export const shouldRetryQuery = (failureCount, error) => {
  const status = error?.response?.status;
  if (status >= 400 && status < 500) return false;
  return failureCount < MAX_QUERY_RETRIES;
};
