/**
 * Nagrik Service Worker — Production Ready
 *
 * Caching strategies:
 *   - Cache-First   : /_next/static/ (hashed immutable assets), /icons/, self-hosted fonts
 *   - Stale-While-Revalidate : HTML shell routes (/category, /details, /confirmation, /)
 *   - Network-First : Everything else (safe fallback)
 *
 * Cache versioning ensures stale caches are purged on activation.
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE  = `nagrik-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `nagrik-static-${CACHE_VERSION}`;
const FONTS_CACHE  = `nagrik-fonts-${CACHE_VERSION}`;

/** URLs to precache on install (app shell) */
const SHELL_URLS = [
  "/",
  "/category",
  "/details",
  "/confirmation",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ---------------------------------------------------------------------------
// INSTALL — Precache the shell
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// ACTIVATE — Clean up old caches, claim clients
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  const validCaches = new Set([SHELL_CACHE, STATIC_CACHE, FONTS_CACHE]);

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !validCaches.has(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// FETCH — Route to appropriate strategy
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin + Google Fonts
  const isGoogleFont =
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (!isGoogleFont && url.origin !== self.location.origin) {
    return; // Let cross-origin requests pass through unmodified
  }

  // Non-GET requests always go to the network
  if (request.method !== "GET") {
    return;
  }

  // Bypass Next.js HMR, hot reloading, WebSockets, Fast Refresh, and dev-mode static files
  if (
    url.pathname.includes("webpack-hmr") ||
    url.pathname.includes("fast-refresh") ||
    url.pathname.startsWith("/_next/static/webpack/") ||
    url.pathname.startsWith("/_next/static/development/")
  ) {
    return;
  }

  // ── Strategy routing ────────────────────────────────────────────────────

  // 1. Cache-First: hashed Next.js static assets (immutable)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. Cache-First: PWA icons
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 3. Cache-First: Google Fonts (CSS descriptor + actual font files)
  if (isGoogleFont) {
    event.respondWith(cacheFirst(request, FONTS_CACHE));
    return;
  }

  // 4. Cache-First: self-hosted fonts in /fonts/
  if (url.pathname.startsWith("/fonts/")) {
    event.respondWith(cacheFirst(request, FONTS_CACHE));
    return;
  }

  // 5. Stale-While-Revalidate: HTML shell routes
  if (
    request.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/" ||
    url.pathname === "/category" ||
    url.pathname === "/details" ||
    url.pathname === "/confirmation"
  ) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // 6. Network-First with shell fallback: everything else
  event.respondWith(networkFirst(request));
});

// ---------------------------------------------------------------------------
// Strategy implementations
// ---------------------------------------------------------------------------

/**
 * Cache-First: serve from cache if available, otherwise fetch and cache.
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // No network and no cache — return empty 504
    return new Response("Network unavailable", { status: 504 });
  }
}

/**
 * Stale-While-Revalidate: serve stale cache immediately, update in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Kick off network update in background (don't await)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return stale immediately if available, else wait for network
  return cached ?? (await networkPromise) ?? new Response("Offline", { status: 503 });
}

/**
 * Network-First: try network, fall back to cache if offline.
 */
async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? new Response("Offline", { status: 503 });
  }
}
