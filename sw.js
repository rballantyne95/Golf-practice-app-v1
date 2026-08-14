// Bump this whenever app files change so browsers install a new worker,
// cache files under a fresh name, and the activate step below wipes the
// previous version's cache. Keep in step with the ?v=N bump on HTML/JS files.
const CACHE_VERSION = "v31";
const CACHE_NAME = "golf-practice-" + CACHE_VERSION;

// Paths are relative to this file's own location (the repo root), so they
// resolve correctly whether the app is served at a domain root or under a
// GitHub Pages subfolder like /Golf-practice-app-v1/.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./practice-start.html",
  "./setup.html",
  "./build-sets.html",
  "./paste-session.html",
  "./review.html",
  "./practice.html",
  "./session-rating.html",
  "./summary.html",
  "./session-detail.html",
  "./session-edit.html",
  "./saved-sessions.html",
  "./saved-session-detail.html",
  "./stats.html",
  "./settings.html",
  "./style.css?v=31",
  "./storage.js?v=31",
  "./index.js?v=31",
  "./setup.js?v=31",
  "./build-sets.js?v=31",
  "./paste-session.js?v=31",
  "./review.js?v=31",
  "./practice.js?v=31",
  "./session-rating.js?v=31",
  "./summary.js?v=31",
  "./session-detail.js?v=31",
  "./session-edit.js?v=31",
  "./saved-sessions.js?v=31",
  "./saved-session-detail.js?v=31",
  "./stats.js?v=31",
  "./settings.js?v=31",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.png",
  "./assets/Grind-Wordmark.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Network-first: always try to fetch the latest version when online, and
// only fall back to the cached copy when the network request fails (i.e.
// offline). This keeps installed copies from getting stuck on old files.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
