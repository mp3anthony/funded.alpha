const CACHE_NAME = 'funded-pwa-cache-v3';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  '/',
  OFFLINE_URL,
  '/manifest.json?v=2',
  '/favicon.ico',
  '/icons/icon-192x192.png?v=2',
  '/icons/icon-512x512.png?v=2',
  '/icons/logo-icon.svg',
  '/icons/logo-wordmark.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force cache setup, ignoring errors for non-existent files if in development
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Pre-caching assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Avoid caching third-party or DB requests
  const url = event.request.url;
  if (url.includes('/supabase.co') || url.includes('/auth/v1') || url.includes('localhost:3000/_next/webpack-hmr')) {
    return;
  }

  // Handle page navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest online page
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => {
          // Try loading from cache first
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If the route is not cached, return the offline fallback page
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Serve static assets or fetch and cache on the fly
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache assets from the same origin that are successful
        if (response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(() => {
        // Fallback for missing images/resources if needed
        return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'New Notification';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/icons/icon-192x192.png?v=2',
      badge: '/icons/logo-icon.svg',
      data: payload.data || { url: '/' },
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (e) {
    console.error('Push payload parsing failed', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, check if any window is open and focus it, then navigate
      if (windowClients.length > 0) {
         const client = windowClients[0];
         if ('focus' in client) {
           client.focus();
           return client.navigate(urlToOpen);
         }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
