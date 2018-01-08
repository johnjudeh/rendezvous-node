let map, infoWindow, pos, autocomplete, places;
let countryRestrict = {'country': 'uk'};
let locations = [
  // {lat: 51.4954622, lng: -0.07652579999999999},
  // {lat: 51.5051007, lng: -0.01562920000003487},
  // {lat: 51.5501741, lng: -0.003371000000015556}
  // {lat: 51.4955329 + (0.00137 * Math.pow(2, 5.4)), lng: -0.0765513 + (0.0038 * Math.pow(2, 4))},
  // {lat: 51.4955329 - (0.00137 * Math.pow(2, 4)), lng: -0.0765513 - (0.0038 * Math.pow(2, 4))}
  // {lat: 51.4955329, lng: -0.0765513}
];
let locateButton = document.querySelector('button.locateButton');
let searchButton = document.querySelector('button.search');

function initMapNew() {
  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 51.5007, lng: -0.12406},
    center: {lat: 51.509, lng: -0.116},
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false
    // zoomControl: false,
  });

  infoWindow = new google.maps.InfoWindow;

  locateButton.addEventListener('click', geolocateUser);
  searchButton.addEventListener('click', createAutocomplete);
}

function geolocateUser(infoWindow) {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);
      createMarkerClusterer();

    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function createAutocomplete(infoWindow) {
  // replaces locations buttons with search bar
  createSearchInput();

  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'), {
    types: [],
    // types: ['address'],
    componentRestrictions: countryRestrict
  });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

function createSearchInput () {
  const locatorDiv = document.querySelector('#locator');
  locatorDiv.className += ' hidden';

  const searchDiv = document.querySelector('#search');
  searchDiv.className = 'ui input focus locator';
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.5007, lng: -0.12406},
    zoom: 12
  });

  document.getElementById('map').addEventListener('click', () => {
    map.panTo({lat: 51.4955329, lng: -0.0765513 - (0.0038 * Math.pow(2, -1))})
    // map.getCenter();
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
  let place = autocomplete.getPlace();

  console.log(place.geometry.location.toJSON());

  if (place.geometry.location) {
    locations.push(place.geometry.location.toJSON());
    createMarkerClusterer();
    // map.panTo(place.geometry.location);
    // map.setZoom(15);
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

  let midPoint = getMidPoint(locations);
  let zoomLevel = getZoomLevel(locations);

  map.setCenter(midPoint);
  map.setZoom(zoomLevel);
}

function getMidPoint(locations) {
  let lats = []
  let lngs = [];
  let avgCoords = {};

  locations.forEach((location) => {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  maxLat = Math.max(...lats);
  minLat = Math.min(...lats);
  maxLng = Math.max(...lngs);
  minLng = Math.min(...lngs);

  avgCoords.lat = average([minLat, maxLat]);
  avgCoords.lng = average([minLng, maxLng]);

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

  latZoomIndex = Math.ceil((Math.log(latRange) - Math.log(latIncrement)) / Math.log(2));
  lngZoomIndex = Math.ceil((Math.log(lngRange) - Math.log(lngIncrement)) / Math.log(2));

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
