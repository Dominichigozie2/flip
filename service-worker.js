const CACHE_NAME = "magazine-cache-v2";

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/flip/", // Updated root URL for GitHub Pages
        "/flip/index.html",
        "/flip/style.css",
        "/flip/img/PG 1.jpg",
        "/flip/img/PG2.jpg",
        "/flip/img/PG3.jpg",
        "/flip/img/PG4.jpg",
        "/flip/img/PG5.jpg",
        "/flip/img/PG6.jpg",
        "/flip/img/PG7.jpg",
        "/flip/img/PG8.jpg",
        "/flip/img/PG10.jpg",
        "/flip/img/PG 11.jpg",
        "/flip/img/PG 12.jpg",
        "/flip/img/PG13.jpg",
        "/flip/img/PG14.jpg",
        "/flip/img/PG15.jpg",
        "/flip/img/PG16.jpg",
        "/flip/img/PG17.jpg",
        "/flip/img/PG 18.jpg",
        "/flip/img/PG 19.jpg",
        "/flip/img/PG20.jpg",
        "/flip/img/BACKCOVER.jpg"
      ]).catch((error) => {
        console.error('Failed to cache assets:', error);
      });
    })
  );
});

// Fetch event - serve cached assets if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached response if available, otherwise fetch from network
      return response || fetch(event.request).catch((error) => {
        console.error('Failed to fetch:', error);
      });
    })
  );
});

// Activate event - remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete caches not in the whitelist
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).catch((error) => {
      console.error('Failed to activate service worker:', error);
    })
  );
});
