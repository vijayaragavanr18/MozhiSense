// Service Worker for MozhiSense PWA
// Enables offline support and caching strategies

const CACHE_NAME = 'mohisense-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/manifest.json',
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets')
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) throw new Error('API request failed')
          
          // Cache successful API responses
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
          
          return response
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request)
        })
    )
    return
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            // Cache successful responses
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // Return offline page or cached version
            console.log('[Service Worker] Fetch failed for:', request.url)
            return caches.match(request)
          })
      })
  )
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
