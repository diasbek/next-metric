/* METRIC installability SW — network-first; never serve HTML for /_next assets. */
const CACHE = "metric-shell-v4";

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
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
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
  return (
    request.mode === "navigate" ||
    request.destination === "document"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Scripts/styles/fonts from the app build must never fall back to HTML.
  if (isNextAsset(request.url)) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response.ok &&
          request.url.startsWith(self.location.origin) &&
          (isDocumentRequest(request) ||
            request.destination === "manifest" ||
            request.url.includes("/icons/"))
        ) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        if (isDocumentRequest(request)) {
          return caches.match(request).then((cached) => cached || caches.match("/"));
        }
        return caches.match(request);
      }),
  );
});
