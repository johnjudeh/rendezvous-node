let staticCacheName = 'rendezvous-static-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/maps',
        '/js/maps.js',
        '/css/app.css',
        '/avatars/female.png',
        '/avatars/male.png',
        '/avatars/ninja.png',
        'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css',
        'https://fonts.googleapis.com/css?family=Oleo+Script+Swash+Caps|Roboto:400,400i,500,700,700i'

        // Google API fetches return 'Access-Control-Allow-Origin' errors - should check whether Google allows caching

        // 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js',
        // 'https://developers.google.com/maps/documentation/javascript/images/marker_green',
        // 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        // 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCSV5BXC93ll0igbOw23qAAzyEjN84KtPk&libraries=places&callback=initMap'
      ])
    })
  )
});
