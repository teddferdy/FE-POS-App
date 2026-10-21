// Connectivity only. DR-25: the POS has no offline mode — there is no local
// cache or sync queue (the IndexedDB queue that used to live here had no
// writer, so nothing was ever stored or replayed).

export const isOnline = () => navigator.onLine;

export const onOnline = (callback) => {
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
};

export const onOffline = (callback) => {
  window.addEventListener("offline", callback);
  return () => window.removeEventListener("offline", callback);
};
