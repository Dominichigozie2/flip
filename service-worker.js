const cacheName = 'slider-v2';
const basePath = '/flip';

const filesToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/style.css`,
  `${basePath}/script.js`,
  `${basePath}/swiper.min.js`,
  `${basePath}/swiper.min.css`,
  `${basePath}/img/1.jpg`,
  `${basePath}/img/2.jpg`,
  `${basePath}/img/3.jpg`,
  `${basePath}/img/4.jpg`,
  `${basePath}/img/5.jpg`,
  `${basePath}/img/6.jpg`,
  `${basePath}/img/7.jpg`,
  `${basePath}/img/8.jpg`,
  `${basePath}/img/9.jpg`,
  `${basePath}/img/10.jpg`,
  `${basePath}/img/11.jpg`,
  `${basePath}/img/12.jpg`,
  `${basePath}/img/13.jpg`,
  `${basePath}/img/14.jpg`,
  `${basePath}/img/15.jpg`,
  `${basePath}/img/16.jpg`,
  `${basePath}/img/17.jpg`,
  `${basePath}/img/18.jpg`,
  `${basePath}/img/19.jpg`,
  `${basePath}/img/20.jpg`,
  `${basePath}/img/21.jpg`,
  `${basePath}/img/BACKCOVER.jpg`,
  `${basePath}/icons/icon-192.png`,
  `${basePath}/icons/icon-512.png`
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
