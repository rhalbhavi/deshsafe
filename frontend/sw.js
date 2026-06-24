const CACHE_NAME = 'deshsafe-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './report.html',
  './map.html',
  './helplines.html',
  './auth.html',
  './profile.html',
  './action.html',
  './css/style.css',
  './css/action.css',
  './css/auth.css',
  './css/dashboard.css',
  './css/helplines.css',
  './css/map.css',
  './css/profile.css',
  './css/report.css',
  './js/main.js',
  './js/firebase.js',
  './js/helplines.js',
  './js/map.js',
  './js/profile.js',
  './js/report.js',
  './js/storage.js',
  './data/alerts.json',
  './data/helplines.json',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const DB_NAME = 'deshsafe-db';
const STORE_NAME = 'reports-queue';

// ── Install Event ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate Event ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch Event ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip Firebase auth, firestore, socket.io, and other cross-origin write APIs
  if (
    url.hostname.includes('firebase') || 
    url.hostname.includes('googleapis') || 
    url.pathname.includes('socket.io') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Network-First strategy for HTML and local API/JSON data to ensure live updates
  const isHtmlOrData = 
    event.request.headers.get('accept')?.includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/') ||
    url.pathname.includes('/data/') ||
    url.pathname.includes('/api/');

  if (isHtmlOrData) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache clone of successful response
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('./index.html');
            }
          });
        })
    );
  } else {
    // Stale-While-Revalidate for CSS, JS, fonts, and images/icons
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => {
            // Ignore fetch errors for static assets if we have a cached version
          });
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// ── Background Sync ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    console.log('[Service Worker] Sync event triggered for reports-queue');
    event.waitUntil(syncReportsQueue());
  }
});

// ── IndexedDB Sync Runner ──
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function getQueuedReports() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function removeQueuedReport(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

async function syncReportsQueue() {
  try {
    const reports = await getQueuedReports();
    if (!reports || reports.length === 0) {
      console.log('[Service Worker] No queued reports to sync');
      return;
    }

    console.log(`[Service Worker] Syncing ${reports.length} queued report(s)...`);

    for (const item of reports) {
      const { report, apiBase, authToken } = item;

      // Map frontend values to backend schema
      const typeMapping = {
        'heatwave': 'heatwave',
        'flood': 'flood',
        'fire': 'fire',
        'storm / cyclone': 'cyclone',
        'building collapse': 'other',
        'other crisis': 'other'
      };
      const mappedType = typeMapping[(report.type || '').toLowerCase()] || 'other';

      const payload = {
        type: mappedType,
        severity: report.severity || 'medium',
        description: `${report.title || 'No Title'}\n\n${report.description || ''}`.trim(),
        location: {
          lat: report.lat || 0,
          lng: report.lng || 0,
          address: report.location || 'Unknown',
          district: report.district || null,
          state: report.state || null
        },
        photoUrl: report.photo || null
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      try {
        const res = await fetch(`${apiBase}/api/reports`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (res.status === 201 || res.status === 200) {
          console.log(`[Service Worker] Successfully synced report: ${item.id}`);
          await removeQueuedReport(item.id);
        } else if (res.status === 401 || res.status === 403) {
          // Token expired. Do NOT delete the report; let main page refresh token and try again.
          console.warn(`[Service Worker] Auth error (status ${res.status}) syncing report: ${item.id}. Keeping in queue.`);
        } else {
          // Server error or validation error. Keep in queue to retry.
          console.warn(`[Service Worker] Server returned status ${res.status} for report: ${item.id}. Keeping in queue.`);
        }
      } catch (err) {
        console.error(`[Service Worker] Network error while syncing report: ${item.id}`, err);
        throw err; // throw to trigger sync retry by browser
      }
    }
  } catch (err) {
    console.error('[Service Worker] Error during syncReportsQueue:', err);
    throw err;
  }
}
