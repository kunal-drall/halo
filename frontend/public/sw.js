// Service Worker for Halo Protocol PWA
const CACHE_NAME = 'halo-protocol-v1';
const STATIC_CACHE = 'halo-static-v1';
const DYNAMIC_CACHE = 'halo-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/discover',
  '/create',
  '/wallet',
  '/profile',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache install failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same-origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else if (url.hostname.includes('solana.com') || url.hostname.includes('api.mainnet-beta.solana.com')) {
    // Solana RPC requests - cache with short TTL
    event.respondWith(handleRPCRequest(request));
  } else {
    // External requests - network first
    event.respondWith(handleExternalRequest(request));
  }
});

// Handle same-origin requests (pages, assets)
async function handleSameOriginRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Same-origin request failed', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Handle RPC requests with short cache TTL
async function handleRPCRequest(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      const cacheTime = cachedResponse.headers.get('sw-cache-time');
      if (cacheTime && Date.now() - parseInt(cacheTime) < 10000) { // 10 second TTL
        return cachedResponse;
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Add cache timestamp
      const responseWithTime = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'sw-cache-time': Date.now().toString()
        }
      });
      
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseWithTime.clone());
      
      return responseWithTime;
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: RPC request failed', error);
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle external requests
async function handleExternalRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Service Worker: External request failed', error);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'contribution-sync') {
    event.waitUntil(syncContributions());
  } else if (event.tag === 'payout-sync') {
    event.waitUntil(syncPayouts());
  }
});

// Sync contributions when back online
async function syncContributions() {
  try {
    // Get pending contributions from IndexedDB
    const pendingContributions = await getPendingContributions();
    
    for (const contribution of pendingContributions) {
      try {
        // Retry the contribution
        await retryContribution(contribution);
        // Remove from pending
        await removePendingContribution(contribution.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync contribution', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Contribution sync failed', error);
  }
}

// Sync payouts when back online
async function syncPayouts() {
  try {
    // Get pending payouts from IndexedDB
    const pendingPayouts = await getPendingPayouts();
    
    for (const payout of pendingPayouts) {
      try {
        // Retry the payout claim
        await retryPayoutClaim(payout);
        // Remove from pending
        await removePendingPayout(payout.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync payout', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Payout sync failed', error);
  }
}

// Push notifications for important events
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Halo Protocol',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Halo Protocol', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for IndexedDB operations
async function getPendingContributions() {
  // Implementation would use IndexedDB to get pending contributions
  return [];
}

async function removePendingContribution(id) {
  // Implementation would use IndexedDB to remove pending contribution
}

async function getPendingPayouts() {
  // Implementation would use IndexedDB to get pending payouts
  return [];
}

async function removePendingPayout(id) {
  // Implementation would use IndexedDB to remove pending payout
}

async function retryContribution(contribution) {
  // Implementation would retry the contribution transaction
}

async function retryPayoutClaim(payout) {
  // Implementation would retry the payout claim transaction
}

