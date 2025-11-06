// Service Worker for PWA support and offline caching
const CACHE_NAME = 'papers-portal-v1';
const urlsToCache = [
  '/',
  '/static/style.css',
  '/static/script.js',
  'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => {
          // Handle external URLs properly
          return new Request(url, { mode: 'no-cors' });
        }));
      })
      .catch(error => {
        console.error('Cache failed:', error);
      })
  );
});

// Fetch from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update service worker and clear old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
