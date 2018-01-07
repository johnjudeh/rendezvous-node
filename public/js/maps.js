let map, infoWindow, pos, autocomplete, places;
let countryRestrict = {'country': 'uk'};
let locations = [
  {lat: 51.4955329, lng: -0.0765513 - (0.0038 * Math.pow(2, -1))}
  // {lat: 51.4955329, lng: -0.0765513}
];
let locateButton = document.querySelector('button.locateButton');
let searchButton = document.querySelector('button.search');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.5007, lng: -0.12406},
    zoom: 12
  });

  document.getElementById('map').addEventListener('click', () => {
    map.panTo({lat: 51.4955329, lng: -0.0765513 - (0.0038 * Math.pow(2, -1))})
  })
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

      let midPoint = getMidPoint(locations);
      let zoomLevel = getZoomLevel(locations);

      // console.log(zoomLevel);
      // console.log(pos);

      map.setCenter(midPoint);
      map.setZoom(zoomLevel);

    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

}

function initMapSearch() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.5007, lng: -0.12406},
    zoom: 12,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  autocomplete = new google.maps.places.Autocomplete(
      /* @type {!HTMLInputElement} */ (
        document.getElementById('autocomplete')), {
        types: [],
        // types: ['address'],
        componentRestrictions: countryRestrict
      });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
  var place = autocomplete.getPlace();

  console.dir(place.geometry.location);
  console.dir(place.geometry.location.toJSON());

  if (place.geometry.location) {
    map.panTo(place.geometry.location);
    map.setZoom(15);
    // search();
  } else {
    document.getElementById('autocomplete').placeholder = 'Enter a city';
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

function getMidPoint(locations) {
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

function getZoomLevel(locations) {

  const latIncrement = 0.00137;
  const lngIncrement = 0.0038;
  const zoomLevels = [
    18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
  ];

  let lats = [];
  let lngs = [];

  let maxLat, minLat, maxLng, minLng;
  let latRange, lngRange;
  let latZoomIndex, lngZoomIndex, latZoomLevel, lngZoomLevel;
  let zoomLevel;

  locations.forEach((location) => {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  maxLat = Math.max(...lats);
  minLat = Math.min(...lats);
  maxLng = Math.max(...lngs);
  minLng = Math.min(...lngs);

  latRange = maxLat - minLat;
  lngRange = maxLng - minLng;

  latZoomIndex = Math.round((Math.log(latRange) - Math.log(latIncrement)) / Math.log(2));
  lngZoomIndex = Math.round((Math.log(lngRange) - Math.log(lngIncrement)) / Math.log(2));

  if (latZoomIndex < 0) {
    latZoomLevel = 18;
  } else if(latZoomIndex <= 17) {
    latZoomLevel = zoomLevels[latZoomIndex];
  } else {
    latZoomLevel = 1;
  }

  if (lngZoomIndex < 0) {
    lngZoomLevel = 18;
  } else if (lngZoomIndex <= 17) {
    lngZoomLevel = zoomLevels[lngZoomIndex];
  } else {
    lngZoomLevel = 1;
  }

  zoomLevel = Math.min(latZoomLevel, lngZoomLevel);

  return zoomLevel;
}

locateButton.addEventListener('click', () => {
  let src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCSV5BXC93ll0igbOw23qAAzyEjN84KtPk&libraries=places&callback=initMapGeo';
  let scriptMap = getNewScript(src);

  let scriptMarkerCluster = document.createElement('script');
  scriptMarkerCluster.src = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'

  document.body.appendChild(scriptMarkerCluster);
  document.body.appendChild(scriptMap);
});

searchButton.addEventListener('click', () => {
  const locatorDiv = document.querySelector('.locator');
  // removes all children
  while (locatorDiv.firstChild) {
      locatorDiv.removeChild(locatorDiv.firstChild);
  }

  locatorDiv.className = 'ui input focus locator';

  let input = document.createElement('input');
  input.id = 'autocomplete';
  input.type = 'text';
  input.placeholder = 'Search for Address';

  locatorDiv.appendChild(input);

  let src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCSV5BXC93ll0igbOw23qAAzyEjN84KtPk&libraries=places&callback=initMapSearch';
  let scriptMap = getNewScript(src);

  document.body.appendChild(scriptMap);
});

function getNewScript(src) {
  const initScript = document.getElementById('initialMap');
  document.body.removeChild(initScript);

  let scriptMap = document.createElement('script');
  scriptMap.async = true;
  scriptMap.defer = true;
  scriptMap.src = src;

  return scriptMap;
}

/* Notes

Works based on height not width so sometimes width seperation uses a
zoom level that is too low (no easy fix)

0.001640625   -   Zoom 18 (used as increment)
0.015 -   Zoom 15
0.03  -   Zoom 14
0.06  -   Zoom 13
0.12  -   Zoom 12
0.21  -   Zoom 11
0.42  -   Zoom 10

*/
