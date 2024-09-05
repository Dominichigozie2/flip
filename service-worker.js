const CACHE_NAME = "magazine-cache-v2";

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/", // Updated root URL for GitHub Pages
        "/index.html",
        "/style.css",
        "/img/PG 1.jpg",
        "/img/PG2.jpg",
        "/img/PG3.jpg",
        "/img/PG4.jpg",
        "/img/PG5.jpg",
        "/img/PG6.jpg",
        "/img/PG7.jpg",
        "/img/PG8.jpg",
        "/img/PG10.jpg",
        "/img/PG 11.jpg",
        "/img/PG 12.jpg",
        "/img/PG13.jpg",
        "/img/PG14.jpg",
        "/img/PG15.jpg",
        "/img/PG16.jpg",
        "/img/PG17.jpg",
        "/img/PG 18.jpg",
        "/img/PG 19.jpg",
        "/img/PG20.jpg",
        "/img/BACKCOVER.jpg"
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
