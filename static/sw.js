// Service Worker for PWA support and offline caching
const CACHE_NAME = 'papers-portal-v1.1.0'; // Version updated for error page GIF
const urlsToCache = [
  '/',
  '/offline',
  '/static/style.css',
  '/static/script.js',
  '/static/error-page.gif'
];

const externalUrls = [
  'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        
        // Cache local resources with default mode
        const localCachePromises = cache.addAll(urlsToCache);
        
        // Cache external resources with no-cors mode
        const externalCachePromises = Promise.all(
          externalUrls.map(url => {
            return fetch(new Request(url, { mode: 'no-cors' }))
              .then(response => cache.put(url, response))
              .catch(error => console.warn('Failed to cache external resource:', url, error));
          })
        );
        
        return Promise.all([localCachePromises, externalCachePromises]);
      })
      .catch(error => {
        console.error('Service worker installation failed:', error);
      })
  );
});

// Fetch from cache, fallback to network, fallback to offline page
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Try network fetch
        return fetch(event.request)
          .catch(error => {
            // Network failed, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            throw error;
          });
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
