/* METRIC PWA shell — manifest/icons only; never cache HTML or /_next bundles. */
const CACHE = "metric-shell-v8";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"]),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => caches.open(CACHE))
      .then((cache) =>
        cache.addAll(["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"]),
      )
      .then(() => self.clients.claim()),
  );
});

function isNextAsset(url) {
  try {
    return new URL(url).pathname.startsWith("/_next/");
  } catch {
    return false;
  }
}

function isDocumentRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (isNextAsset(request.url) || isDocumentRequest(request)) {
    event.respondWith(fetch(request));
    return;
  }

  if (
    request.destination === "manifest" ||
    request.url.includes("/icons/")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(fetch(request));
});
