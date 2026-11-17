const CACHE_NAME = 'terranep-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/nepal-districts.geojson',
  '/favicon.svg',
  '/manifest.json',
];

// Install: Cache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for app shell & map tiles
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip POST or external non-tile API mutations
  if (event.request.method !== 'GET') return;

  // Cache terrain DEM and satellite tiles so repeat map flythroughs are instant
  const isMapTile = url.hostname.includes('s3.amazonaws.com') ||
                    url.hostname.includes('maps.eox.at') ||
                    url.hostname.includes('arcgisonline.com') ||
                    url.hostname.includes('cartocdn.com');

  if (isMapTile || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
