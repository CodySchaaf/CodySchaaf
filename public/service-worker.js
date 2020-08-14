var cacheName = "sgtoilet-cache-" + Date.now();
var filesToCache = [
  "/",
  "/index.html",
  "/global.css",
  "/build/bundle.css",
  "/build/bundle.js",
  "/fonts/open-sans-latin-700.woff2",
  "/fonts/open-sans-latin-400.woff2"
];
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(thisCacheName) {
          if (thisCacheName !== cacheName) {
            return caches.delete(thisCacheName);
          }
        })
      );
    })
  );
});
self.addEventListener("fetch", e => {
  e.respondWith(
    (async function() {
      const response = await caches.match(e.request);
      return response || fetch(e.request);
    })()
  );
});
