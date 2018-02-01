const staticCacheName = 'rendezvous-static-v3';
const cacheWhiteList = [ staticCacheName ];

// Event fires when service worker is first discovered
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/maps',
        '/register',
        '/login',
        '/js/maps.js',
        '/js/register.js',
        '/js/sw/index.js',
        '/css/app.css',
        '/css/landing.css',
        '/avatars/male.png',
        '/avatars/female.png',
        '/avatars/ninja.png',
        '/imgs/landing.jpg',
        'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css',
        'https://fonts.googleapis.com/css?family=Oleo+Script+Swash+Caps|Roboto:400,400i,500,700,700i',
        'https://code.jquery.com/jquery-3.2.1.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.js'
      ]);
    })
  );
});

// Event fires when new sw is intalled and ready to take over page
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => {
        return !cacheWhiteList.includes(cacheName);
      }).map(cacheName => {
        console.log('Deleting:', cacheName);
        return caches.delete(cacheName);
      })
    })
  );
})

// Handles how a page makes fetch requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(staticCacheName).then(cache => {
      return cache.match(event.request).then(response => {
        // Do not need updating as they are static
        return response || fetch(event.request);
      })
    })
  );
})

// Awaits message to update service worker
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
})
