/* METRIC PWA shell — manifest/icons only; never intercept HTML, CSS, or /_next. */
const CACHE = "metric-shell-v12";

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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Only mediate shell assets. Pass everything else to the browser so a CDN
  // 403/network blip cannot surface as an Uncaught SW promise rejection.
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
  }
});
