let staticCacheName = 'rendezvous-static-v9';
let cacheWhiteList = [
  staticCacheName
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/maps',
        '/js/maps.js',
        '/css/app.css',
        '/avatars/male.png',
        '/avatars/female.png',
        '/avatars/ninja.png',
        'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css',
        'https://fonts.googleapis.com/css?family=Oleo+Script+Swash+Caps|Roboto:400,400i,500,700,700i'

        // Google API fetches return no 'Access-Control-Allow-Origin' errors - should check whether Google allows caching

        // 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCSV5BXC93ll0igbOw23qAAzyEjN84KtPk&libraries=places&callback=initMap'
        // 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'
        // 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
        // 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'

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

//
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.open(staticCacheName).then(cache => {
//       return cache.match(event.request).then(response => {
//         // Do not need updating as they are static - except during development
//         // In development, the sw cache name should be changed for any updates
//
//         return response || fetch(event.request).then((networkResponse) => {
//           // then statement can be deleted after development
//           // console.log(networkResponse);
//           return networkResponse;
//         });
//       })
//     })
//   );
//
//   // The below is for if I want different origins to respond in different ways
//
//   // let requestURL = new URL(event.request.url);
//   //
//   // if (requestURL.origin === location.origin) {
//   //   event.respondWith(
//   //     caches.open(staticCacheName).then((cache) => {
//   //       return cache.match(event.request).then(response => {
//   //         // Do not need updating as they are static - except during development
//   //         // In development, the cache name should be changed
//   //         return response || fetch(event.request);
//   //       })
//   //     })
//   //   );
//   //   return;
//   // }
// })
//

// Awaits message to update service worker
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
})
