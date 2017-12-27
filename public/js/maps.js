let map, infoWindow;
let locations = [{lat: 24.47688, lng: 54.3533606}];
let locateButton = document.querySelector('.locateButton');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.5007, lng: -0.12406},
    zoom: 12
  });
}

function initMapGeo() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.5007, lng: -0.12406},
    zoom: 14
  });

  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);

      let marker = new google.maps.Marker({
        position: pos,
        map: map
      });

      map.setCenter(pos);
    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

locateButton.addEventListener('click', () => {
  const initScript = document.getElementById('initialMap');
  document.body.removeChild(initScript);

  let script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB51zd59N_pPiw_Qlpz1rIj-ysc4nG02no&callback=initMapGeo';

  document.body.appendChild(script);
});



// --- Putting more than one marker on map --- //

/*

// Marker clusters
let labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let markers = locations.map((location, i) => {
  return new google.maps.Marker({
    position: location,
    label: labels[i % labels.length]
  });
})

let markerCluster = new MarkerClusterer(map, markers,
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

*/
