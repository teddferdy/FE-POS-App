const CACHE_NAME = "pos-cache-v1";
const STATIC_CACHE = "pos-static-v1";

const STATIC_URLS = ["/", "/login", "/pos"];

const CACHEABLE_METHODS = ["GET"];
const API_PREFIX = "/api";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE).map((k) => caches.delete(k))
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
    event.respondWith(networkFirst(request));
  } else {
    if (url.pathname.startsWith(API_PREFIX)) {
      event.respondWith(offlineQueue(request));
    } else {
      event.respondWith(fetch(request));
    }
  }
});

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
      timestamp: Date.now()
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
    const req = indexedDB.open("POSOfflineDB", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
