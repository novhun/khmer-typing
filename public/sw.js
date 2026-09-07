/**
 * Typing Quest — Service Worker for 100% Offline PWA Support.
 *
 * Implements:
 * - Cache-first with background revalidation for static assets, scripts and fonts
 * - Network-first with instant offline cache fallback for HTML page navigation
 * - Automatic cache version pruning on updates
 */

const CACHE_NAME = "tq-pwa-v1";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/og-image.png",
];

// Precache essential application shell on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Precache error (non-blocking):", err);
      }),
  );
});

// Clean up stale cache versions on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Intercept fetch requests
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Ignore non-GET requests or chrome-extension URLs
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML documents)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Clone and cache the updated HTML
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline: Fall back to cached root document
          const cachedResponse =
            (await caches.match(request)) || (await caches.match("/"));
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Typing Quest — Offline</title></head><body style='font-family:sans-serif;text-align:center;padding:50px;'><h1>Offline</h1><p>Please reconnect to the internet to load Typing Quest for the first time.</p></body></html>",
            { headers: { "Content-Type": "text/html" } },
          );
        }),
    );
    return;
  }

  // 2. Google Fonts stylesheets and webfont files
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // 3. Next.js static chunks, CSS, JS, and images
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Return cached asset immediately, revalidate in background
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      }),
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});
