const cacheName = 'edfi-magazine-v1';

const filesToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './swiper.min.js',
  './swiper.min.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/1.jpg',
  './img/2.jpg',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.jpg',
  './img/6.jpg',
  './img/7.jpg',
  './img/8.jpg',
  './img/9.jpg',
  './img/10.jpg',
  './img/11.jpg',
  './img/12.jpg',
  './img/13.jpg',
  './img/14.jpg',
  './img/15.jpg',
  './img/16.jpg',
  './img/17.jpg',
  './img/18.jpg',
  './img/19.jpg',
  './img/20.jpg',
  './img/21.jpg',
  './img/BACKCOVER.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});

