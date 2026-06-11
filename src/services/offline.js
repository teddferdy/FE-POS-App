const DB_NAME = "POSOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "offlineCache";

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true
          });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  return dbPromise;
}

export const cacheData = async (key, data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ key, data, timestamp: Date.now() });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (e) {
    console.error("Offline cache error:", e);
  }
};

export const getCachedData = async (key) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const result = await new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return result?.data || null;
  } catch {
    return null;
  }
};

export const clearCache = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (e) {
    console.error("Clear cache error:", e);
  }
};

export const addToSyncQueue = async (operation) => {
  try {
    const db = await getDB();
    const tx = db.transaction("syncQueue", "readwrite");
    tx.objectStore("syncQueue").add({
      ...operation,
      timestamp: Date.now(),
      retries: 0
    });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (e) {
    console.error("Sync queue error:", e);
  }
};

export const getSyncQueue = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    const result = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return result || [];
  } catch {
    return [];
  }
};

export const removeFromSyncQueue = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction("syncQueue", "readwrite");
    tx.objectStore("syncQueue").delete(id);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (e) {
    console.error("Remove from sync queue error:", e);
  }
};

export const syncOfflineData = async () => {
  const queue = await getSyncQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers || { "Content-Type": "application/json" },
        body: item.body ? JSON.stringify(item.body) : undefined
      });

      if (response.ok) {
        await removeFromSyncQueue(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
};

export const isOnline = () => navigator.onLine;

export const onOnline = (callback) => {
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
};

export const onOffline = (callback) => {
  window.addEventListener("offline", callback);
  return () => window.removeEventListener("offline", callback);
};

// Try Background Sync API (Chrome-only progressive enhancement)
export const registerBackgroundSync = async (tag = "sync-orders") => {
  try {
    const reg = await navigator.serviceWorker.ready;
    if ("sync" in reg) {
      await reg.sync.register(tag);
      return true;
    }
  } catch (e) {
    console.warn("Background Sync not available:", e.message);
  }
  return false;
};

// Flush queue when coming back online
export const setupAutoSync = () => {
  const handler = async () => {
    await registerBackgroundSync();
    const result = await syncOfflineData();
    if (result.synced > 0 || result.failed > 0) {
      console.info(`Offline sync: ${result.synced} synced, ${result.failed} failed`);
    }
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
};
