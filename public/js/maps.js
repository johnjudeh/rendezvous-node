let map, infoWindow, pos;
let locations = [
  {lat: 24.356, lng: 54.35336840000001}
  // {lat: 24.4768583, lng: 54.35336840000001}
];
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
    zoom: 12
  });

  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);
      createMarkerClusterer();

      let midPoint = findMidPoint(locations);

      map.setCenter(midPoint);
      map.setZoom(12);

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

function createMarkerClusterer(){
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
}

function findMidPoint(locations) {
  let lats = []
  let lngs = [];
  let avgCoords = {};

  locations.forEach((location) => {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  avgCoords.lat = average(lats)
  avgCoords.lng = average(lngs)

  return avgCoords;
}

function average(arr) {
  let sum = 0;
  for (index of arr) {
    sum += index;
  }
  return sum / arr.length;
}

locateButton.addEventListener('click', () => {
  const initScript = document.getElementById('initialMap');
  document.body.removeChild(initScript);

  let scriptMap = document.createElement('script');
  scriptMap.async = true;
  scriptMap.defer = true;
  scriptMap.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB51zd59N_pPiw_Qlpz1rIj-ysc4nG02no&callback=initMapGeo';

  let scriptMarkerCluster = document.createElement('script');
  scriptMarkerCluster.src = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'

  document.body.appendChild(scriptMarkerCluster);
  document.body.appendChild(scriptMap);
});

/* Notes

0.015 -   Zoom 15
0.03  -   Zoom 14
0.06  -   Zoom 13
0.12  -   Zoom 12

*/
