const CACHE_NAME = "pos-cache-v2";
const STATIC_CACHE = "pos-static-v2";
const POS_DATA_CACHE = "pos-data-v2";

const STATIC_URLS = [
  "/",
  "/login",
  "/home",
  "/dashboard-super-admin",
  "/manifest.json"
];

const CACHEABLE_API_PATTERNS = [
  "/api/pos/products",
  "/api/pos/categories",
  "/api/pos/tax-config",
  "/api/location",
  "/api/member",
  "/api/member-tier"
];

const API_PREFIX = "/api";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE && k !== POS_DATA_CACHE)
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.method === "GET") {
    if (isPOSDataRequest(url)) {
      event.respondWith(staleWhileRevalidate(request));
    } else {
      event.respondWith(networkFirst(request));
    }
  } else if (request.method !== "GET" && url.pathname.startsWith(API_PREFIX)) {
    event.respondWith(offlineQueue(request));
  }
});

function isPOSDataRequest(url) {
  return CACHEABLE_API_PATTERNS.some((pattern) => url.pathname.startsWith(pattern));
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, message: "You are offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function staleWhileRevalidate(request) {
  // ponytail: guard penuh — kegagalan cache/network tak boleh jadi unhandled rejection
  try {
    const cache = await caches.open(POS_DATA_CACHE);
    const cached = await cache.match(request);

    const networkPromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => cached);

    if (cached) {
      const age = Date.now() - (cached.headers.get("sw-cache-timestamp") || 0);
      const isStale = age > 5 * 60 * 1000; // 5 minutes
      if (!isStale) return cached;
    }

    return networkPromise;
  } catch {
    return new Response(JSON.stringify({ offline: true, message: "You are offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function offlineQueue(request) {
  try {
    return await fetch(request);
  } catch {
    const clone = request.clone();
    const body = await clone.text();
    const entry = {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()],
      body,
      timestamp: Date.now(),
      isFormData: request.headers.get("content-type")?.includes("multipart/form-data") || false
    };
    const db = await openDB();
    await db.add("syncQueue", entry);
    return new Response(JSON.stringify({ offline: true, queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("POSOfflineDB", 2);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(flushSyncQueue());
  }
});

async function flushSyncQueue() {
  try {
    const db = await openDB();
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    const items = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    for (const item of items) {
      try {
        const headers = item.headers
          ? Object.fromEntries(item.headers)
          : { "Content-Type": "application/json" };

        let body = item.body;
        if (item.isFormData && typeof body === "object" && !(body instanceof FormData)) {
          const formData = new FormData();
          Object.entries(body).forEach(([key, value]) => {
            if (value instanceof Blob) {
              formData.append(key, value, value.name);
            } else {
              formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
            }
          });
          body = formData;
          delete headers["Content-Type"];
        }

        const response = await fetch(item.url, {
          method: item.method,
          headers,
          body
        });

        if (response.ok) {
          const deleteTx = db.transaction("syncQueue", "readwrite");
          deleteTx.objectStore("syncQueue").delete(item.id);
          await new Promise((resolve, reject) => {
            deleteTx.oncomplete = resolve;
            deleteTx.onerror = reject;
          });
        }
      } catch (e) {
        console.error("Background sync fetch failed:", e);
      }
    }
  } catch (e) {
    console.error("Background sync flush error:", e);
  }
}

// Notify clients when sync completes
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});