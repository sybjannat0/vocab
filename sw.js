// Service Worker for VocaVera PWA
const CACHE_NAME = 'vocab-pro-v3';
const STATIC_CACHE = 'vocab-static-v3';
const DYNAMIC_CACHE = 'vocab-dynamic-v3';

// Get base path from current URL - handles subdirectories
const getBasePath = () => {
  const path = self.location.pathname;
  const lastSlash = path.lastIndexOf('/');
  return lastSlash <= 0 ? '/' : path.substring(0, lastSlash + 1);
};
const BASE_PATH = getBasePath();

const ASSETS_TO_CACHE = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'sql.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://sql.js.org/dist/sql-wasm.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.log('[SW] Cache error:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old version caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip chrome-extension and other schemes
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Different strategies based on request type
  if (request.method !== 'GET') {
    return;
  }

  // Cache-first strategy for static assets (fonts, icons, etc)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Network-first strategy for dynamic content
  event.respondWith(networkFirstStrategy(request));
});

// Check if request is for static asset
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.hostname.includes('cdnjs.cloudflare.com') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(BASE_PATH + 'index.html');
    }
    
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle background sync for vocabulary data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-vocabulary') {
    event.waitUntil(syncVocabulary());
  }
});

function syncVocabulary() {
  console.log('[SW] Syncing vocabulary data...');
  return self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ 
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let options = {
    body: event.data ? event.data.text() : 'Time to practice your vocabulary!',
    icon: createIconDataUrl('V', '#6366f1'),
    badge: createIconDataUrl('V', '#6366f1'),
    vibrate: [100, 50, 100, 50, 100],
    data: { 
      dateOfArrival: Date.now(),
      url: BASE_PATH + '?tab=practice'
    },
    actions: [
      { action: 'practice', title: 'Practice Now', icon: createIconDataUrl('▶', '#10b981') },
      { action: 'dismiss', title: 'Later' }
    ],
    tag: 'vocab-reminder',
    renotify: true,
    persistent: true
  };
  
  event.waitUntil(
    self.registration.showNotification('VocaVera - Reminder', options)
  );
});

// Create simple SVG icon data URL
function createIconDataUrl(text, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect fill="${color}" width="96" height="96" rx="16"/><text x="48" y="60" font-size="40" fill="white" text-anchor="middle">${text}</text></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();
  
  if (event.action === 'practice') {
    event.waitUntil(
      clients.openWindow(BASE_PATH + '?tab=practice')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(BASE_PATH) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(BASE_PATH);
        }
      })
    );
  }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    if (Array.isArray(urls)) {
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.addAll(urls).then(() => {
          console.log('[SW] URLs cached:', urls);
        });
      });
    }
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

function updateContent() {
  // Check for app updates
  return self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'CONTENT_UPDATE' });
    });
  });
}

console.log('[SW] Service worker loaded, base path:', BASE_PATH);
